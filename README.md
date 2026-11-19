# Yvan Maribbay — interactive terminal portfolio

A developer portfolio that behaves like a shell. Visitors type commands (or click
shortcuts) and the output is rich, interactive HTML panels: projects, experience,
skills, a recruiter brief, and an AI twin.

- **Terminal-first.** There is no separate "normal" portfolio page. The shell is
  the interface; the panels are the content.
- **Every command is clickable.** Visitors never need to type to reach a section.
- **AI twin with an honest failure mode.** With a Gemini key the twin streams real
  answers from Yvan's profile. Without a key it says so plainly and points to
  `contact` — it never fakes a conversation.
- **Accessible and printable.** Keyboard navigation, skip link, live
  announcements, `prefers-reduced-motion` support, and a dedicated one-page
  print brief.

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
overflow at 320–1440px, keyboard-only operation, reduced motion, cold deep
links, print output, the offline twin, and simulated 429/502 responses.

```bash
npx playwright install firefox   # once
npm run build && npm start       # terminal 1
npm run test:ui                  # terminal 2
```

Set `BASE` to test another origin, for example `BASE=http://localhost:3100 npm run test:ui`.

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

- Prose in `data/profile.ts` was reviewed and approved by Yvan. Get his sign-off
  before changing any of it, and never invent a metric or link.
- Every project links to its public GitHub repository, and ChikAI and Bantay
  also link to their live demos. The `repo: pending` fallback stays in the UI
  for any future project that has no URL yet.
- Availability is published as “Open to work”, so the title bar, welcome panel,
  recruiter brief, print brief, `neofetch`, and the AI twin all report it.
  Setting `availability.published` to `false` hides it everywhere.
- Assets in `public/yvan/` are copies; the originals in `~/Downloads` are
  untouched.

## Print

`Ctrl/Cmd + P` prints `components/PrintBrief.tsx`, a light, one-page brief. The
terminal is hidden in print media; a screen reader still gets the full static
profile via the `<noscript>` copy and the server-rendered `sr-only` block.

## Project layout

```
app/
  api/chat/            streaming chat route + health probe
  layout.tsx           fonts, metadata, JSON-LD
  page.tsx             terminal, static profile, print brief
components/
  terminal/            shell UI, state, panels, context
  panels/              one component per command output
  ui/                  frame, chips, copy button, badges
data/                  profile facts and site config
lib/
  ai/                  prompt, provider, Gemini, offline, limits, validation
  terminal/            types, reducer, commands, routing, suggestions
```

## Deployment notes

- Deploy to Vercel (or any Node host) and set `GEMINI_API_KEY`,
  `AI_PROVIDER=gemini` and `NEXT_PUBLIC_SITE_URL` in the project environment.
- Set `NEXT_PUBLIC_SITE_URL` before the production build so metadata and Open
  Graph URLs are correct.
- Do not create a `NEXT_PUBLIC_GEMINI_API_KEY`; it would be bundled into the
  client.
- No database, auth, analytics, or contact-form backend is used.
