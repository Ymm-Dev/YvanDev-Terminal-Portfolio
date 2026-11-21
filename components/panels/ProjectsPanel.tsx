"use client";

import { useTerminal } from "@/components/terminal/context";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { TechChip } from "@/components/ui/TechChip";
import { profile } from "@/data/profile";
import type { Project } from "@/lib/profile-schema";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function ProjectActions({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {project.repo ? (
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer noopener"
          className="link-action"
        >
          ↗ repo
        </a>
      ) : (
        <span
          className="pending"
          title="Repository link not supplied yet"
        >
          repo: pending
        </span>
      )}
      {project.demo ? (
        <a
          href={project.demo}
          target="_blank"
          rel="noreferrer noopener"
          className="link-action"
        >
          ↗ live
        </a>
      ) : null}
    </div>
  );
}

export function ProjectsPanel({ id }: { id?: string }) {
  const { openPanel } = useTerminal();

  return (
    <PanelFrame
      id={id}
      label="featured projects"
      meta={`${profile.projects.length} builds`}
      footer={<span>inspect a card, or run projects &lt;slug&gt;</span>}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {profile.projects.map((project, index) => (
          <article
            key={project.slug}
            className="group flex h-full flex-col rounded border border-line bg-bg/40 p-3 transition-colors hover:border-line-bright"
          >
            <div className="flex gap-3">
              <div
                aria-hidden
                className="panel-inset grid size-12 shrink-0 place-items-center rounded-[2px] border border-line text-[13px] tracking-widest text-green/80 group-hover:border-green/40 group-hover:text-green sm:size-14"
              >
                {initials(project.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[11px] text-faint">
                    [{String(index + 1).padStart(2, "0")}]
                  </span>
                  <h3 className="text-[14px] font-medium text-ink group-hover:text-green">
                    {project.name}
                  </h3>
                  {project.period ? (
                    <span className="ml-auto text-[11px] text-faint">
                      {project.period}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[13px] leading-snug text-muted">
                  {project.blurb}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {project.tech.map((tech) => (
                <TechChip key={tech}>{tech}</TechChip>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-line pt-3">
              <button
                type="button"
                onClick={() => openPanel({ type: "project", slug: project.slug })}
                className="chip hover:text-ink"
                aria-label={`Inspect ${project.name}`}
              >
                inspect
              </button>
              <ProjectActions project={project} />
            </div>
          </article>
        ))}
      </div>
    </PanelFrame>
  );
}

export function ProjectDetailPanel({
  slug,
  id,
}: {
  slug: string;
  id?: string;
}) {
  const { openPanel } = useTerminal();
  const project = profile.projects.find((item) => item.slug === slug);

  if (!project) {
    return (
      <PanelFrame label="project not found" id={id}>
        <p className="text-[13px] text-muted">No project matched “{slug}”.</p>
        <button
          type="button"
          onClick={() => openPanel({ type: "projects" })}
          className="chip chip-lg mt-3"
        >
          ← all projects
        </button>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame
      id={id}
      label={project.name.toLowerCase()}
      meta={project.period ?? "featured"}
      footer={<span>{project.slug}.project · {project.tech.join(" / ")}</span>}
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => openPanel({ type: "projects" })}
          className="link-action"
        >
          ← all projects
        </button>

        <div>
          <h3 className="text-lg font-semibold text-ink">{project.name}</h3>
          <p className="prose-terminal mt-2 max-w-[70ch]">{project.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-line bg-bg/40 p-3">
            <p className="mb-1 text-[10.5px] uppercase tracking-[0.16em] text-faint">
              my role
            </p>
            <p className="text-[13px] text-muted">{project.role}</p>
          </div>
          <div className="rounded border border-line bg-bg/40 p-3">
            <p className="mb-1.5 text-[10.5px] uppercase tracking-[0.16em] text-faint">
              stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((tech) => (
                <TechChip key={tech}>{tech}</TechChip>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10.5px] uppercase tracking-[0.16em] text-faint">
            what it does
          </p>
          <ul className="space-y-1">
            {project.features.map((feature) => (
              <li key={feature} className="flex gap-2 text-[13px] text-muted">
                <span aria-hidden className="text-green">
                  ▪
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-line pt-3">
          <ProjectActions project={project} />
          <span className="text-[11px] text-faint">
            repo links open on GitHub
          </span>
        </div>
      </div>
    </PanelFrame>
  );
}
