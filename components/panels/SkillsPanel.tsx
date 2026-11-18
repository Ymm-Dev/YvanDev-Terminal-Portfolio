"use client";

import { PanelFrame } from "@/components/ui/PanelFrame";
import { TechChip } from "@/components/ui/TechChip";
import { profile } from "@/data/profile";

export function SkillsPanel({ id }: { id?: string }) {
  const total = profile.skills.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <PanelFrame
      id={id}
      label="skills"
      meta={`${total} entries · ${profile.skills.length} groups`}
      footer={
        <span>
          only technologies with shipped work behind them are listed
        </span>
      }
    >
      <dl className="divide-y divide-line">
        {profile.skills.map((group) => (
          <div
            key={group.category}
            className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[180px_minmax(0,1fr)]"
          >
            <dt className="pt-1 text-[12px] uppercase tracking-[0.14em] text-faint">
              {group.category}
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <TechChip key={item}>{item}</TechChip>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </PanelFrame>
  );
}
