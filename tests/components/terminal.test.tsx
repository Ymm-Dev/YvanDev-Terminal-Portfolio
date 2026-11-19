import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Terminal } from "@/components/terminal/Terminal";

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        json: async () => ({ configured: false, provider: "offline" }),
      }),
    ),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("terminal boot", () => {
  it("reaches the welcome panel after a Strict Mode double-mount", async () => {
    render(
      <StrictMode>
        <Terminal />
      </StrictMode>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(document.querySelector("#panel-welcome")).not.toBeNull();
  });

  it("skip intro reveals the welcome panel immediately", async () => {
    render(<Terminal />);

    fireEvent.click(screen.getByRole("button", { name: /skip intro/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(document.querySelector("#panel-welcome")).not.toBeNull();
  });
});
