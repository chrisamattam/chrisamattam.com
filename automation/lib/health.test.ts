import { describe, it, expect } from "vitest";
import { classifyResponse, nextHealthState, shouldAutoRetire } from "./health";

describe("classifyResponse", () => {
  it("counts 2xx/3xx as up", () => {
    expect(classifyResponse({ ok: true, httpStatus: 200 })).toBe("up");
    expect(classifyResponse({ ok: true, httpStatus: 301 })).toBe("up");
  });
  it("counts 4xx/5xx and failures as down", () => {
    expect(classifyResponse({ ok: false, httpStatus: 503 })).toBe("down");
    expect(classifyResponse({ ok: false })).toBe("down");
  });
});

describe("nextHealthState", () => {
  it("records firstSeenDown on first failure", () => {
    const next = nextHealthState(undefined, { liveUrl: "u", result: "down" }, "2026-06-26");
    expect(next.firstSeenDown).toBe("2026-06-26");
    expect(next.lastStatus).toBe("down");
  });
  it("keeps the original firstSeenDown on continued failure", () => {
    const prev = { liveUrl: "u", lastStatus: "down" as const, firstSeenDown: "2026-06-10", lastChecked: "2026-06-25" };
    const next = nextHealthState(prev, { liveUrl: "u", result: "down" }, "2026-06-26");
    expect(next.firstSeenDown).toBe("2026-06-10");
    expect(next.lastChecked).toBe("2026-06-26");
  });
  it("clears firstSeenDown when back up", () => {
    const prev = { liveUrl: "u", lastStatus: "down" as const, firstSeenDown: "2026-06-10", lastChecked: "2026-06-25" };
    const next = nextHealthState(prev, { liveUrl: "u", result: "up" }, "2026-06-26");
    expect(next.firstSeenDown).toBeNull();
    expect(next.lastStatus).toBe("up");
  });
});

describe("shouldAutoRetire", () => {
  const downSince = { liveUrl: "u", lastStatus: "down" as const, firstSeenDown: "2026-06-10", lastChecked: "2026-06-26" };
  it("retires a live-status project down >= 7 days", () => {
    expect(shouldAutoRetire(downSince, "active", "2026-06-26", 7)).toBe(true);
  });
  it("does not retire before the threshold", () => {
    expect(shouldAutoRetire({ ...downSince, firstSeenDown: "2026-06-24" }, "active", "2026-06-26", 7)).toBe(false);
  });
  it("never retires an already-terminal status", () => {
    expect(shouldAutoRetire(downSince, "dead", "2026-06-26", 7)).toBe(false);
    expect(shouldAutoRetire(downSince, "learned", "2026-06-26", 7)).toBe(false);
  });
  it("does not retire when currently up", () => {
    expect(shouldAutoRetire({ ...downSince, firstSeenDown: null }, "active", "2026-06-26", 7)).toBe(false);
  });
});
