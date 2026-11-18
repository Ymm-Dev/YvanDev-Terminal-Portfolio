import { z } from "zod";

export const availabilitySchema = z.object({
  published: z.boolean(),
  label: z.string().min(1).optional(),
  tone: z.enum(["open", "employed", "freelance", "custom"]).optional(),
});

export const skillGroupSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export const experienceEntrySchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1),
  tech: z.array(z.string().min(1)),
  href: z.string().url().optional(),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase, digits and dashes"),
  name: z.string().min(1),
  blurb: z.string().min(1),
  description: z.string().min(1),
  role: z.string().min(1),
  features: z.array(z.string().min(1)),
  tech: z.array(z.string().min(1)),
  period: z.string().optional(),
  repo: z.string().url().optional(),
  demo: z.string().url().optional(),
  image: z.string().optional(),
});

export const educationEntrySchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  detail: z.string().optional(),
});

export const contactLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  handle: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  philosophy: z.array(z.string().min(1)),
  interests: z.array(z.string().min(1)),
  availability: availabilitySchema,
  skills: z.array(skillGroupSchema).min(1),
  experience: z.array(experienceEntrySchema).min(1),
  projects: z.array(projectSchema).min(1),
  education: z.array(educationEntrySchema).min(1),
  awards: z.array(z.string().min(1)),
  certifications: z.array(z.string().min(1)).optional(),
  contact: z.object({
    email: z.string().email(),
    links: z.array(contactLinkSchema).min(1),
  }),
  resumeUrl: z.string().min(1),
});

export type Profile = z.infer<typeof profileSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type Project = z.infer<typeof projectSchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ContactLink = z.infer<typeof contactLinkSchema>;
