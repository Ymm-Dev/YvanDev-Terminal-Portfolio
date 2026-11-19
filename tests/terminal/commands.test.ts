import { describe, expect, it } from "vitest";
import { commands, resolveCommand } from "@/lib/terminal/commands";
import { runCommand } from "@/lib/terminal/execute";
import { suggestCommands, complete, ghostSuggestion, levenshtein } from "@/lib/terminal/suggestions";

const ctx = { history: [] as string[] };

describe("command registry", () => {
  it("exposes every documented command", () => {
    const names = commands.map((c) => c.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "help",
        "about",
        "skills",
        "projects",
        "experience",
        "education",
        "contact",
        "resume",
        "whoami",
        "chat",
        "recruiter",
        "clear",
        "ls",
        "history",
        "neofetch",
        "coffee",
        "hire-me",
      ]),
    );
  });

  it("resolves aliases", () => {
    expect(resolveCommand("stack").command?.name).toBe("skills");
    expect(resolveCommand("work").command?.name).toBe("projects");
  });

  it("resolves sudo hire-me", () => {
    expect(resolveCommand("sudo hire-me").command?.name).toBe("hire-me");
  });

  it("routes projects to a detail panel for a known slug", () => {
    const result = runCommand("projects aqro", ctx);
    expect(result.entries[0]).toMatchObject({
      kind: "panel",
      panel: { type: "project", slug: "aqro" },
    });
    expect(result.hash).toBe("#projects/aqro");
  });

  it("falls back to the grid for an unknown slug", () => {
    const result = runCommand("projects nope", ctx);
    expect(result.entries[0]).toMatchObject({ tone: "warn" });
    expect(result.entries[2]).toMatchObject({
      kind: "panel",
      panel: { type: "projects" },
    });
  });

  it("marks clear as a clear operation", () => {
    expect(runCommand("clear", ctx).clear).toBe(true);
  });

  it("offers the resume as a download", () => {
    const result = runCommand("resume", ctx);
    expect(result.download).toBe("/yvan/yvan-maribbay-resume.pdf");
  });

  it("shows history from the context", () => {
    const result = runCommand("history", { history: ["help", "about"] });
    expect(result.entries).toHaveLength(2);
  });

  it("states the published availability", () => {
    const result = runCommand("whoami", ctx);
    const text = result.entries.map((e) => ("text" in e ? e.text : "")).join("\n");
    expect(text).toContain("Availability: Open to work");
    expect(text).not.toContain("not published");
  });

  it("suggests close matches for a typo", () => {
    const result = runCommand("projcts", ctx);
    const text = result.entries.map((e) => ("text" in e ? e.text : "")).join("\n");
    expect(text).toContain("projects");
  });
});

describe("completion", () => {
  it("completes a unique prefix with a trailing space", () => {
    expect(complete("recr").value).toBe("recruiter ");
  });

  it("never shrinks an ambiguous prefix", () => {
    const result = complete("c");
    expect(result.value).toBe("c");
    expect(result.matches.length).toBeGreaterThan(1);
  });

  it("returns ghost text for an inline suggestion", () => {
    expect(ghostSuggestion("proj")).toBe("ects");
    expect(ghostSuggestion("projects ")).toBe("");
  });

  it("finds close suggestions", () => {
    expect(levenshtein("projects", "projcts")).toBe(1);
    expect(suggestCommands("skils")).toContain("skills");
  });
});
