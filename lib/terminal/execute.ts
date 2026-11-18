import {
  notFoundResult,
  resolveCommand,
  type CommandContext,
} from "./commands";
import { suggestCommands } from "./suggestions";
import type { CommandResult } from "./types";

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const resolved = resolveCommand(input);
  if (resolved.command) {
    return resolved.command.run(resolved.args, ctx);
  }
  return notFoundResult(resolved.raw, suggestCommands(resolved.raw));
}
