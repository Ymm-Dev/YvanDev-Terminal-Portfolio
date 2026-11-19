"use client";

import Image from "next/image";
import { useTerminal } from "@/components/terminal/context";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { TechChip } from "@/components/ui/TechChip";
import { profile } from "@/data/profile";

export function AboutPanel({ id }: { id?: string }) {
  const { run } = useTerminal();

  return (
    <PanelFrame
      id={id}
      label="about"
      meta="yvan.txt"
      footer={<span>cat about.txt · written by Yvan</span>}
    >
      <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
        <figure className="order-2 sm:order-1">
          <div className="rounded border border-line bg-white p-1.5">
            <Image
              src="/yvan/profile.png"
              alt={`${profile.name}, developer`}
              width={2048}
              height={2048}
              className="h-auto w-full rounded-[2px] object-cover"
              sizes="(max-width: 640px) 60vw, 180px"
            />
          </div>
          <figcaption className="mt-1.5 text-[10.5px] text-faint">
            yvan.png · 2048×2048
          </figcaption>
        </figure>

        <div className="order-1 space-y-4 sm:order-2">
          <div>
            <h3 className="text-lg font-semibold text-ink">{profile.name}</h3>
            <p className="text-[13px] text-green">{profile.title}</p>
          </div>

          <p className="prose-terminal">{profile.summary}</p>

          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-faint">
              how I work
            </p>
            <ul className="space-y-1">
              {profile.philosophy.map((item) => (
                <li key={item} className="flex gap-2 text-[13px] text-muted">
                  <span aria-hidden className="text-green">
                    ·
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-faint">
              interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <TechChip key={interest}>{interest}</TechChip>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => run("projects")} className="chip chip-lg">
              projects →
            </button>
            <button type="button" onClick={() => run("contact")} className="chip chip-lg">
              contact →
            </button>
          </div>
        </div>
      </div>
    </PanelFrame>
  );
}
