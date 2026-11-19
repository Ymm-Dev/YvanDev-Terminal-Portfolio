export const site = {
  name: "Yvan Maribbay",
  shortName: "yvan",
  title: "Yvan Maribbay — Developer & AI Engineer",
  description:
    "Interactive terminal portfolio of Yvan Maribbay, a full-stack developer building enterprise systems and web applications.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://yvanterminal.vercel.app",
  locale: "en_US",
  shell: {
    user: "yvan",
    host: "portfolio",
  },
  resumeFileName: "Yvan-Maribbay-Resume.pdf",
  maxChatMessages: 8,
  maxChatChars: 800,
  maxChatTotalChars: 6_000,
} as const;
