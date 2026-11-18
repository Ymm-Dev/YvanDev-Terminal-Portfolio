"use client";

import Image from "next/image";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { profile } from "@/data/profile";
import { site } from "@/data/site";

export function NeofetchPanel({ id }: { id?: string }) {
  const rows: Array<[string, string]> = [
    ["user", `${site.shell.user}@${site.shell.host}`],
    ["role", profile.title],
    ["stack", "C# · TypeScript · Python"],
    ["editor", "VS Code"],
    ["projects", `${profile.projects.length} featured`],
    ["experience", `${profile.experience.length} roles`],
    ["degree", "BSc Computer Science"],
    ["availability", "not published"],
    ["uptime", "since 2022"],
  ];

  return (
    <PanelFrame id={id} label="neofetch" meta="portfolio edition" tone="accent">
      <div className="flex flex-col items-start gap-5 sm:flex-row">
        <div className="w-24 shrink-0 opacity-90">
          <Image
            src="/yvan/logo.png"
            alt=""
            width={400}
            height={400}
            className="h-auto w-full invert mix-blend-screen"
            aria-hidden
          />
        </div>
        <dl className="grid gap-1 text-[13px]">
          {rows.map(([key, value]) => (
            <div key={key} className="flex gap-3">
              <dt className="w-24 shrink-0 text-green">{key}</dt>
              <dd className="text-muted">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </PanelFrame>
  );
}
