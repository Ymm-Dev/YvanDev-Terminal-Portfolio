"use client";

import { PanelFrame } from "@/components/ui/PanelFrame";
import { profile } from "@/data/profile";

export function EducationPanel({ id }: { id?: string }) {
  return (
    <PanelFrame
      id={id}
      label="education"
      meta={`${profile.education.length} degree${profile.education.length === 1 ? "" : "s"}`}
      footer={<span>awards and thesis included</span>}
    >
      <div className="space-y-5">
        {profile.education.map((entry) => (
          <div
            key={entry.institution}
            className="grid grid-cols-[14px_minmax(0,1fr)] gap-x-2"
          >
            <span aria-hidden className="select-none pt-0.5 text-faint">
              └─
            </span>
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-[14px] font-medium text-ink">{entry.degree}</h3>
                <span className="text-[11.5px] text-faint">
                  {entry.start} — {entry.end}
                </span>
              </div>
              <p className="text-[13px] text-cyan/90">{entry.institution}</p>
              {entry.detail ? (
                <p className="prose-terminal mt-2 max-w-[70ch] text-[13.5px]">
                  {entry.detail}
                </p>
              ) : null}
            </div>
          </div>
        ))}

        <div className="border-t border-dashed border-line pt-4">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-faint">
            awards
          </p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {profile.awards.map((award) => (
              <li key={award} className="flex gap-2 text-[13px] text-muted">
                <span aria-hidden className="text-green">
                  ·
                </span>
                <span>{award}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PanelFrame>
  );
}
