import { profile } from "@/data/profile";
import type { PanelRef } from "./types";

const simpleRoutes = new Set([
  "welcome",
  "help",
  "about",
  "skills",
  "projects",
  "experience",
  "education",
  "contact",
  "recruiter",
  "chat",
  "neofetch",
  "theme",
  "games",
  "snake",
  "tictactoe",
  "2048",
]);

export function panelToHash(panel: PanelRef): string {
  switch (panel.type) {
    case "project":
      return `#projects/${panel.slug}`;
    case "projects":
      return "#projects";
    default:
      return `#${panel.type}`;
  }
}

export function parseRoute(hash: string): PanelRef | null {
  const clean = hash
    .trim()
    .replace(/^#/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .trim()
    .toLowerCase();

  if (!clean) return null;

  if (clean.startsWith("projects/")) {
    const slug = clean.slice("projects/".length);
    const match = profile.projects.find((project) => project.slug === slug);
    return match
      ? { type: "project", slug: match.slug }
      : { type: "projects" };
  }

  if (simpleRoutes.has(clean)) {
    return { type: clean } as PanelRef;
  }

  return null;
}

export function panelLabel(panel: PanelRef): string {
  switch (panel.type) {
    case "project": {
      const project = profile.projects.find((item) => item.slug === panel.slug);
      return project ? `${project.name} details` : "Projects";
    }
    case "welcome":
      return "Welcome";
    case "help":
      return "Help";
    case "about":
      return "About";
    case "skills":
      return "Skills";
    case "projects":
      return "Projects";
    case "experience":
      return "Experience";
    case "education":
      return "Education";
    case "contact":
      return "Contact";
    case "recruiter":
      return "Recruiter brief";
    case "chat":
      return "AI twin";
    case "neofetch":
      return "Neofetch";
    case "theme":
      return "Theme";
    case "games":
      return "Arcade";
    case "snake":
      return "Snake";
    case "tictactoe":
      return "Tic-Tac-Toe";
    case "2048":
      return "2048";
    default:
      return "Panel";
  }
}
