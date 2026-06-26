import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import type { BookFormat } from "./config";
import { bookSlug, uniqueSlug } from "./lib/slug";
import {
  formatLibraryEntry,
  isDuplicate,
  bumpReadingCount,
  type NewBook,
  type ExistingBook,
} from "./lib/library-entry";

export interface AddBookOpts {
  title: string;
  author: string;
  acquired: string;
  format: BookFormat;
  coverSourceFile?: string;    // temp path to an already-validated cover image
  existingBooks?: ExistingBook[]; // injectable for tests; CLI passes the imported library
  libraryFile?: string;        // default: data/library.ts
  readingPageFile?: string;    // default: app/reading/page.tsx
  coversDir?: string;          // default: public/images/books
}

export interface AddBookResult {
  status: "added" | "skipped-duplicate";
  slug: string | null;         // null when skipped
  coverSaved: boolean;
}

export function addBook(opts: AddBookOpts): AddBookResult {
  const libraryFile =
    opts.libraryFile ?? join(process.cwd(), "data/library.ts");
  const readingPageFile =
    opts.readingPageFile ?? join(process.cwd(), "app/reading/page.tsx");
  const coversDir =
    opts.coversDir ?? join(process.cwd(), "public/images/books");

  const existingBooks: ExistingBook[] = opts.existingBooks ?? [];

  const candidate: NewBook = {
    title: opts.title,
    author: opts.author,
    acquired: opts.acquired,
    format: opts.format,
  };

  // 1. Dedup check
  if (isDuplicate(candidate, existingBooks)) {
    return { status: "skipped-duplicate", slug: null, coverSaved: false };
  }

  // 2. Derive slug — throw for empty result (all-punctuation title)
  const base = bookSlug(opts.title);
  if (!base) {
    throw new Error(
      `cannot derive slug from title: ${JSON.stringify(opts.title)}`,
    );
  }
  const slug = uniqueSlug(base, (s) => existsSync(join(coversDir, s + ".jpg")));

  // 3. Handle cover
  let coverSaved = false;
  if (opts.coverSourceFile) {
    copyFileSync(opts.coverSourceFile, join(coversDir, slug + ".jpg"));
    candidate.cover = `/images/books/${slug}.jpg`;
    coverSaved = true;
  }

  // 4. Build formatted entry line and insert into library file before closing ];
  const line = formatLibraryEntry(candidate);
  let libText = readFileSync(libraryFile, "utf8");
  const closingIdx = libText.lastIndexOf("];");
  if (closingIdx === -1) {
    throw new Error("Cannot find closing ]; in library file");
  }
  libText = libText.slice(0, closingIdx) + line + "\n" + libText.slice(closingIdx);
  writeFileSync(libraryFile, libText);

  // 5. Bump count in reading page
  let pageText = readFileSync(readingPageFile, "utf8");
  pageText = bumpReadingCount(pageText, 1);
  writeFileSync(readingPageFile, pageText);

  return { status: "added", slug, coverSaved };
}

// CLI entry point — mirrors the pattern in check-health.ts
if (process.argv[1] && process.argv[1].endsWith("add-book.ts")) {
  const args = process.argv.slice(2);
  function getArg(name: string): string | undefined {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : undefined;
  }

  const title = getArg("title");
  const author = getArg("author");
  const acquired = getArg("acquired");
  const format = getArg("format") as BookFormat | undefined;
  const cover = getArg("cover");

  if (!title || !author || !acquired || !format) {
    console.error(
      "Usage: npx tsx automation/add-book.ts " +
        "--title <title> --author <author> --acquired YYYY-MM-DD " +
        '--format "Kindle|Audible|Physical" [--cover /tmp/validated.jpg]',
    );
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { library } = require("../data/library") as {
    library: ExistingBook[];
  };

  const result = addBook({
    title,
    author,
    acquired,
    format,
    coverSourceFile: cover,
    existingBooks: library,
  });

  console.log(JSON.stringify(result, null, 2));
}
