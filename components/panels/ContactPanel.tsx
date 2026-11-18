"use client";

import { useTerminal } from "@/components/terminal/context";
import { CopyButton } from "@/components/ui/CopyButton";
import { PanelFrame } from "@/components/ui/PanelFrame";
import { profile } from "@/data/profile";

export function ContactPanel({ id }: { id?: string }) {
  const { run } = useTerminal();

  return (
    <PanelFrame
      id={id}
      label="contact"
      meta="2 links · 1 inbox"
      footer={<span>fastest route: email · the twin can answer questions first</span>}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 rounded border border-line bg-bg/40 px-3 py-2.5">
          <span className="w-16 shrink-0 text-[11px] uppercase tracking-[0.14em] text-faint">
            email
          </span>
          <a
            href={`mailto:${profile.contact.email}`}
            className="min-w-0 flex-1 break-all text-[13.5px] text-cyan"
          >
            {profile.contact.email}
          </a>
          <CopyButton value={profile.contact.email} label="email address" compact />
        </div>

        {profile.contact.links.map((link) => (
          <div
            key={link.href}
            className="flex flex-wrap items-center gap-2 rounded border border-line bg-bg/40 px-3 py-2.5"
          >
            <span className="w-16 shrink-0 text-[11px] uppercase tracking-[0.14em] text-faint">
              {link.label}
            </span>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="min-w-0 flex-1 break-all text-[13.5px] text-cyan"
            >
              {link.handle ?? link.href}
            </a>
            <CopyButton value={link.href} label={`${link.label} URL`} compact />
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <a
            href={profile.resumeUrl}
            download
            className="chip chip-lg hover:text-ink"
          >
            ↓ resume.pdf
          </a>
          <button
            type="button"
            onClick={() => run("chat")}
            className="chip chip-lg text-purple hover:text-purple"
          >
            ask my AI twin
          </button>
        </div>

        <p className="pt-1 text-[11.5px] text-faint">
          No contact form: a real inbox, no spam pipeline, nothing stored.
        </p>
      </div>
    </PanelFrame>
  );
}
