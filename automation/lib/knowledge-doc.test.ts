import { describe, it, expect } from "vitest";
import { mdxToText, estimateTokens, section, contentHash } from "./knowledge-doc";

describe("mdxToText", () => {
  it("strips MDX comments, imports/exports, and JSX tags", () => {
    const src = [
      "import Foo from './Foo'",
      "{/* a hidden note */}",
      '<Figure src="/x.jpg" caption="cap" />',
      "Real prose here.",
    ].join("\n");
    const out = mdxToText(src);
    expect(out).toContain("Real prose here.");
    expect(out).not.toContain("import");
    expect(out).not.toContain("hidden note");
    expect(out).not.toContain("<Figure");
  });

  it("collapses excess whitespace", () => {
    expect(mdxToText("a\n\n\n\nb   c")).toBe("a\n\nb c");
  });
});

describe("estimateTokens", () => {
  it("approximates 4 chars per token", () => {
    expect(estimateTokens("12345678")).toBe(2);
  });
});

describe("section", () => {
  it("embeds the citation path in the header", () => {
    const s = section("Work → BRE", "/work/bre", "Status: shipped", "Body.");
    expect(s).toContain("## [Work → BRE](/work/bre)");
    expect(s).toContain("Status: shipped");
    expect(s).toContain("Body.");
  });
});

describe("contentHash", () => {
  it("is deterministic and order-sensitive", () => {
    expect(contentHash(["a", "b"])).toBe(contentHash(["a", "b"]));
    expect(contentHash(["a", "b"])).not.toBe(contentHash(["b", "a"]));
  });
});
