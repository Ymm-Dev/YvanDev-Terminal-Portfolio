import { profileSchema, type Profile } from "@/lib/profile-schema";

/**
 * Single source of truth for every personal fact on this site.
 * Nothing here may be invented: it all traces to Yvan's resume, brief, or
 * explicit instructions. Prose was reviewed and approved by Yvan.
 */
const profileData: Profile = {
  name: "Yvan Maribbay",
  title: "Developer & AI Engineer",
  tagline: "Full-stack developer — enterprise systems and web applications.",
  summary:
    "Junior developer building enterprise insurance software in ASP.NET Blazor, with a full-stack background across React, Angular, Next.js and Express. Computer Science graduate of Cagayan State University, Cum Laude and Best Thesis.",
  philosophy: [
    "Ship in small increments, and unit-test what ships.",
    "Refactor while the map is still fresh in your head.",
    "Translate the workflow, not just the requirements.",
  ],
  interests: [
    "Enterprise software",
    "Sustainable, circular product design",
    "QR-driven systems",
    "Full-stack product work",
  ],
  availability: {
    published: true,
    label: "Open to work",
    tone: "open",
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
        "QR-coded reusable food containers with a scan-to-rebate loop, built with React Native and an Express/MongoDB backend.",
      description:
        "A mobile application built with React Native and Expo, paired with reusable food and beverage containers carrying unique QR codes. Each valid scan earns a rebate, giving customers a reason to return the container instead of throwing it away.",
      role: "Thesis project — BSc Computer Science",
      features: [
        "QR-coded reusable containers",
        "Scan-to-rebate flow",
        "Mobile app on React Native and Expo",
        "Express/MongoDB backend with Docker",
      ],
      tech: [
        "React Native",
        "Expo",
        "Redux",
        "Express.js",
        "Socket.io",
        "MongoDB",
        "Docker",
      ],
      period: "2025",
      repo: "https://github.com/Ymm-Dev/AQRO",
    },
    {
      slug: "bantay",
      name: "Bantay",
      blurb:
        "A scam-SMS checker that scores messages locally and explains the verdict in Taglish.",
      description:
        "A privacy-first scam text checker for Philippine SMS. A deterministic TypeScript rules engine reads the message locally and scores it; only a stripped summary of the findings can reach an optional Groq model, which writes the explanation. The template explanation is always there if the model fails.",
      role: "Developer",
      features: [
        "Deterministic rules engine for scam signals",
        "Template explanations that work without a model",
        "On-device screenshot OCR with Tesseract.js",
        "Raw messages and URLs never sent to the LLM",
        "Taglish verdicts with reasons and next steps",
      ],
      tech: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Groq",
        "Tesseract.js",
        "Vercel",
      ],
      period: "2026",
      repo: "https://github.com/Ymm-Dev/Bantay",
      demo: "https://bantay-mu.vercel.app",
    },
    {
      slug: "chikai",
      name: "ChikAI",
      blurb:
        "A Taglish AI chat companion built with Next.js and Groq, deployed on Vercel.",
      description:
        "A minimalist AI chatbot that mixes English and Tagalog for playful “chika” conversations. Built with Next.js 14 and Tailwind CSS, it streams replies from Groq’s Llama 3.3 70B model, keeps the API key server-side, and remembers a dark or light theme preference.",
      role: "Developer",
      features: [
        "Streaming Taglish chat",
        "Groq Llama 3.3 70B responses",
        "Dark and light mode with saved preference",
        "Responsive UI deployed on Vercel",
      ],
      tech: [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Groq",
        "Vercel",
      ],
      period: "2026",
      repo: "https://github.com/Ymm-Dev/ChikAI",
      demo: "https://chik-ai.vercel.app",
    },
    {
      slug: "quickmark",
      name: "QuickMark",
      blurb:
        "QR-code attendance for students and professors, built with Ionic Angular and Supabase.",
      description:
        "A mobile application that replaces manual attendance with unique QR codes and streamlines class scheduling alongside it. Built with Ionic Angular and Supabase.",
      role: "Developer",
      features: [
        "Unique QR code per attendance check",
        "Class scheduling alongside attendance",
        "Reported 80% reduction in manual attendance handling",
      ],
      tech: ["Ionic", "Angular", "Supabase"],
      period: "2025",
      repo: "https://github.com/Ymm-Dev/QuickMark_v1",
    },
    {
      slug: "lims",
      name: "LIMS",
      blurb:
        "Laboratory inventory management for chemical stock, built during a DOST Region 2 internship.",
      description:
        "A repository system that lets laboratory technicians track the inflow and outflow of chemicals, with real-time monitoring of inventory records. Built with PHP, HTML, CSS, JavaScript and SQL during a full-stack internship at DOST Region 2.",
      role: "Full-stack developer intern — DOST Region 2",
      features: [
        "Chemical inflow and outflow tracking",
        "Real-time inventory monitoring",
        "Reporting for laboratory operations",
      ],
      tech: ["PHP", "JavaScript", "SQL", "HTML", "CSS"],
      period: "2024",
      repo: "https://github.com/Ymm-Dev/dost_lab",
    },
    {
      slug: "auto-shutdown",
      name: "Auto-Shutdown",
      blurb:
        "A small Python timer that shuts a Windows machine down after a set period.",
      description:
        "A Python utility for shared or lab machines: start a countdown (one hour by default) and the device shuts down when it ends. An optional admin password prompt keeps other users from cancelling it; it can be packaged as a standalone Windows executable with PyInstaller.",
      role: "Developer",
      features: [
        "Countdown timer before shutdown",
        "Admin-only control using a system password",
        "Console or GUI interface",
        "Windows-focused, packaged with PyInstaller",
      ],
      tech: ["Python", "PyInstaller", "Windows"],
      period: "2025",
      repo: "https://github.com/Ymm-Dev/Automatic-Shutdown",
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
