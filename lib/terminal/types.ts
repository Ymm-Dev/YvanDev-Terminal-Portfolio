import type { ThemeName } from "@/lib/theme";

export type Tone = "default" | "muted" | "ok" | "warn" | "error" | "accent";

export type PanelRef =
  | { type: "welcome" }
  | { type: "help" }
  | { type: "about" }
  | { type: "skills" }
  | { type: "projects" }
  | { type: "project"; slug: string }
  | { type: "experience" }
  | { type: "education" }
  | { type: "contact" }
  | { type: "recruiter" }
  | { type: "chat" }
  | { type: "neofetch" }
  | { type: "theme" };

export type PanelType = PanelRef["type"];

export interface TextEntry {
  id: string;
  kind: "text";
  text: string;
  tone?: Tone;
  boot?: boolean;
}

export interface InputEntry {
  id: string;
  kind: "input";
  text: string;
}

export interface PanelEntry {
  id: string;
  kind: "panel";
  panel: PanelRef;
}

export interface NoticeEntry {
  id: string;
  kind: "notice";
  text: string;
  tone?: Tone;
}

export type Entry = TextEntry | InputEntry | PanelEntry | NoticeEntry;

export type ChatRole = "user" | "model";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  at: number;
}

export type ChatStatus = "idle" | "streaming" | "error" | "offline";

export interface ChatState {
  messages: ChatMessage[];
  status: ChatStatus;
  error?: string;
}

export interface CommandResult {
  entries: Entry[];
  clear?: boolean;
  announce?: string;
  download?: string;
  theme?: ThemeName;
  /** Keep focus where it is instead of returning it to the command input. */
  focus?: "terminal" | "panel";
  mode?: "shell" | "chat";
  hash?: string;
}

export interface TerminalState {
  entries: Entry[];
  history: string[];
  booted: boolean;
  mode: "shell" | "chat";
  chat: ChatState;
}

export const MAX_ENTRIES = 200;
export const HISTORY_LIMIT = 100;

let sequence = 0;

export function entryId(prefix = "e"): string {
  sequence += 1;
  return `${prefix}${sequence.toString(36)}`;
}

export function textEntry(text: string, tone: Tone = "default"): TextEntry {
  return { id: entryId("t"), kind: "text", text, tone };
}

export function bootTextEntry(text: string, tone: Tone = "default"): TextEntry {
  return { ...textEntry(text, tone), boot: true };
}

export function noticeEntry(
  text: string,
  tone: Tone = "muted",
): NoticeEntry {
  return { id: entryId("n"), kind: "notice", text, tone };
}

export function panelEntry(panel: PanelRef): PanelEntry {
  return { id: entryId("p"), kind: "panel", panel };
}

export function inputEntry(text: string): InputEntry {
  return { id: entryId("i"), kind: "input", text };
}
