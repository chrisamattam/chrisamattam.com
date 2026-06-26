import { describe, it, expect } from "vitest";
import { formatLibraryEntry, isDuplicate, bumpReadingCount } from "./library-entry";

describe("formatLibraryEntry", () => {
  it("formats an entry with a cover", () => {
    expect(
      formatLibraryEntry({
        title: "Dune", author: "Frank Herbert", acquired: "2026-06-26",
        format: "Kindle", cover: "/images/books/dune.jpg",
      }),
    ).toBe(
      '  { title: "Dune", author: "Frank Herbert", acquired: "2026-06-26", format: "Kindle", cover: "/images/books/dune.jpg" },',
    );
  });

  it("omits cover when absent", () => {
    expect(
      formatLibraryEntry({
        title: "Dune", author: "Frank Herbert", acquired: "2026-06-26", format: "Kindle",
      }),
    ).toBe(
      '  { title: "Dune", author: "Frank Herbert", acquired: "2026-06-26", format: "Kindle" },',
    );
  });

  it("escapes double quotes in title/author", () => {
    expect(
      formatLibraryEntry({
        title: 'The "Best" Book', author: "A", acquired: "2026-06-26", format: "Physical",
      }),
    ).toContain('title: "The \\"Best\\" Book"');
  });
});

describe("isDuplicate", () => {
  const existing = [{ title: "Atomic Habits", author: "James Clear", format: "Kindle" }];
  it("matches case-insensitively on title+author+format", () => {
    expect(isDuplicate(
      { title: "atomic habits", author: "JAMES CLEAR", acquired: "x", format: "Kindle" },
      existing,
    )).toBe(true);
  });
  it("treats a different format as not a duplicate", () => {
    expect(isDuplicate(
      { title: "Atomic Habits", author: "James Clear", acquired: "x", format: "Audible" },
      existing,
    )).toBe(false);
  });
});

describe("bumpReadingCount", () => {
  it("increments the library count in the page description", () => {
    const src = 'description: "A library of 167 books across Kindle, Audible, and physical shelves.",';
    expect(bumpReadingCount(src, 2)).toContain("A library of 169 books");
  });
});
