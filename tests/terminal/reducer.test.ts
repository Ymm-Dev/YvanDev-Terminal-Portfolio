import { describe, expect, it } from "vitest";
import {
  initialState,
  pruneEntries,
  terminalReducer,
} from "@/lib/terminal/reducer";
import { MAX_ENTRIES, bootTextEntry, panelEntry, textEntry } from "@/lib/terminal/types";

describe("terminalReducer", () => {
  it("echoes the command and records history", () => {
    const next = terminalReducer(initialState, { type: "submit", input: "help" });
    expect(next.entries).toHaveLength(1);
    expect(next.entries[0]).toMatchObject({ kind: "input", text: "help" });
    expect(next.history).toEqual(["help"]);
  });

  it("ignores empty submissions", () => {
    expect(terminalReducer(initialState, { type: "submit", input: "   " })).toBe(
      initialState,
    );
  });

  it("collapses consecutive duplicate history entries", () => {
    let state = terminalReducer(initialState, { type: "submit", input: "about" });
    state = terminalReducer(state, { type: "submit", input: "about" });
    state = terminalReducer(state, { type: "submit", input: "skills" });
    expect(state.history).toEqual(["about", "skills"]);
  });

  it("appends result entries", () => {
    const next = terminalReducer(initialState, {
      type: "apply",
      entries: [panelEntry({ type: "help" })],
    });
    expect(next.entries[0]).toMatchObject({
      kind: "panel",
      panel: { type: "help" },
    });
  });

  it("clears entries but keeps history", () => {
    let state = terminalReducer(initialState, { type: "submit", input: "help" });
    state = terminalReducer(state, {
      type: "apply",
      entries: [textEntry("hello")],
    });
    state = terminalReducer(state, { type: "clear" });
    expect(state.entries).toEqual([]);
    expect(state.history).toEqual(["help"]);
  });

  it("prunes to the cap, keeping the newest entries", () => {
    const entries = Array.from({ length: MAX_ENTRIES + 5 }, (_, i) =>
      textEntry(`line ${i}`),
    );
    const pruned = pruneEntries(entries);
    expect(pruned).toHaveLength(MAX_ENTRIES);
    expect(pruned[0]).toMatchObject({ text: "line 5" });
    expect(pruned[MAX_ENTRIES - 1]).toMatchObject({
      text: `line ${MAX_ENTRIES + 4}`,
    });
  });

  it("never touches chat when scrollback is pruned or cleared", () => {
    let state = terminalReducer(initialState, { type: "chat/user", text: "hi" });
    const chatBefore = state.chat;
    const flood = Array.from({ length: MAX_ENTRIES + 10 }, () => textEntry("x"));
    state = terminalReducer(state, { type: "apply", entries: flood });
    state = terminalReducer(state, { type: "clear" });
    expect(state.chat).toBe(chatBefore);
    expect(state.chat.messages).toHaveLength(1);
  });

  it("streams assistant text into the last model message", () => {
    let state = terminalReducer(initialState, { type: "chat/user", text: "hi" });
    state = terminalReducer(state, { type: "chat/start" });
    state = terminalReducer(state, { type: "chat/chunk", text: "Hello" });
    state = terminalReducer(state, { type: "chat/chunk", text: " there" });
    const last = state.chat.messages[state.chat.messages.length - 1];
    expect(last).toMatchObject({ role: "model", text: "Hello there" });
    expect(state.chat.status).toBe("streaming");
  });

  it("boot/reset removes only boot entries", () => {
    const boot = bootTextEntry("[ ok ] profile loaded", "ok");
    const user = textEntry("keep me");
    const state = terminalReducer(
      { ...initialState, entries: [boot, user] },
      { type: "boot/reset" },
    );
    expect(state.entries).toEqual([user]);
  });

  it("resets the conversation", () => {
    let state = terminalReducer(initialState, { type: "chat/user", text: "hi" });
    state = terminalReducer(state, { type: "chat/reset" });
    expect(state.chat.messages).toEqual([]);
    expect(state.chat.status).toBe("idle");
  });
});
