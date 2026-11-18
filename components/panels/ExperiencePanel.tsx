"use client";

import { PanelFrame } from "@/components/ui/PanelFrame";
import { TechChip } from "@/components/ui/TechChip";
import { profile } from "@/data/profile";

export function ExperiencePanel({ id }: { id?: string }) {
  return (
    <PanelFrame
      id={id}
      label="experience"
      meta={`${profile.experience.length} roles`}
      footer={<span>git log --career --oneline</span>}
    >
      <ol className="space-y-0">
        {profile.experience.map((role, index) => {
          const last = index === profile.experience.length - 1;
          return (
            <li
              key={`${role.company}-${role.start}`}
              className="grid grid-cols-[14px_minmax(0,1fr)] gap-x-2 pb-5 last:pb-0"
            >
              <span aria-hidden className="select-none pt-0.5 text-faint">
                {last ? "└─" : "├─"}
              </span>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-[14px] font-medium text-ink">
                    {role.company}
                  </h3>
                  <span className="text-[11.5px] text-faint">
                    {role.start} — {role.end}
                  </span>
                </div>
                <p className="text-[13px] text-cyan/90">{role.role}</p>
                <ul className="mt-2 space-y-1">
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-[13px] text-muted">
                      <span aria-hidden className="text-faint">
                        ·
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {role.tech.map((item) => (
                    <TechChip key={item}>{item}</TechChip>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </PanelFrame>
  );
}
