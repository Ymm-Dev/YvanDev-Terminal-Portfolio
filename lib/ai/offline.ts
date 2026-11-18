import { profile } from "@/data/profile";
import type { ChatProvider } from "./provider";

export const OFFLINE_MESSAGE = [
  "My AI twin isn't connected right now — this build has no model key configured, and I would rather say that than pretend.",
  "",
  "Everything factual on this site is still one command away: `recruiter` for the short version, `projects` for the work, `experience` for the roles, or `contact` to reach the real Yvan.",
].join("\n");

export const OFFLINE_CONTACT = profile.contact.email;

export function createOfflineProvider(): ChatProvider {
  return {
    id: "offline",
    configured: false,
    async *stream() {
      // Stream in small chunks so the UI exercises the same path as a live model.
      for (const chunk of OFFLINE_MESSAGE.match(/.{1,28}/gs) ?? [OFFLINE_MESSAGE]) {
        yield chunk;
      }
    },
  };
}
