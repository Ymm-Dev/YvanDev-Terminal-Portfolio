import { hasAvailability, profile } from "@/data/profile";

/**
 * Always server-rendered, always present in the DOM, visible only in print.
 * Designed to land on one A4 page: summary, evidence, two projects, education.
 */
export function PrintBrief() {
  const skillGroups = profile.skills.slice(0, 4);

  const compactLink = (href: string) =>
    href.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <article className="print-brief mx-auto max-w-[190mm] p-6 text-[10.5pt] leading-[1.4] text-black">
      <header className="mb-3 border-b border-black pb-2">
        <h1 className="text-[21pt] font-semibold leading-none">{profile.name}</h1>
        <p className="mt-1 text-[11.5pt]">{profile.title}</p>
        {hasAvailability() ? (
          <p className="mt-[1pt] text-[10pt] font-semibold">
            {profile.availability.label}
          </p>
        ) : null}
        <p className="mt-[2pt] text-[9pt]">
          {profile.contact.email} ·{" "}
          {profile.contact.links.map((link) => compactLink(link.href)).join(" · ")}
        </p>
      </header>

      <section className="mb-3">
        <h2 className="mb-[2pt] text-[10pt] font-semibold uppercase tracking-[0.12em]">
          Summary
        </h2>
        <p>{profile.summary}</p>
      </section>

      <section className="mb-3">
        <h2 className="mb-[2pt] text-[10pt] font-semibold uppercase tracking-[0.12em]">
          Skills
        </h2>
        <ul className="list-disc pl-4">
          {skillGroups.map((group) => (
            <li key={group.category}>
              <span className="font-semibold">{group.category}:</span>{" "}
              {group.items.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-3">
        <h2 className="mb-[2pt] text-[10pt] font-semibold uppercase tracking-[0.12em]">
          Experience
        </h2>
        {profile.experience.map((role, index) => {
          const bullets = index === 0 ? role.bullets : role.bullets.slice(0, 2);
          return (
            <div key={`${role.company}-${role.start}`} className="mb-1.5 last:mb-0">
              <p className="font-semibold">
                {role.role} — {role.company}{" "}
                <span className="font-normal">
                  ({role.start} – {role.end})
                </span>
              </p>
              <ul className="list-disc pl-4">
                {bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mb-3">
        <h2 className="mb-[2pt] text-[10pt] font-semibold uppercase tracking-[0.12em]">
          Selected projects
        </h2>
        {profile.projects.slice(0, 2).map((project) => (
          <div key={project.slug} className="mb-1.5 last:mb-0">
            <p>
              <span className="font-semibold">{project.name}</span> — {project.blurb}
            </p>
            <p className="text-[9.5pt]">Tech: {project.tech.join(", ")}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-[2pt] text-[10pt] font-semibold uppercase tracking-[0.12em]">
          Education &amp; awards
        </h2>
        {profile.education.map((entry) => (
          <p key={entry.institution}>
            <span className="font-semibold">{entry.degree}</span>, {entry.institution}{" "}
            ({entry.start} – {entry.end})
          </p>
        ))}
        <p className="mt-[2pt] text-[9.5pt]">{profile.awards.join(" · ")}</p>
      </section>
    </article>
  );
}
