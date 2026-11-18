import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";
import type { PanelRef } from "@/lib/terminal/types";
import { panelLabel, panelToHash, parseRoute } from "@/lib/terminal/routing";

const routes: Array<[PanelRef, string]> = [
  [{ type: "welcome" }, "#welcome"],
  [{ type: "help" }, "#help"],
  [{ type: "about" }, "#about"],
  [{ type: "skills" }, "#skills"],
  [{ type: "projects" }, "#projects"],
  [{ type: "experience" }, "#experience"],
  [{ type: "education" }, "#education"],
  [{ type: "contact" }, "#contact"],
  [{ type: "recruiter" }, "#recruiter"],
  [{ type: "chat" }, "#chat"],
  [{ type: "neofetch" }, "#neofetch"],
];

describe("panel routes", () => {
  it("maps every simple panel to its hash and back", () => {
    for (const [panel, hash] of routes) {
      expect(panelToHash(panel)).toBe(hash);
      expect(parseRoute(hash)).toEqual(panel);
    }
  });

  it("maps a project detail to #projects/<slug> and back", () => {
    const project = profile.projects[0];
    expect(project).toBeDefined();
    const panel: PanelRef = { type: "project", slug: project!.slug };
    expect(panelToHash(panel)).toBe(`#projects/${project!.slug}`);
    expect(parseRoute(`#projects/${project!.slug}`)).toEqual(panel);
  });

  it("tolerates slashes, case and whitespace", () => {
    expect(parseRoute("#/Projects/AQRO/")).toEqual({ type: "project", slug: "aqro" });
    expect(parseRoute("  #Help  ")).toEqual({ type: "help" });
  });

  it("falls back to the grid for an unknown project slug", () => {
    expect(parseRoute("#projects/nope")).toEqual({ type: "projects" });
  });

  it("returns null for empty and unknown hashes", () => {
    expect(parseRoute("")).toBeNull();
    expect(parseRoute("#")).toBeNull();
    expect(parseRoute("#nonsense")).toBeNull();
  });

  it("labels every route for announcements", () => {
    for (const [panel] of routes) {
      expect(panelLabel(panel)).not.toBe("Panel");
    }
    expect(panelLabel({ type: "project", slug: "aqro" })).toContain("AQRO");
  });
});
