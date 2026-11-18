import { commands } from "./commands";

export const commandNames: string[] = Array.from(
  new Set(commands.flatMap((command) => [command.name, ...(command.aliases ?? [])])),
).sort();

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        (current[j - 1] ?? 0) + 1,
        (previous[j] ?? 0) + 1,
        (previous[j - 1] ?? 0) + cost,
      );
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
}

export function suggestCommands(input: string): string[] {
  const raw = input.trim().toLowerCase();
  if (!raw) return [];
  const head = (raw.split(" ")[0] ?? "").replace(/^sudo$/, "");

  return commandNames
    .map((name) => ({ name, distance: levenshtein(head, name) }))
    .filter(
      ({ name, distance }) =>
        distance <= 2 || (head.length >= 2 && name.startsWith(head)),
    )
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
    .slice(0, 3)
    .map(({ name }) => name);
}

export interface Completion {
  value: string;
  matches: string[];
}

export function complete(input: string): Completion {
  const value = input;
  const parts = value.split(" ");
  const token = parts[parts.length - 1] ?? "";
  const prefix = parts.slice(0, -1).join(" ");

  if (value.trim().length === 0) {
    return { value, matches: commandNames };
  }

  if (token.length === 0) {
    return { value, matches: commandNames };
  }

  const matches = commandNames.filter((name) => name.startsWith(token));
  if (matches.length === 0) return { value, matches: [] };

  const first = matches[0] ?? "";
  const shared = matches.reduce((acc, name) => {
    let index = 0;
    while (index < acc.length && index < name.length && acc[index] === name[index]) {
      index += 1;
    }
    return acc.slice(0, index);
  }, first);

  // Never shrink what the visitor already typed: only extend to the shared
  // prefix when it actually grows.
  const extended = shared.length > token.length ? shared : token;
  const completed = prefix ? `${prefix} ${extended}` : extended;
  return {
    value: matches.length === 1 ? `${completed} ` : completed,
    matches,
  };
}

export function ghostSuggestion(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const { matches } = complete(input);
  const candidate = matches[0];
  if (!candidate) return "";
  const parts = input.split(" ");
  const token = parts[parts.length - 1] ?? "";
  if (!token) return "";
  if (!candidate.startsWith(token) || candidate === token) return "";
  return candidate.slice(token.length);
}
