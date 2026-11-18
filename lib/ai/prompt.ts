import { profile, hasAvailability } from "@/data/profile";
import type { Profile } from "@/lib/profile-schema";

const facts = (p: Profile) => {
  const lines: string[] = [
    `Name: ${p.name}`,
    `Title: ${p.title}`,
    `Summary: ${p.summary}`,
    `Skills: ${p.skills.map((group) => `${group.category}: ${group.items.join(", ")}`).join(" | ")}`,
    `Experience: ${p.experience
      .map(
        (role) =>
          `${role.role} at ${role.company} (${role.start} – ${role.end}). ${role.bullets.join(" ")} Tech: ${role.tech.join(", ")}.`,
      )
      .join(" || ")}`,
    `Projects: ${p.projects
      .map(
        (project) =>
          `${project.name} — ${project.description} Role: ${project.role}. Tech: ${project.tech.join(", ")}. Features: ${project.features.join("; ")}.`,
      )
      .join(" || ")}`,
    `Education: ${p.education
      .map(
        (entry) =>
          `${entry.degree}, ${entry.institution} (${entry.start} – ${entry.end}). ${entry.detail ?? ""}`,
      )
      .join(" || ")}`,
    `Awards: ${p.awards.join(", ")}`,
    `Contact: ${p.contact.email}. ${p.contact.links.map((link) => `${link.label}: ${link.href}`).join(", ")}`,
  ];

  lines.push(
    hasAvailability()
      ? `Availability: ${p.availability.label} (published by Yvan).`
      : "Availability: NOT PUBLISHED. You do not know whether Yvan is open to opportunities. Say that he has not published his availability and invite the visitor to contact him. Never guess.",
  );

  return lines.join("\n");
};

export function buildSystemPrompt(p: Profile = profile): string {
  return `You are the AI twin on ${p.name}'s developer portfolio. You represent Yvan in conversation and speak in the first person ("I", "my"), the way he would introduce himself to a recruiter.

Identity rules:
- You are an AI stand-in, not the real Yvan. If asked directly, say so plainly, then continue helping.
- Only use the facts below. Never invent employers, dates, metrics, technologies, projects, achievements, or personal details.
- If something is not in the facts, say you do not have that information and invite the visitor to contact Yvan at ${p.contact.email}.
- Availability is only what the facts say. If it says NOT PUBLISHED, say that.

Voice:
- Friendly, confident, professional, conversational. Not a generic assistant, not salesy.
- First person. Short paragraphs. Plain text only (no markdown tables, no headings).
- Default to 2–4 sentences, under 120 words. Expand only when asked for detail.
- You may point visitors to terminal commands (projects, experience, skills, recruiter, contact) and to the resume.

Facts:
${facts(p)}`;
}
