"use client";

import { useTerminal } from "@/components/terminal/context";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { CopyButton } from "@/components/ui/CopyButton";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { TechChip } from "@/components/ui/TechChip";
import { profile } from "@/data/profile";

const briefSkillGroups = ["Languages", "Frontend", "Backend", "Databases"];

export function RecruiterPanel({ id }: { id?: string }) {
  const { run } = useTerminal();
  const selected = profile.projects.slice(0, 2);

  return (
    <PanelFrame
      id={id}
      label="recruiter brief"
      meta="40-second version"
      tone="accent"
      footer={<span>print this page (ctrl/cmd + p) for a one-page brief</span>}
    >
      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="space-y-3 lg:border-r lg:border-line lg:pr-5">
          <div>
            <h3 className="text-lg font-semibold leading-tight text-ink">
              {profile.name}
            </h3>
            <p className="text-[13px] text-green">{profile.title}</p>
            <div className="mt-2">
              <AvailabilityBadge />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-faint">
                  email
                </span>
                <CopyButton value={profile.contact.email} label="email" compact />
              </div>
              <a
                href={`mailto:${profile.contact.email}`}
                className="mt-0.5 block break-all text-[12.5px] leading-snug text-cyan"
              >
                {profile.contact.email}
              </a>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {profile.contact.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[12.5px] text-cyan"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <a href={profile.resumeUrl} download className="chip chip-lg justify-center">
              ↓ download resume
            </a>
            <button
              type="button"
              onClick={() => run("chat")}
              className="chip chip-lg justify-center text-purple"
            >
              ask the AI twin
            </button>
          </div>
        </aside>

        <div className="space-y-4">
          <section>
            <h4 className="mb-1 text-[10.5px] uppercase tracking-[0.16em] text-faint">
              summary
            </h4>
            <p className="prose-terminal text-[13.5px]">{profile.summary}</p>
          </section>

          <section>
            <h4 className="mb-1.5 text-[10.5px] uppercase tracking-[0.16em] text-faint">
              strongest skills
            </h4>
            <div className="space-y-1.5">
              {profile.skills
                .filter((group) => briefSkillGroups.includes(group.category))
                .map((group) => (
                  <div key={group.category} className="flex flex-wrap gap-1.5">
                    <span className="w-20 shrink-0 pt-0.5 text-[11px] text-faint">
                      {group.category}
                    </span>
                    {group.items.map((item) => (
                      <TechChip key={item}>{item}</TechChip>
                    ))}
                  </div>
                ))}
            </div>
          </section>

          <section>
            <h4 className="mb-1.5 text-[10.5px] uppercase tracking-[0.16em] text-faint">
              selected projects
            </h4>
            <ul className="space-y-1.5">
              {selected.map((project) => (
                <li key={project.slug} className="text-[13px]">
                  <button
                    type="button"
                    onClick={() => run(`projects ${project.slug}`)}
                    className="text-ink hover:text-green"
                  >
                    {project.name}
                  </button>
                  <span className="text-muted"> — {project.blurb}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div>
              <h4 className="mb-1 text-[10.5px] uppercase tracking-[0.16em] text-faint">
                experience
              </h4>
              <ul className="space-y-1">
                {profile.experience.map((role) => (
                  <li key={`${role.company}-${role.start}`} className="text-[12.5px]">
                    <span className="text-ink">{role.role}</span>
                    <span className="text-muted"> · {role.company}</span>
                    <span className="block text-[11px] text-faint">
                      {role.start} – {role.end}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-1 text-[10.5px] uppercase tracking-[0.16em] text-faint">
                education
              </h4>
              {profile.education.map((entry) => (
                <p key={entry.institution} className="text-[12.5px]">
                  <span className="text-ink">{entry.degree}</span>
                  <span className="block text-muted">{entry.institution}</span>
                  <span className="block text-[11px] text-faint">
                    {entry.start} – {entry.end}
                  </span>
                </p>
              ))}
              <p className="mt-1 text-[11px] text-faint">
                {profile.awards.slice(0, 2).join(" · ")}
              </p>
            </div>
          </section>
        </div>
      </div>
    </PanelFrame>
  );
}
