import { profileSchema, type Profile } from "@/lib/profile-schema";

/**
 * Single source of truth for every personal fact on this site.
 * Nothing here may be invented: it all traces to Yvan's resume, brief, or
 * explicit instructions. Prose marked TODO(approval) was drafted from those
 * facts and needs Yvan's sign-off before release.
 */
const profileData: Profile = {
  name: "Yvan Maribbay",
  title: "Developer & AI Engineer",
  tagline: "Full-stack developer — enterprise systems and web applications.",
  summary:
    "Junior developer building enterprise insurance software in ASP.NET Blazor, with a full-stack background across React, Angular, Next.js and Express. Computer Science graduate of Cagayan State University, Cum Laude and Best Thesis.", // TODO(approval)
  philosophy: [
    "Ship in small increments, and unit-test what ships.", // TODO(approval)
    "Refactor while the map is still fresh in your head.", // TODO(approval)
    "Translate the workflow, not just the requirements.", // TODO(approval)
  ],
  interests: [
    // TODO(approval) — themes drawn from the resume's own projects and roles.
    "Enterprise software",
    "Sustainable, circular product design",
    "QR-driven systems",
    "Full-stack product work",
  ],
  availability: {
    // Yvan has not published availability. Do not render a status pill and do
    // not let the AI twin assume one.
    published: false,
  },
  skills: [
    {
      category: "Languages",
      items: ["C#", "JavaScript", "TypeScript", "Python"],
    },
    {
      category: "Frontend",
      items: ["React", "Angular", "Blazor", "Bootstrap"],
    },
    {
      category: "Backend",
      items: ["ASP.NET Core", "Next.js", "Express.js", "FastAPI"],
    },
    {
      category: "Databases",
      items: [
        "MSSQL",
        "MySQL",
        "MongoDB",
        "PostgreSQL",
        "Firebase",
        "Supabase",
        "Neon",
      ],
    },
    {
      category: "Platforms & tooling",
      items: [
        "Azure",
        "Docker",
        "GitHub",
        "Postman",
        "Visual Studio",
        "VS Code",
      ],
    },
    {
      category: "Design & collaboration",
      items: ["Figma", "Canva", "Miro"],
    },
  ],
  experience: [
    {
      company: "Thurston Software Solutions, Inc.",
      role: "Junior Developer 1",
      start: "Sep 2025",
      end: "Present",
      bullets: [
        "Designed, developed, debugged and unit-tested modules for an enterprise insurance system in ASP.NET Blazor.",
        "Delivered 5–7 new features per sprint, contributing roughly 30% of total sprint deliverables.",
        "Refactored about 20% of the legacy codebase, reducing redundancy and improving processing speed.",
      ],
      tech: ["ASP.NET Blazor", "C#", ".NET", "MSSQL"],
    },
    {
      company: "Department of Science and Technology — Region 2",
      role: "Full-Stack Developer Intern",
      start: "Jun 2024",
      end: "Aug 2024",
      bullets: [
        "Developed and deployed a Laboratory Inventory Management System (LIMS) for the DOST Region 2 Laboratory.",
        "Delivered three systems within a two-month internship, all on schedule.",
        "Worked with stakeholders to translate laboratory workflows into system features.",
      ],
      tech: ["PHP", "JavaScript", "SQL"],
    },
  ],
  projects: [
    {
      slug: "aqro",
      name: "AQRO",
      blurb:
        "QR-coded reusable takeout trays with a rebate for every valid scan, built on the MERN stack.",
      description:
        "A mobile application built with the MERN stack, paired with bioplastic takeout trays carrying unique QR codes. Each valid scan earns a rebate, giving customers a reason to return the container instead of throwing it away.", // TODO(approval)
      role: "Thesis project — BSc Computer Science", // TODO(approval)
      features: [
        "QR-coded bioplastic trays",
        "Scan-to-rebate flow",
        "Mobile app on the MERN stack",
        "Aims to cut single-use food packaging waste",
      ],
      tech: ["MongoDB", "Express.js", "React", "Node.js"],
      period: "2025",
    },
    {
      slug: "quickmark",
      name: "QuickMark",
      blurb:
        "QR-code attendance for students and professors, built with Ionic Angular and Supabase.",
      description:
        "A mobile application that replaces manual attendance with unique QR codes and streamlines class scheduling alongside it. Built with Ionic Angular and Supabase.", // TODO(approval)
      role: "Developer", // TODO(approval)
      features: [
        "Unique QR code per attendance check",
        "Class scheduling alongside attendance",
        "Reported 80% reduction in manual attendance handling",
      ],
      tech: ["Ionic", "Angular", "Supabase"],
    },
    {
      slug: "lims",
      name: "LIMS",
      blurb:
        "Laboratory inventory management for chemical stock, built during a DOST Region 2 internship.",
      description:
        "A repository system that lets laboratory technicians track the inflow and outflow of chemicals, with real-time monitoring of inventory records. Built with PHP, HTML, CSS, JavaScript and SQL during a full-stack internship at DOST Region 2.", // TODO(approval)
      role: "Full-stack developer intern — DOST Region 2", // TODO(approval)
      features: [
        "Chemical inflow and outflow tracking",
        "Real-time inventory monitoring",
        "Reporting for laboratory operations",
      ],
      tech: ["PHP", "JavaScript", "SQL", "HTML", "CSS"],
      period: "2024",
    },
  ],
  education: [
    {
      institution: "Cagayan State University — Carig Campus",
      degree: "Bachelor of Science in Computer Science",
      start: "Sep 2022",
      end: "Jul 2025",
      detail:
        "Thesis: “AQRO: QR-Coded Reusable Takeout Tray Food Containers” — a MERN stack mobile app paired with bioplastic trays embedded with unique QR codes, offering rebates for each valid scan.",
    },
  ],
  awards: [
    "Cum Laude",
    "Best Thesis",
    "Academic Awardee",
    "Leadership Awardee",
    "Hackathon / Start-up Alumni",
    "UNLEASH IDEATech Challenge 2024 — Finalist",
    "DICT Start-Up Challenge 2024 — Top 5",
  ],
  contact: {
    email: "maribbayyvan0@gmail.com",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Ymm-Dev",
        handle: "Ymm-Dev",
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/yvan-maribbay",
        handle: "in/yvan-maribbay",
      },
    ],
  },
  resumeUrl: "/yvan/yvan-maribbay-resume.pdf",
};

export const profile = profileSchema.parse(profileData);

export const hasAvailability = (p: Profile = profile) =>
  p.availability.published && Boolean(p.availability.label);
