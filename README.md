# Yvan Maribbay — interactive terminal portfolio

A developer portfolio that behaves like a shell. Visitors type commands (or click
shortcuts) and the output is rich, interactive HTML panels: projects, experience,
skills, a recruiter brief, an AI twin, four themes, and a small arcade.

Source: <https://github.com/Ymm-Dev/YvanDev-Terminal-Portfolio>
Live: <https://ymmdev-terminal.vercel.app/>

- **Terminal-first.** There is no separate "normal" portfolio page. The shell is
  the interface; the panels are the content.
- **Every command is clickable.** Visitors never need to type to reach a section.
- **Four complete themes.** Midnight, Paper, Amber, and Cobalt. The choice is
  saved locally and applied before the first paint, so reloads never flash the
  wrong palette.
- **A terminal arcade.** Snake, Tic-Tac-Toe against a perfect minimax opponent,
  and 2048 — all playable with keyboard, pointer, or touch.
- **AI twin with an honest failure mode.** With a Gemini key the twin streams
  answers from Yvan's profile. Without a key it says so plainly and points to
  `contact` — it never fakes a conversation.
- **Accessible and printable.** Keyboard navigation, skip link, live
  announcements, `prefers-reduced-motion` support, WCAG AA contrast in every
  theme, and a dedicated one-page print brief.

## Tech stack

- Next.js 16 (App Router) and React 19
- TypeScript and Tailwind CSS v4
- Gemini via `@google/genai`, with a server-only streaming route
- Zod for request validation
- Vitest and Testing Library; Playwright for UI smoke checks

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. No environment variables are required: with no key
the AI twin runs in labelled offline mode.

Other scripts:

```bash
npm run lint        # ESLint (Next.js flat config)
npm run typecheck   # tsc --noEmit
npm test            # Vitest unit tests
npm run build       # production build
npm start           # serve the production build
```

### UI smoke checks (optional)

`scripts/verify.mjs` drives Firefox through the release criteria: no horizontal
overflow at 320–1440px, keyboard-only operation, theme persistence and contrast,
arcade keyboard/touch input, reduced motion, cold deep links, print output, the
offline twin, and simulated 429/502 responses.

```bash
npx playwright install firefox   # once
npm run build && npm start       # terminal 1
npm run test:ui                  # terminal 2
```

Set `BASE` to test another origin, for example `BASE=http://localhost:3100 npm run test:ui`.

## Themes

Four palettes ship with the shell:

| Theme | Command | Character |
| --- | --- | --- |
| Midnight | `theme midnight` | The original dark shell (default). |
| Paper | `theme paper` | Warm light paper with dark ink. |
| Amber | `theme amber` | Near-black CRT with amber text. |
| Cobalt | `theme cobalt` | Deep blue-black with icy, high-contrast text. |

Run `theme` with no argument (or use the title-bar control) to open the picker.
Each card previews its palette and marks the current theme. The title-bar button
is icon-first on small screens and includes the current theme in its accessible
name.

The choice is stored in `localStorage` under `yvan-portfolio-theme` and applied
by a tiny inline script before the first paint. `applyTheme()` also updates
`color-scheme` and `<meta name="theme-color">`, so browser chrome follows the
palette. If storage is unavailable, the theme still applies for the session and
the page never crashes. `prefers-reduced-motion` removes the 150 ms color
transition. Body, muted, accent, and band text meet WCAG AA contrast in every
theme, which the browser suite verifies.

## Arcade

| Command | Game |
| --- | --- |
| `games` (also `arcade`, `play`) | The arcade panel with all three games. |
| `snake` | Snake on a 20 × 14 grid. |
| `tictactoe` (also `ttt`) | Tic-Tac-Toe. You are X, and the shell uses minimax. |
| `2048` (also `twenty48`) | 2048 on a 4 × 4 board. |

Games open as inline panels in the scrollback — no modal, no second route. The
board takes focus when the panel opens, so arrow keys and WASD steer instead of
moving the terminal history or the page. Every game also exposes real buttons
and a 44 px direction pad where relevant, so pointer and touch play work without
a keyboard.

- **Snake:** Start, steer, eat, grow. Space pauses; Escape pauses and returns
  focus to the prompt. The game pauses itself when the tab is hidden or the
  window loses focus.
- **Tic-Tac-Toe:** Nine labelled buttons in a 3 × 3 grid. You always move first;
  the shell answers after a short delay. Wins, draws, and losses are tallied for
  the session.
- **2048:** Equal tiles merge once per move and score their face value. Reaching
  2048 announces a win but keeps the board playable; a locked board ends the
  round. No tile-slide animation is required to follow the game.

Snake and 2048 best scores are stored locally under `yvan-best-snake` and
`yvan-best-2048`. Nothing else is saved: no in-progress games, accounts,
leaderboards, telemetry, or network play. Game state resets on reload.

## Commands

| Command | Purpose |
| --- | --- |
| `help` | List every command by category. |
| `about`, `skills`, `projects`, `experience`, `education`, `contact` | Portfolio panels. |
| `projects <slug>` | Open one project detail. |
| `recruiter` | The 40-second recruiter brief. |
| `resume` | Download the PDF résumé. |
| `chat` (also `ai`, `ask`) | Talk to the AI twin. |
| `theme [name]` | Open the picker or apply a named theme. |
| `games`, `snake`, `tictactoe`, `2048` | The arcade. |
| `whoami`, `neofetch`, `ls`, `history` | Profile and shell information. |
| `clear` | Clear the scrollback. |
| `coffee`, `sudo hire-me` | Easter eggs. |

`↑`/`↓` recall history, `Tab` completes commands, and `Ctrl+L` clears the input.
`help` stays the source of truth, and every command is also clickable below the
prompt.

## AI twin configuration

Copy `.env.example` to `.env.local` (never commit it) and restart the dev server.

| Variable | Purpose |
| --- | --- |
| `AI_PROVIDER` | `offline` (default example) or `gemini`. Unset means "Gemini if a key exists, otherwise offline". |
| `GEMINI_API_KEY` | Google AI Studio key. Server-only; never prefix with `NEXT_PUBLIC_`. |
| `GEMINI_MODEL` | Optional model override. Defaults to `gemini-3.1-flash-lite` (Gemini retires older IDs for new API keys, so update this if you see a 404). |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL used for metadata and Open Graph. |

The key is read only in `app/api/chat/route.ts` and `lib/ai/gemini.ts`. The
browser talks to `/api/chat`; it never sees the key. `/api/chat/health` returns
only `{ ok, provider, model, configured }`.

### Swap the model

Set `GEMINI_MODEL` to any text model available to your key. Nothing else changes.
The provider interface lives in `lib/ai/provider.ts`; adding another vendor means
implementing `ChatProvider` and returning it from `getProvider()`.

### Offline mode

`lib/ai/offline.ts` holds the single source of the fallback message. The UI shows
an `ai-twin: offline` badge in the title bar and in the chat panel, disables the
suggested questions, and still lets visitors send a message — the reply explains
that no model is connected and lists the fastest ways to read the portfolio.

## Rate limits

`lib/ai/rate-limit.ts` implements a sliding window: 10 requests/minute and
40/hour per hashed IP, plus 300/hour globally. IPs are hashed before use.

The store is in process memory, which means each server instance has its own
counters. That is acceptable for a personal site on a single instance, but on a
horizontally scaled deploy switch the store to Upstash Redis (or similar) without
changing the call sites. The comment in the module marks the seam.

## Content

`data/profile.ts` is the only source of facts. The UI, the AI system prompt, the
static `<noscript>` profile, and the print brief all read from it.

- Keep the prose factual. Never invent a metric, employer, date, technology, or
  link.
- Every project links to its public GitHub repository. ChikAI and Bantay also
  link to their live demos.
- Availability is published as “Open to work”, so the title bar, welcome panel,
  recruiter brief, print brief, `neofetch`, and the AI twin all report it.
  Setting `availability.published` to `false` hides it everywhere.

## Personal assets

The portrait, logo, and résumé are committed under `public/yvan/` so the site
serves them directly:

```text
public/yvan/profile.png
public/yvan/logo.png
public/yvan/yvan-maribbay-resume.pdf
```

They are personal content. The MIT license covers the source code; these files
are copyright Yvan Maribbay and are not licensed for reuse.

## Print

`Ctrl/Cmd + P` prints `components/PrintBrief.tsx`, a light, one-page brief. The
terminal is hidden in print media; a screen reader still gets the full static
profile via the `<noscript>` copy and the server-rendered `sr-only` block.

## Project layout

```text
app/
  api/chat/            streaming chat route + health probe
  layout.tsx           fonts, metadata, JSON-LD
  page.tsx             terminal, static profile, print brief
components/
  terminal/            shell UI, state, panels, context
  panels/              one component per command output
  games/               Snake, Tic-Tac-Toe, 2048, shared D-pad
  theme/               hook that tracks the applied theme
  ui/                  frame, chips, copy button, badges
data/                  profile facts and site config
lib/
  ai/                  prompt, provider, Gemini, offline, limits, validation
  games/               pure game engines, directions, best-score storage
  terminal/            types, reducer, commands, routing, suggestions
  theme.ts             theme registry, persistence, pre-paint helpers
```

## Deployment notes

- Deploy to Vercel (or any Node host) and set `GEMINI_API_KEY`,
  `AI_PROVIDER=gemini` and `NEXT_PUBLIC_SITE_URL` in the project environment.
- Set `NEXT_PUBLIC_SITE_URL` before the production build so metadata and Open
  Graph URLs are correct.
- Do not create a `NEXT_PUBLIC_GEMINI_API_KEY`; it would be bundled into the
  client.
- No database, auth, analytics, or contact-form backend is used. Theme choice
  and game best scores stay in the visitor's browser; nothing game-related is
  sent to the server.
- The live site is <https://ymmdev-terminal.vercel.app/>.

## License

The source code is licensed under the [MIT License](LICENSE).

Profile prose, personal data, the portrait, the logo, and the résumé are
copyright Yvan Maribbay and are not licensed for reuse.
