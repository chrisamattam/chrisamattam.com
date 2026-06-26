import { describe, it, expect } from "vitest";
import { bookSlug, uniqueSlug } from "./slug";

describe("bookSlug", () => {
  it("slugifies a simple title", () => {
    expect(bookSlug("Atomic Habits")).toBe("atomic-habits");
  });

  it("turns apostrophes and punctuation into single hyphens", () => {
    expect(bookSlug("A Midsummer Night's Dream")).toBe("a-midsummer-night-s-dream");
  });

  it("collapses runs and trims edges", () => {
    expect(bookSlug("  Range:  Why Generalists... ")).toBe("range-why-generalists");
  });

  it("hard-truncates to 60 chars matching the existing convention", () => {
    const title =
      "Discourse on the Method of Rightly Conducting One's Reason and of Seeking Truth in the Sciences";
    const slug = bookSlug(title);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug).toBe("discourse-on-the-method-of-rightly-conducting-one-s-reason-a");
  });

  it("never leaves a trailing hyphen after truncation", () => {
    // 'X' placed so char 61 is a hyphen boundary
    const slug = bookSlug("a".repeat(59) + " bbbb");
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("uniqueSlug", () => {
  it("returns base when unused", () => {
    expect(uniqueSlug("dune", () => false)).toBe("dune");
  });

  it("appends a counter when taken", () => {
    const taken = new Set(["dune", "dune-2"]);
    expect(uniqueSlug("dune", (s) => taken.has(s))).toBe("dune-3");
  });
});
