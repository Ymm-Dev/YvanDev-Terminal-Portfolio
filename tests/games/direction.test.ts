import { describe, expect, it } from "vitest";
import { directionFromKey, OPPOSITE } from "@/lib/games/direction";

describe("direction helpers", () => {
  it("maps arrow keys and WASD case-insensitively", () => {
    expect(directionFromKey("ArrowUp")).toBe("up");
    expect(directionFromKey("ArrowDown")).toBe("down");
    expect(directionFromKey("ArrowLeft")).toBe("left");
    expect(directionFromKey("ArrowRight")).toBe("right");
    expect(directionFromKey("w")).toBe("up");
    expect(directionFromKey("A")).toBe("left");
    expect(directionFromKey("s")).toBe("down");
    expect(directionFromKey("D")).toBe("right");
  });

  it("ignores unrelated keys", () => {
    expect(directionFromKey("Enter")).toBeNull();
    expect(directionFromKey(" ")).toBeNull();
  });

  it("knows opposite directions", () => {
    expect(OPPOSITE.up).toBe("down");
    expect(OPPOSITE.down).toBe("up");
    expect(OPPOSITE.left).toBe("right");
    expect(OPPOSITE.right).toBe("left");
  });
});
