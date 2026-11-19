import {
  HISTORY_LIMIT,
  MAX_ENTRIES,
  entryId,
  inputEntry,
  type ChatMessage,
  type Entry,
  type TerminalState,
} from "./types";

export type TerminalAction =
  | { type: "submit"; input: string }
  | { type: "apply"; entries: Entry[]; clear?: boolean; mode?: "shell" | "chat" }
  | { type: "clear" }
  | { type: "booted" }
  | { type: "boot/reset" }
  | { type: "mode"; mode: "shell" | "chat" }
  | { type: "chat/user"; text: string }
  | { type: "chat/start" }
  | { type: "chat/chunk"; text: string }
  | { type: "chat/status"; status: TerminalState["chat"]["status"]; error?: string }
  | { type: "chat/fail"; error: string }
  | { type: "chat/reset" };

export const initialState: TerminalState = {
  entries: [],
  history: [],
  booted: false,
  mode: "shell",
  chat: { messages: [], status: "idle" },
};

export function pruneEntries(entries: Entry[]): Entry[] {
  return entries.length > MAX_ENTRIES
    ? entries.slice(entries.length - MAX_ENTRIES)
    : entries;
}

function pushHistory(history: string[], input: string): string[] {
  if (!input) return history;
  if (history[history.length - 1] === input) return history;
  const next = [...history, input];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

export function terminalReducer(
  state: TerminalState,
  action: TerminalAction,
): TerminalState {
  switch (action.type) {
    case "submit": {
      const input = action.input.trim();
      if (!input) return state;
      return {
        ...state,
        entries: pruneEntries([...state.entries, inputEntry(input)]),
        history: pushHistory(state.history, input),
      };
    }

    case "apply": {
      const base = action.clear ? [] : state.entries;
      const entries = pruneEntries([...base, ...action.entries]);
      return {
        ...state,
        entries,
        mode: action.mode ?? state.mode,
      };
    }

    case "clear":
      return { ...state, entries: [], mode: "shell" };

    case "booted":
      return { ...state, booted: true };

    case "boot/reset":
      return {
        ...state,
        entries: state.entries.filter(
          (entry) => !(entry.kind === "text" && entry.boot),
        ),
      };

    case "mode":
      return { ...state, mode: action.mode };

    case "chat/user": {
      const message: ChatMessage = {
        id: entryId("u"),
        role: "user",
        text: action.text,
        at: Date.now(),
      };
      return {
        ...state,
        chat: { ...state.chat, messages: [...state.chat.messages, message] },
      };
    }

    case "chat/start": {
      const message: ChatMessage = {
        id: entryId("a"),
        role: "model",
        text: "",
        at: Date.now(),
      };
      return {
        ...state,
        chat: {
          messages: [...state.chat.messages, message],
          status: "streaming",
        },
      };
    }

    case "chat/chunk": {
      const messages = [...state.chat.messages];
      const last = messages[messages.length - 1];
      if (!last || last.role !== "model") return state;
      messages[messages.length - 1] = {
        ...last,
        text: last.text + action.text,
      };
      return { ...state, chat: { ...state.chat, messages } };
    }

    case "chat/status":
      return {
        ...state,
        chat: { ...state.chat, status: action.status, error: action.error },
      };

    case "chat/fail": {
      const messages = [...state.chat.messages];
      const last = messages[messages.length - 1];
      // A request that never streamed leaves an empty assistant bubble behind.
      // Remove it so the next send does not replay an empty turn.
      if (last && last.role === "model" && last.text === "") messages.pop();
      return {
        ...state,
        chat: { ...state.chat, messages, status: "error", error: action.error },
      };
    }

    case "chat/reset":
      return {
        ...state,
        chat: { messages: [], status: "idle" },
      };

    default:
      return state;
  }
}
