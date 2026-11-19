import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { profile } from "@/data/profile";

/**
 * The profile as plain, semantic HTML. Rendered twice: inside <noscript> for
 * visitors without JavaScript, and as an sr-only block that is removed on
 * hydration so crawlers see the content but screen-reader users never meet a
 * duplicate.
 */
export function StaticProfile() {
  return (
    <article className="space-y-8 text-sm">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-green">{profile.name}</h1>
        <p className="text-muted">{profile.title}</p>
        <div className="pt-1">
          <AvailabilityBadge />
        </div>
        <p>{profile.summary}</p>
        <p className="text-muted">
          <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
          {" · "}
          <a href={profile.resumeUrl}>Resume (PDF)</a>
        </p>
      </header>

      <section aria-labelledby="static-about">
        <h2 id="static-about" className="mb-2 text-green">
          About
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {profile.philosophy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3">
          Interests: {profile.interests.join(", ")}.
        </p>
      </section>

      <section aria-labelledby="static-skills">
        <h2 id="static-skills" className="mb-2 text-green">
          Skills
        </h2>
        {profile.skills.map((group) => (
          <p key={group.category}>
            <strong>{group.category}:</strong> {group.items.join(", ")}
          </p>
        ))}
      </section>

      <section aria-labelledby="static-projects">
        <h2 id="static-projects" className="mb-2 text-green">
          Projects
        </h2>
        <ul className="space-y-4">
          {profile.projects.map((project) => (
            <li key={project.slug}>
              <h3 className="font-medium">{project.name}</h3>
              <p>{project.description}</p>
              <p className="text-muted">Role: {project.role}</p>
              <p className="text-muted">Tech: {project.tech.join(", ")}</p>
              <p className="text-muted">
                Repository: pending link.
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="static-experience">
        <h2 id="static-experience" className="mb-2 text-green">
          Experience
        </h2>
        {profile.experience.map((role) => (
          <article key={`${role.company}-${role.start}`} className="mb-4">
            <h3 className="font-medium">
              {role.role} — {role.company}
            </h3>
            <p className="text-muted">
              {role.start} – {role.end}
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section aria-labelledby="static-education">
        <h2 id="static-education" className="mb-2 text-green">
          Education
        </h2>
        {profile.education.map((entry) => (
          <article key={entry.institution}>
            <h3 className="font-medium">{entry.degree}</h3>
            <p className="text-muted">
              {entry.institution} · {entry.start} – {entry.end}
            </p>
            {entry.detail ? <p>{entry.detail}</p> : null}
          </article>
        ))}
        <h3 className="mt-4 font-medium">Awards</h3>
        <ul className="list-disc space-y-1 pl-5">
          {profile.awards.map((award) => (
            <li key={award}>{award}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="static-contact">
        <h2 id="static-contact" className="mb-2 text-green">
          Contact
        </h2>
        <ul className="space-y-1">
          <li>
            Email:{" "}
            <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
          </li>
          {profile.contact.links.map((link) => (
            <li key={link.href}>
              {link.label}: <a href={link.href}>{link.href}</a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
