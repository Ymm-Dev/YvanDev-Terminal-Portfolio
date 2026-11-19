import { firefox } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await firefox.launch();
const failures = [];
const notes = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function pageAt(width, height, extraContext = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    ...extraContext,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return { context, page, errors };
}

async function overflow(page) {
  return page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
  }));
}

/* ------------------------- responsive widths ------------------------- */

for (const width of [320, 375, 390, 768, 1024, 1440]) {
  const { context, page, errors } = await pageAt(width, 900);
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  let size = await overflow(page);
  assert(size.doc <= size.win + 1, `${width}px home overflows (${size.doc} > ${size.win})`);

  for (const command of ["recruiter", "projects", "about", "experience", "help"]) {
    await page.fill("#terminal-input", command);
    await page.press("#terminal-input", "Enter");
    await page.waitForTimeout(450);
    size = await overflow(page);
    assert(
      size.doc <= size.win + 1,
      `${width}px ${command} overflows (${size.doc} > ${size.win})`,
    );
  }

  assert(errors.length === 0, `${width}px console errors: ${errors.join(" | ")}`);
  notes.push(`${width}px ok`);
  await context.close();
}

/* ----------------------------- keyboard ------------------------------ */

{
  const { context, page, errors } = await pageAt(1280, 900);
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Welcome shortcuts run recruiter, about, projects in that order.
  const quickLabels = await page.locator("#panel-welcome button").allTextContents();
  const recruiterAt = quickLabels.findIndex((text) => text.includes("Recruiter brief"));
  const aboutAt = quickLabels.findIndex((text) => text.includes("About"));
  const projectsAt = quickLabels.findIndex((text) => text.includes("Projects"));
  assert(
    recruiterAt > -1 && aboutAt === recruiterAt + 1 && projectsAt === aboutAt + 1,
    `welcome shortcut order is ${quickLabels.join(" | ")}`,
  );

  // Skip link becomes visible on focus and points at the input.
  await page.keyboard.press("Tab");
  const skip = page.locator("a", { hasText: "Skip to terminal input" });
  assert(await skip.isVisible(), "skip link not visible on first Tab");
  const href = await skip.getAttribute("href");
  assert(href === "#terminal-input", `skip link href is ${href}`);

  // Enter on the skip link moves focus to the input.
  await page.keyboard.press("Enter");
  assert(
    (await page.evaluate(() => document.activeElement?.id)) === "terminal-input",
    "skip link did not focus the terminal input",
  );

  // Typing + Enter runs a command.
  await page.keyboard.type("skills");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  assert(await page.locator("#panel-skills").count() === 1, "Enter did not open skills");

  // Tab completion: "pro" -> "projects ".
  await page.fill("#terminal-input", "pro");
  await page.press("#terminal-input", "Tab");
  assert(
    (await page.inputValue("#terminal-input")).trim() === "projects",
    `tab completion gave "${await page.inputValue("#terminal-input")}"`,
  );

  // History recall with ArrowUp.
  await page.keyboard.press("ArrowUp");
  assert(
    (await page.inputValue("#terminal-input")) === "skills",
    "ArrowUp did not recall history",
  );

  // Ctrl+L clears the input (and history stays).
  await page.keyboard.press("Control+l");
  assert((await page.inputValue("#terminal-input")) === "", "Ctrl+L did not clear input");

  // Esc blurs.
  await page.keyboard.press("Escape");
  assert(
    (await page.evaluate(() => document.activeElement?.id)) !== "terminal-input",
    "Escape did not blur the input",
  );

  // Chat mode: `chat`, type, Esc returns to shell prompt.
  await page.fill("#terminal-input", "chat");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(500);
  await page.fill("#terminal-input", "hello");
  await page.keyboard.press("Escape");
  assert(
    await page.getByText("yvan@portfolio:~$").last().isVisible(),
    "Esc did not leave chat mode",
  );

  // Generic panel controls are real buttons, not divs.
  await page.fill("#terminal-input", "projects");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(500);
  const inspect = page.locator("#panel-projects button", { hasText: "inspect" }).first();
  assert(await inspect.isVisible(), "inspect button missing");
  await inspect.click();
  await page.waitForTimeout(400);
  assert(
    (await page.locator('[id^="panel-project-"]').count()) === 1,
    "clicking inspect did not open a detail panel",
  );

  // Every project exposes a real repository link, and no pending chip remains.
  await page.fill("#terminal-input", "projects");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(500);
  assert(
    (await page.locator("#panel-projects .pending").count()) === 0,
    "repo: pending chips should be gone",
  );
  const repoLinks = page.locator('#panel-projects a.link-action[href^="https://github.com/Ymm-Dev/"]');
  assert(
    (await repoLinks.count()) >= 6,
    "project repo links missing",
  );
  assert(
    (await page.locator('#panel-projects a[href="https://chik-ai.vercel.app"]').count()) >= 1,
    "ChikAI live link missing",
  );
  assert(
    (await page.locator('#panel-projects a[href="https://bantay-mu.vercel.app"]').count()) >= 1,
    "Bantay live link missing",
  );
  assert(
    (await page.locator('[aria-label="Availability: Open to work"]').count()) >= 1,
    "availability badge missing",
  );

  assert(errors.length === 0, `keyboard console errors: ${errors.join(" | ")}`);
  notes.push("keyboard ok");
  await context.close();
}

/* ------------------------------ boot -------------------------------- */

{
  const { context, page, errors } = await pageAt(1280, 900);

  // First load: the boot sequence runs, and a visible skip control exists.
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const skipIntro = page.getByRole("button", { name: /skip intro/i });
  assert(await skipIntro.isVisible().catch(() => false), "skip intro button missing during boot");
  await page.getByText("./init --profile=yvan").waitFor({ timeout: 2000 });
  assert(
    (await page.getByText("./init --profile=yvan").count()) === 1,
    "boot did not start on first load",
  );
  await page.waitForSelector("#panel-welcome", { timeout: 5000 });

  // Reload: boot replays instead of being skipped by session state.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("./init --profile=yvan").waitFor({ timeout: 2000 });
  assert(
    (await page.getByText("./init --profile=yvan").count()) === 1,
    "boot did not replay on reload",
  );
  assert(
    await page.getByRole("button", { name: /skip intro/i }).isVisible().catch(() => false),
    "skip intro button missing after reload",
  );
  await page.waitForSelector("#panel-welcome", { timeout: 5000 });

  // Skip: lands on the welcome panel without waiting for the sequence.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page
    .getByRole("button", { name: /skip intro/i })
    .dispatchEvent("click");
  await page.waitForSelector("#panel-welcome", { timeout: 1500 });

  assert(errors.length === 0, `boot console errors: ${errors.join(" | ")}`);
  notes.push("boot replay and skip ok");
  await context.close();
}

/* ------------------------- reduced motion --------------------------- */

{
  const { context, page } = await pageAt(1280, 900, { reducedMotion: "reduce" });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  const bootLine = await page.getByText("./init --profile=yvan").count();
  const welcome = await page.locator("#panel-welcome").count();
  assert(welcome === 1, "reduced-motion load did not land on welcome");
  assert(bootLine === 0, "reduced-motion load still typed the boot lines");
  notes.push("reduced motion ok");
  await context.close();
}

/* --------------------------- deep links ----------------------------- */

{
  const { context, page } = await pageAt(1280, 900);
  await page.goto(`${BASE}#recruiter`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  assert(await page.locator("#panel-recruiter").count() === 1, "#recruiter did not open cold");
  assert(
    (await page.getByText("./init --profile=yvan").count()) === 0,
    "cold deep link still ran the boot animation",
  );
  await page.goto(`${BASE}#projects/aqro`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  assert(
    await page.locator("#panel-project-aqro").count() === 1,
    "#projects/aqro did not open the detail panel",
  );
  // A same-document hash change to an unknown route is ignored by design, so
  // check the cold-load path on a fresh document.
  await page.goto(`${BASE}?cold=1#nonsense`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  assert(
    await page.locator("#panel-welcome").count() === 1,
    "unknown hash did not fall back to welcome",
  );
  notes.push("deep links ok");
  await context.close();
}

/* ------------------------------ print ------------------------------- */

{
  const { context, page } = await pageAt(1280, 900);
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.emulateMedia({ media: "print" });
  const printVisible = await page.locator(".print-only .print-brief").first().isVisible();
  const terminalVisible = await page.locator(".terminal-shell").isVisible();
  assert(printVisible, "print brief not visible in print media");
  assert(!terminalVisible, "terminal still visible in print media");
  notes.push("print ok");
  await context.close();
}

/* ------------------------- offline chat path ------------------------ */

{
  const { context, page } = await pageAt(1280, 900);
  // The repo's own .env.local has a live key, so simulate an unconfigured
  // deployment here to keep the offline path covered.
  await page.route("**/api/chat/health", (route) =>
    route.fulfill({
      json: { ok: false, provider: "offline", model: null, configured: false },
    }),
  );
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "offline" }),
    }),
  );
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.fill("#terminal-input", "chat");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(500);
  const offlineBanner = await page.getByText("ai-twin: offline").count();
  assert(offlineBanner > 0, "offline banner missing in chat panel");
  const startersDisabled = await page
    .locator("#panel-chat button", { hasText: "Tell me about yourself." })
    .isDisabled();
  assert(startersDisabled, "suggested questions should be disabled while offline");

  // Sending anyway reaches the 503 path and renders the honest fallback.
  await page.fill("#terminal-input", "What do you do?");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(700);
  assert(
    (await page.getByText("isn't connected right now").count()) > 0,
    "offline send did not render the fallback reply",
  );
  notes.push("offline chat ok");
  await context.close();
}

/* ---------------------- simulated upstream errors ------------------- */

{
  const { context, page } = await pageAt(1280, 900);
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "rate_limited", retryAfter: 30 }),
      headers: { "retry-after": "30" },
    }),
  );
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.fill("#terminal-input", "chat");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(400);
  await page.fill("#terminal-input", "Tell me about the projects.");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(700);
  assert(
    (await page.getByText("rate-limited right now").count()) > 0,
    "429 did not render the rate-limit message",
  );
  notes.push("simulated 429 ok");
  await context.close();
}

/* ------------------------ simulated API 5xx ------------------------- */

{
  const { context, page } = await pageAt(1280, 900);
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "upstream" }),
    }),
  );
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.fill("#terminal-input", "chat");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(400);
  await page.fill("#terminal-input", "Hello");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(700);
  assert(
    (await page.getByText("connection dropped").count()) > 0,
    "5xx did not render the connection error",
  );
  notes.push("simulated 502 ok");
  await context.close();
}

await browser.close();

console.log(notes.join("\n"));
if (failures.length) {
  console.error("\nFAILURES:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log("\nall checks passed");
