import { describe, it, expect } from "vitest";
import { setFrontmatterField } from "./frontmatter";

const SRC = `---
title: "Stable Money Dashboard"
status: active
badgeTone: green
---

Body stays.
`;

describe("setFrontmatterField", () => {
  it("replaces an unquoted value", () => {
    const out = setFrontmatterField(SRC, "status", "learned");
    expect(out).toContain("status: learned");
    expect(out).not.toContain("status: active");
    expect(out).toContain("Body stays.");
    expect(out).toContain('title: "Stable Money Dashboard"');
  });

  it("only edits inside the frontmatter block", () => {
    const withBody = SRC + "\nstatus: active in body\n";
    const out = setFrontmatterField(withBody, "status", "learned");
    expect(out).toContain("status: active in body");
  });

  it("throws when the field is missing", () => {
    expect(() => setFrontmatterField(SRC, "missing", "x")).toThrow();
  });
});
