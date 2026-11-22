import { profile, hasAvailability } from "@/data/profile";
import { site } from "@/data/site";
import { isThemeName, THEME_NAMES, themeLabel } from "@/lib/theme";
import { panelEntry, textEntry, type CommandResult } from "./types";

export interface CommandContext {
  history: string[];
}

export interface Command {
  name: string;
  aliases?: string[];
  category: "portfolio" | "system" | "ai" | "fun";
  summary: string;
  usage: string;
  run: (args: string, ctx: CommandContext) => CommandResult;
}

const availabilityLine = () =>
  hasAvailability()
    ? `Availability: ${profile.availability.label}`
    : "Availability: not published";

export const commands: Command[] = [
  {
    name: "help",
    category: "system",
    summary: "List every command",
    usage: "help",
    run: () => ({
      entries: [panelEntry({ type: "help" })],
      announce: "Help panel opened, listing all commands.",
      hash: "#help",
    }),
  },
  {
    name: "about",
    aliases: ["who"],
    category: "portfolio",
    summary: "Who I am, and how I work",
    usage: "about",
    run: () => ({
      entries: [panelEntry({ type: "about" })],
      announce: "About panel opened.",
      hash: "#about",
    }),
  },
  {
    name: "skills",
    aliases: ["stack"],
    category: "portfolio",
    summary: "Technical skills by category",
    usage: "skills",
    run: () => ({
      entries: [panelEntry({ type: "skills" })],
      announce: "Skills panel opened.",
      hash: "#skills",
    }),
  },
  {
    name: "projects",
    aliases: ["work"],
    category: "portfolio",
    summary: "Featured projects (optionally: projects <slug>)",
    usage: "projects [aqro|quickmark|lims]",
    run: (args) => {
      const slug = args.trim().toLowerCase();
      if (!slug) {
        return {
          entries: [panelEntry({ type: "projects" })],
          announce: `Projects panel opened with ${profile.projects.length} projects.`,
          hash: "#projects",
        };
      }
      const match = profile.projects.find((project) => project.slug === slug);
      if (!match) {
        return {
          entries: [
            textEntry(`no project matched "${slug}"`, "warn"),
            textEntry(
              `available: ${profile.projects.map((p) => p.slug).join(", ")}`,
              "muted",
            ),
            panelEntry({ type: "projects" }),
          ],
          announce: `No project matched ${slug}. Projects panel opened.`,
          hash: "#projects",
        };
      }
      return {
        entries: [panelEntry({ type: "project", slug: match.slug })],
        announce: `${match.name} project details opened.`,
        hash: `#projects/${match.slug}`,
      };
    },
  },
  {
    name: "experience",
    aliases: ["cv", "career"],
    category: "portfolio",
    summary: "Where I have worked",
    usage: "experience",
    run: () => ({
      entries: [panelEntry({ type: "experience" })],
      announce: `Experience panel opened with ${profile.experience.length} roles.`,
      hash: "#experience",
    }),
  },
  {
    name: "education",
    category: "portfolio",
    summary: "Degree, institution, thesis",
    usage: "education",
    run: () => ({
      entries: [panelEntry({ type: "education" })],
      announce: "Education panel opened.",
      hash: "#education",
    }),
  },
  {
    name: "contact",
    category: "portfolio",
    summary: "Email, GitHub, LinkedIn",
    usage: "contact",
    run: () => ({
      entries: [panelEntry({ type: "contact" })],
      announce: "Contact panel opened.",
      hash: "#contact",
    }),
  },
  {
    name: "recruiter",
    category: "portfolio",
    summary: "The 40-second version",
    usage: "recruiter",
    run: () => ({
      entries: [panelEntry({ type: "recruiter" })],
      announce: "Recruiter brief opened.",
      hash: "#recruiter",
    }),
  },
  {
    name: "theme",
    category: "system",
    summary: "Change the terminal theme",
    usage: "theme [midnight|paper|amber|cobalt]",
    run: (args) => {
      const requested = args.trim().toLowerCase();

      if (!requested) {
        return {
          entries: [panelEntry({ type: "theme" })],
          announce: "Theme picker opened.",
          hash: "#theme",
        };
      }

      if (!isThemeName(requested)) {
        return {
          entries: [
            textEntry(`no theme named "${requested}"`, "warn"),
            textEntry(`available: ${THEME_NAMES.join(" · ")}`, "muted"),
          ],
          announce: `No theme named ${requested}.`,
        };
      }

      return {
        entries: [textEntry(`theme set to ${themeLabel(requested)}.`, "ok")],
        theme: requested,
        focus: "panel",
        announce: `${themeLabel(requested)} theme applied.`,
      };
    },
  },
  {
    name: "resume",
    aliases: ["cv.pdf"],
    category: "portfolio",
    summary: "Download the PDF resume",
    usage: "resume",
    run: () => ({
      entries: [
        textEntry("fetching resume.pdf ...", "muted"),
        textEntry("ok — download started.", "ok"),
        textEntry(
          "if nothing happened, use the resume link in the contact panel.",
          "muted",
        ),
      ],
      download: profile.resumeUrl,
      announce: "Resume download started.",
    }),
  },
  {
    name: "whoami",
    category: "system",
    summary: "One-line introduction",
    usage: "whoami",
    run: () => ({
      entries: [
        textEntry(`${profile.name} — ${profile.title}`, "accent"),
        textEntry(profile.tagline, "default"),
        textEntry(availabilityLine(), "muted"),
        textEntry(`contact: ${profile.contact.email}`, "muted"),
      ],
      announce: `${profile.name}, ${profile.title}.`,
    }),
  },
  {
    name: "chat",
    aliases: ["ai", "ask"],
    category: "ai",
    summary: "Talk to my AI twin",
    usage: "chat",
    run: () => ({
      entries: [panelEntry({ type: "chat" })],
      mode: "chat",
      announce: "AI twin opened. Chat mode is active.",
      hash: "#chat",
    }),
  },
  {
    name: "clear",
    category: "system",
    summary: "Clear the scrollback",
    usage: "clear",
    run: () => ({ entries: [], clear: true, announce: "Terminal cleared." }),
  },
  {
    name: "ls",
    category: "system",
    summary: "List sections",
    usage: "ls",
    run: () => ({
      entries: [
        textEntry(
          "about.txt  skills.txt  projects/  experience.txt  education.txt  contact.txt  recruiter.txt",
          "muted",
        ),
      ],
      announce: "Listed available sections.",
    }),
  },
  {
    name: "history",
    category: "system",
    summary: "Commands from this session",
    usage: "history",
    run: (_args, ctx) => ({
      entries:
        ctx.history.length === 0
          ? [textEntry("no history yet.", "muted")]
          : ctx.history.map((item, index) =>
              textEntry(`${String(index + 1).padStart(3, " ")}  ${item}`),
            ),
      announce: `${ctx.history.length} commands in history.`,
    }),
  },
  {
    name: "games",
    aliases: ["arcade", "play"],
    category: "fun",
    summary: "Open the terminal arcade",
    usage: "games",
    run: () => ({
      entries: [panelEntry({ type: "games" })],
      announce: "Arcade opened with Snake, Tic-Tac-Toe, and 2048.",
      hash: "#games",
    }),
  },
  {
    name: "snake",
    category: "fun",
    summary: "Play Snake",
    usage: "snake",
    run: () => ({
      entries: [panelEntry({ type: "snake" })],
      announce: "Snake ready. Arrow keys or WASD to steer.",
      hash: "#snake",
      focus: "panel",
    }),
  },
  {
    name: "tictactoe",
    aliases: ["ttt"],
    category: "fun",
    summary: "Play Tic-Tac-Toe against the shell",
    usage: "tictactoe",
    run: () => ({
      entries: [panelEntry({ type: "tictactoe" })],
      announce: "Tic-Tac-Toe ready. You are X and move first.",
      hash: "#tictactoe",
      focus: "panel",
    }),
  },
  {
    name: "2048",
    aliases: ["twenty48"],
    category: "fun",
    summary: "Play 2048",
    usage: "2048",
    run: () => ({
      entries: [panelEntry({ type: "2048" })],
      announce: "2048 ready. Arrow keys or WASD to merge tiles.",
      hash: "#2048",
      focus: "panel",
    }),
  },
  {
    name: "neofetch",
    category: "fun",
    summary: "System information, portfolio edition",
    usage: "neofetch",
    run: () => ({
      entries: [panelEntry({ type: "neofetch" })],
      announce: "Neofetch panel opened.",
    }),
  },
  {
    name: "coffee",
    category: "fun",
    summary: "Brew a cup",
    usage: "coffee",
    run: () => ({
      entries: [
        textEntry("        ( (", "muted"),
        textEntry("         ) )", "muted"),
        textEntry("      ........", "muted"),
        textEntry("      |      |]", "muted"),
        textEntry("      \\      /", "muted"),
        textEntry("       `----'", "muted"),
        textEntry("brewing ... done. now back to the code.", "ok"),
      ],
      announce: "Coffee brewed.",
    }),
  },
  {
    name: "hire-me",
    aliases: ["sudo-hire-me"],
    category: "fun",
    summary: "sudo hire-me",
    usage: "sudo hire-me",
    run: () => ({
      entries: [
        textEntry("checking permissions ... ok", "muted"),
        textEntry("writing offer letter ... not found", "warn"),
        textEntry(
          `fallback: ${profile.contact.email} — replies faster than this shell.`,
          "ok",
        ),
      ],
      announce: "Hire-me easter egg. Contact details shown.",
    }),
  },
];

const commandIndex = new Map<string, Command>();
for (const command of commands) {
  commandIndex.set(command.name, command);
  for (const alias of command.aliases ?? []) commandIndex.set(alias, command);
}

export interface ResolvedCommand {
  command: Command | null;
  args: string;
  raw: string;
}

export function resolveCommand(input: string): ResolvedCommand {
  const raw = input.trim().replace(/\s+/g, " ");
  if (!raw) return { command: null, args: "", raw };

  const withoutSudo = raw.startsWith("sudo ") ? raw.slice(5).trim() : raw;
  const [head = "", ...rest] = withoutSudo.split(" ");
  const command = commandIndex.get(head.toLowerCase()) ?? null;
  return { command, args: rest.join(" "), raw };
}

export function notFoundResult(input: string, matches: string[]): CommandResult {
  const entries = [
    textEntry(`zsh: command not found: ${input}`, "error"),
    textEntry(
      matches.length
        ? `did you mean: ${matches.join(" · ")}`
        : "type `help` to see everything this shell can do.",
      "muted",
    ),
    textEntry("tip: every command is also clickable below the prompt.", "muted"),
  ];
  return { entries, announce: `Command not found: ${input}.` };
}

export const helpGroups = [
  "portfolio",
  "system",
  "ai",
  "fun",
] as const;

export const shellName = `${site.shell.user}@${site.shell.host}`;
