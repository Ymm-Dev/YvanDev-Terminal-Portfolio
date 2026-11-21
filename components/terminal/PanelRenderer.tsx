"use client";

import { AboutPanel } from "@/components/panels/AboutPanel";
import { ChatPanel } from "@/components/panels/ChatPanel";
import { ContactPanel } from "@/components/panels/ContactPanel";
import { EducationPanel } from "@/components/panels/EducationPanel";
import { ExperiencePanel } from "@/components/panels/ExperiencePanel";
import { GamesPanel } from "@/components/panels/GamesPanel";
import { SnakeGame } from "@/components/games/SnakeGame";
import { HelpPanel } from "@/components/panels/HelpPanel";
import { NeofetchPanel } from "@/components/panels/NeofetchPanel";
import { ProjectDetailPanel, ProjectsPanel } from "@/components/panels/ProjectsPanel";
import { RecruiterPanel } from "@/components/panels/RecruiterPanel";
import { SkillsPanel } from "@/components/panels/SkillsPanel";
import { ThemePanel } from "@/components/panels/ThemePanel";
import { WelcomePanel } from "@/components/panels/WelcomePanel";
import type { PanelRef } from "@/lib/terminal/types";

export function panelDomId(panel: PanelRef): string {
  return panel.type === "project"
    ? `panel-project-${panel.slug}`
    : `panel-${panel.type}`;
}

export function PanelRenderer({ panel }: { panel: PanelRef }) {
  const id = panelDomId(panel);

  switch (panel.type) {
    case "welcome":
      return <WelcomePanel id={id} />;
    case "help":
      return <HelpPanel id={id} />;
    case "about":
      return <AboutPanel id={id} />;
    case "skills":
      return <SkillsPanel id={id} />;
    case "projects":
      return <ProjectsPanel id={id} />;
    case "project":
      return <ProjectDetailPanel slug={panel.slug} id={id} />;
    case "experience":
      return <ExperiencePanel id={id} />;
    case "education":
      return <EducationPanel id={id} />;
    case "contact":
      return <ContactPanel id={id} />;
    case "recruiter":
      return <RecruiterPanel id={id} />;
    case "chat":
      return <ChatPanel id={id} />;
    case "neofetch":
      return <NeofetchPanel id={id} />;
    case "theme":
      return <ThemePanel id={id} />;
    case "games":
      return <GamesPanel id={id} />;
    case "snake":
      return <SnakeGame id={id} />;
    default:
      return null;
  }
}
