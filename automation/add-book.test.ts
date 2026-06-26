import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addBook } from "./add-book";
import type { ExistingBook } from "./lib/library-entry";

let dir: string;
let libraryFile: string;
let readingPageFile: string;
let coversDir: string;

const LIBRARY_STUB = [
  `export const library = [`,
  `  { title: "Existing Book", author: "Author One", acquired: "2026-01-01", format: "Kindle" },`,
  `];`,
  ``,
].join("\n");

const READING_PAGE_STUB = [
  `export const metadata = {`,
  `  description: "A library of 5 books across Kindle, Audible, and physical shelves.",`,
  `};`,
  ``,
].join("\n");

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "add-book-"));
  libraryFile = join(dir, "library.ts");
  readingPageFile = join(dir, "page.tsx");
  coversDir = join(dir, "covers");
  mkdirSync(coversDir);
  writeFileSync(libraryFile, LIBRARY_STUB);
  writeFileSync(readingPageFile, READING_PAGE_STUB);
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("addBook", () => {
  it("adds a new book: inserts formatted line before ]; and bumps the count", () => {
    const result = addBook({
      title: "New Book",
      author: "Some Author",
      acquired: "2026-06-25",
      format: "Kindle",
      existingBooks: [],
      libraryFile,
      readingPageFile,
      coversDir,
    });

    expect(result.status).toBe("added");
    expect(result.slug).toBe("new-book");
    expect(result.coverSaved).toBe(false);

    const lib = readFileSync(libraryFile, "utf8");
    expect(lib).toContain(`title: "New Book"`);
    expect(lib).toContain(`author: "Some Author"`);
    // new entry must appear before the closing ];
    expect(lib.indexOf(`title: "New Book"`)).toBeLessThan(lib.lastIndexOf("];"));
    // original entry must still be present
    expect(lib).toContain(`title: "Existing Book"`);

    const page = readFileSync(readingPageFile, "utf8");
    expect(page).toContain("A library of 6 books");
  });

  it("skips a duplicate: writes nothing, returns skipped-duplicate", () => {
    const existing: ExistingBook[] = [
      { title: "New Book", author: "Some Author", format: "Kindle" },
    ];
    const libBefore = readFileSync(libraryFile, "utf8");
    const pageBefore = readFileSync(readingPageFile, "utf8");

    const result = addBook({
      title: "New Book",
      author: "Some Author",
      acquired: "2026-06-25",
      format: "Kindle",
      existingBooks: existing,
      libraryFile,
      readingPageFile,
      coversDir,
    });

    expect(result.status).toBe("skipped-duplicate");
    expect(result.slug).toBeNull();
    expect(result.coverSaved).toBe(false);
    expect(readFileSync(libraryFile, "utf8")).toBe(libBefore);
    expect(readFileSync(readingPageFile, "utf8")).toBe(pageBefore);
  });

  it("copies cover file and sets coverSaved true", () => {
    const fakeImage = join(dir, "source.jpg");
    writeFileSync(fakeImage, "FAKE_IMAGE_DATA");

    const result = addBook({
      title: "Covered Book",
      author: "Cover Author",
      acquired: "2026-06-25",
      format: "Kindle",
      coverSourceFile: fakeImage,
      existingBooks: [],
      libraryFile,
      readingPageFile,
      coversDir,
    });

    expect(result.status).toBe("added");
    expect(result.coverSaved).toBe(true);
    expect(result.slug).toBe("covered-book");
    expect(existsSync(join(coversDir, "covered-book.jpg"))).toBe(true);
    expect(readFileSync(join(coversDir, "covered-book.jpg"), "utf8")).toBe(
      "FAKE_IMAGE_DATA",
    );

    const lib = readFileSync(libraryFile, "utf8");
    expect(lib).toContain(`cover: "/images/books/covered-book.jpg"`);
  });

  it("adds book without cover: no cover field, coverSaved false", () => {
    const result = addBook({
      title: "No Cover Book",
      author: "No Cover Author",
      acquired: "2026-06-25",
      format: "Audible",
      existingBooks: [],
      libraryFile,
      readingPageFile,
      coversDir,
    });

    expect(result.status).toBe("added");
    expect(result.coverSaved).toBe(false);

    const lib = readFileSync(libraryFile, "utf8");
    expect(lib).toContain(`title: "No Cover Book"`);
    // The new entry line should not contain cover
    const lines = lib.split("\n");
    const newLine = lines.find((l) => l.includes(`title: "No Cover Book"`));
    expect(newLine).toBeDefined();
    expect(newLine).not.toContain("cover:");
  });

  it("throws for all-punctuation title", () => {
    expect(() =>
      addBook({
        title: "!!??",
        author: "Author",
        acquired: "2026-06-25",
        format: "Kindle",
        existingBooks: [],
        libraryFile,
        readingPageFile,
        coversDir,
      }),
    ).toThrow(/cannot derive slug from title/);
  });
});
