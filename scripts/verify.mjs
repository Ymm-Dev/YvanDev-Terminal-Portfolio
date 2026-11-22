import { firefox } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await firefox.launch();
const failures = [];
const notes = [];

const THEMES = {
  midnight: { bg: "#0a0b0d", scheme: "dark" },
  paper: { bg: "#f4efe4", scheme: "light" },
  amber: { bg: "#100d08", scheme: "dark" },
  cobalt: { bg: "#070b14", scheme: "dark" },
};

function luminance(hex) {
  const value = String(hex).trim().replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const channels = [0, 2, 4]
    .map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  if (a === null || b === null) return null;
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

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

  for (const command of [
    "recruiter",
    "projects",
    "about",
    "experience",
    "help",
    "theme",
    "games",
    "snake",
    "tictactoe",
    "2048",
  ]) {
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

/* ------------------------------ themes ------------------------------ */

{
  const { context, page, errors } = await pageAt(1280, 900);
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  for (const [name, expected] of Object.entries(THEMES)) {
    await page.fill("#terminal-input", `theme ${name}`);
    await page.press("#terminal-input", "Enter");
    await page.waitForTimeout(250);

    const state = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const tokens = {};
      for (const token of ["bg", "surface-2", "ink", "muted", "green"]) {
        tokens[token] = style.getPropertyValue(`--color-${token}`).trim();
      }
      return {
        attr: document.documentElement.dataset.theme ?? "midnight",
        scheme: style.colorScheme,
        stored: window.localStorage.getItem("yvan-portfolio-theme"),
        meta: document
          .querySelector('meta[name="theme-color"]')
          ?.getAttribute("content"),
        tokens,
      };
    });

    assert(state.attr === name, `theme ${name}: data-theme is ${state.attr}`);
    assert(
      state.scheme === expected.scheme,
      `theme ${name}: color-scheme is ${state.scheme}`,
    );
    assert(state.stored === name, `theme ${name}: stored ${state.stored}`);
    assert(
      state.meta === expected.bg,
      `theme ${name}: meta theme-color is ${state.meta}`,
    );

    const pairs = [
      ["body", state.tokens.ink, state.tokens.bg],
      ["muted", state.tokens.muted, state.tokens.bg],
      ["accent", state.tokens.green, state.tokens.bg],
      ["band", state.tokens.ink, state.tokens["surface-2"]],
    ];
    for (const [label, foreground, background] of pairs) {
      const ratio = contrastRatio(foreground, background);
      assert(
        ratio !== null && ratio >= 4.5,
        `theme ${name}: ${label} contrast is ${ratio}`,
      );
    }
  }

  // The saved theme is on <html> before the app hydrates: reload, then read it
  // at DOMContentLoaded without waiting for the network to go idle.
  await page.fill("#terminal-input", "theme paper");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(250);
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "domcontentloaded" });
  const early = await page.evaluate(() => ({
    attr: document.documentElement.dataset.theme,
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  assert(early.attr === "paper", `pre-paint theme is ${early.attr}`);
  assert(
    early.bg === "rgb(244, 239, 228)",
    `pre-paint body background is ${early.bg}`,
  );
  await page.waitForSelector("#terminal-input", { timeout: 5000 });

  // The title-bar control opens the picker.
  await page.locator('button[aria-label^="Change theme"]').click();
  await page.waitForTimeout(400);
  assert(
    (await page.locator("#panel-theme").count()) === 1,
    "title-bar theme control did not open the panel",
  );

  // Activating a card applies the theme and keeps focus inside the panel.
  await page.locator('#panel-theme button[data-theme="amber"]').click();
  await page.waitForTimeout(300);
  const afterCard = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    inPanel: Boolean(document.activeElement?.closest("#panel-theme")),
  }));
  assert(afterCard.theme === "amber", `theme card applied ${afterCard.theme}`);
  assert(afterCard.inPanel, "focus left the theme panel after activation");

  assert(errors.length === 0, `theme console errors: ${errors.join(" | ")}`);
  notes.push("themes ok");
  await context.close();
}

/* ------------------------------ arcade ------------------------------ */

{
  const { context, page, errors } = await pageAt(1280, 900);
  await page.goto(`${BASE}?noBoot=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  await page.fill("#terminal-input", "games");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(400);
  assert(
    (await page.locator("#panel-games").count()) === 1,
    "games did not open the arcade",
  );
  for (const label of ["Snake", "Tic-Tac-Toe", "2048"]) {
    assert(
      (await page.locator(`#panel-games button:has-text("${label}")`).count()) >= 1,
      `arcade card missing: ${label}`,
    );
  }

  // Snake: starts, steers, pauses with Space, and releases focus with Escape.
  await page.locator('#panel-games button:has-text("Snake")').click();
  await page.waitForTimeout(400);
  assert(
    (await page.locator("#panel-snake").count()) === 1,
    "snake panel did not open",
  );
  assert(
    (await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) ===
      "Snake board",
    "snake board did not take focus",
  );
  await page.locator("#panel-snake button", { hasText: /^Start$/ }).click();
  await page.waitForTimeout(150);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(250);
  await page.keyboard.press(" ");
  await page.waitForTimeout(150);
  assert(
    (await page.locator("#panel-snake [data-testid='snake-status']").textContent()) ===
      "paused",
    "space did not pause snake",
  );
  await page.keyboard.press("Escape");
  assert(
    (await page.evaluate(() => document.activeElement?.id)) === "terminal-input",
    "Escape did not release snake focus",
  );

  // Tic-Tac-Toe: the visitor moves and the shell answers.
  await page.fill("#terminal-input", "tictactoe");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(400);
  await page
    .locator('#panel-tictactoe button[aria-label^="Row 2, column 2"]')
    .click();
  await page.waitForTimeout(700);
  const marks = await page
    .locator("#panel-tictactoe [aria-label^='Row']")
    .allTextContents();
  assert(
    marks.includes("X") && marks.includes("O"),
    `tic-tac-toe marks: ${marks.join(",")}`,
  );

  // 2048: try each direction until the board or score changes.
  await page.fill("#terminal-input", "2048");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(400);
  const before = await page.locator("#panel-2048").innerText();
  for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"]) {
    await page.keyboard.press(key);
    await page.waitForTimeout(150);
    if ((await page.locator("#panel-2048").innerText()) !== before) break;
  }
  assert(
    (await page.locator("#panel-2048").innerText()) !== before,
    "2048 ignored direction keys",
  );

  assert(errors.length === 0, `arcade console errors: ${errors.join(" | ")}`);
  notes.push("arcade ok");
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

  // Themes and games remain usable without motion.
  await page.fill("#terminal-input", "theme paper");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(250);
  assert(
    (await page.evaluate(() => document.documentElement.dataset.theme)) === "paper",
    "reduced-motion theme change did not apply",
  );

  await page.fill("#terminal-input", "2048");
  await page.press("#terminal-input", "Enter");
  await page.waitForTimeout(400);
  const before = await page.locator("#panel-2048").innerText();
  for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"]) {
    await page.keyboard.press(key);
    await page.waitForTimeout(150);
    if ((await page.locator("#panel-2048").innerText()) !== before) break;
  }
  assert(
    (await page.locator("#panel-2048").innerText()) !== before,
    "reduced motion blocked 2048 input",
  );

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

  for (const hash of ["#theme", "#games", "#snake", "#tictactoe", "#2048"]) {
    await page.goto(`${BASE}${hash}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    assert(
      (await page.locator(`#panel-${hash.slice(1)}`).count()) === 1,
      `${hash} did not open cold`,
    );
  }
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
