import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { TerminalContext, type TerminalApi } from "@/components/terminal/context";
import { ChatPanel } from "@/components/panels/ChatPanel";
import { WelcomePanel } from "@/components/panels/WelcomePanel";
import { ProjectsPanel } from "@/components/panels/ProjectsPanel";
import { RecruiterPanel } from "@/components/panels/RecruiterPanel";
import { PrintBrief } from "@/components/PrintBrief";
import { CopyButton } from "@/components/ui/CopyButton";
import { profile } from "@/data/profile";
import type { ChatState } from "@/lib/terminal/types";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

function mount(ui: ReactNode, overrides: Partial<TerminalApi> = {}) {
  const api: TerminalApi = {
    run: vi.fn(),
    openPanel: vi.fn(),
    send: vi.fn(),
    resetChat: vi.fn(),
    chat: { messages: [], status: "idle" } as ChatState,
    twin: { status: "offline" },
    chatMode: false,
    ...overrides,
  };

  render(<TerminalContext.Provider value={api}>{ui}</TerminalContext.Provider>);
  return api;
}

describe("welcome panel", () => {
  it("puts About between Recruiter brief and Projects", () => {
    mount(<WelcomePanel />);
    const labels = screen
      .getAllByRole("button")
      .map((button) => button.textContent ?? "")
      .filter((text) => /Recruiter brief|About|Projects/.test(text));
    expect(labels.some((text) => text.includes("About"))).toBe(true);
    expect(labels[0]).toContain("Recruiter brief");
    expect(labels[2]).toContain("Projects");
  });
});

describe("projects panel", () => {
  it("links every project to its public repository", () => {
    mount(<ProjectsPanel />);
    expect(document.querySelectorAll(".pending")).toHaveLength(0);
    for (const project of profile.projects) {
      expect(project.repo).toBeTruthy();
      expect(project.repo).not.toMatch(/\.git$/);
      expect(document.querySelector(`a[href="${project.repo}"]`)).not.toBeNull();
    }
    expect(document.querySelector('a[href="https://chik-ai.vercel.app"]')).not.toBeNull();
    expect(document.querySelector('a[href="https://bantay-mu.vercel.app"]')).not.toBeNull();
  });

  it("opens a project detail through the inspect button", async () => {
    const api = mount(<ProjectsPanel />);
    const buttons = screen.getAllByRole("button", { name: /inspect/i });
    await userEvent.click(buttons[0]!);
    expect(api.openPanel).toHaveBeenCalledWith({
      type: "project",
      slug: profile.projects[0]!.slug,
    });
  });
});

describe("recruiter panel", () => {
  it("covers summary, skills, projects, experience and education", () => {
    mount(<RecruiterPanel />);
    expect(screen.getByText(profile.summary)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /strongest skills/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /selected projects/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /experience/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /education/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: profile.contact.email })).toHaveAttribute(
      "href",
      `mailto:${profile.contact.email}`,
    );
    expect(screen.getByRole("link", { name: /download resume/i })).toHaveAttribute(
      "href",
      profile.resumeUrl,
    );
    expect(screen.getByText("Open to work")).toBeInTheDocument();
  });
});

describe("chat panel", () => {
  it("labels the offline state and disables suggested questions", () => {
    mount(<ChatPanel />);
    expect(screen.getByText(/isn't connected right now/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tell me about yourself." }),
    ).toBeDisabled();
    expect(screen.getByText(/not the real person/i)).toBeInTheDocument();
  });

  it("introduces the twin in the first person and shows timestamps", () => {
    mount(<ChatPanel />, {
      twin: { status: "online", provider: "gemini", model: "gemini-3.1-flash-lite" },
      chat: {
        status: "idle",
        messages: [
          {
            id: "u1",
            role: "user",
            text: "Hello",
            at: Date.UTC(2026, 10, 19, 11, 31),
          },
        ],
      },
    });

    expect(screen.getByText(/Yvan's AI twin/i)).toBeInTheDocument();
    expect(screen.getByText(/not the real person/i)).toBeInTheDocument();
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it("offers a reset once a transcript exists", () => {
    mount(<ChatPanel />, {
      chat: {
        status: "idle",
        messages: [
          { id: "m1", role: "user", text: "hello", at: 0 },
          { id: "m2", role: "model", text: "hi", at: 1 },
        ],
      },
      twin: { status: "online" },
    });
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    expect(screen.queryByText(/isn't connected right now/i)).toBeNull();
  });
});

describe("copy button", () => {
  it("writes the value and confirms", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    mount(<CopyButton value={profile.contact.email} label="email" />);
    await userEvent.click(screen.getByRole("button", { name: /copy email/i }));
    expect(writeText).toHaveBeenCalledWith(profile.contact.email);
    await waitFor(() => {
      expect(screen.getByText("copied")).toBeInTheDocument();
    });
  });
});

describe("print brief", () => {
  it("contains the facts a recruiter needs on paper", () => {
    render(<PrintBrief />);
    expect(screen.getByText(profile.name)).toBeInTheDocument();
    expect(screen.getByText(profile.title)).toBeInTheDocument();
    expect(screen.getByText(profile.summary)).toBeInTheDocument();
    expect(screen.getByText("Open to work")).toBeInTheDocument();
    expect(document.body.textContent).toContain(profile.awards[0]);
    expect(document.body.textContent).toContain(profile.contact.email);
  });
});
