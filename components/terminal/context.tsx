"use client";

import { createContext, useContext } from "react";
import type { ChatState, PanelRef } from "@/lib/terminal/types";

export type TwinStatus = "checking" | "online" | "offline";

export interface TwinInfo {
  status: TwinStatus;
  provider?: string;
  model?: string | null;
}

export interface TerminalApi {
  run: (command: string) => void;
  openPanel: (panel: PanelRef) => void;
  send: (message: string) => void;
  resetChat: () => void;
  chat: ChatState;
  twin: TwinInfo;
  chatMode: boolean;
}

export const TerminalContext = createContext<TerminalApi | null>(null);

export function useTerminal(): TerminalApi {
  const api = useContext(TerminalContext);
  if (!api) throw new Error("useTerminal must be used inside <Terminal>");
  return api;
}
