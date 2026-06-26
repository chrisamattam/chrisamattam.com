import type { BookFormat } from "../config";

export interface NewBook {
  title: string;
  author: string;
  acquired: string;
  format: BookFormat;
  cover?: string;
}

export interface ExistingBook {
  title: string;
  author: string;
  format: string;
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function formatLibraryEntry(book: NewBook): string {
  const parts = [
    `title: ${quote(book.title)}`,
    `author: ${quote(book.author)}`,
    `acquired: ${quote(book.acquired)}`,
    `format: ${quote(book.format)}`,
  ];
  if (book.cover) parts.push(`cover: ${quote(book.cover)}`);
  return `  { ${parts.join(", ")} },`;
}

function norm(value: string): string {
  return value.trim().toLowerCase();
}

export function isDuplicate(book: NewBook, existing: ExistingBook[]): boolean {
  return existing.some(
    (e) =>
      norm(e.title) === norm(book.title) &&
      norm(e.author) === norm(book.author) &&
      norm(e.format) === norm(book.format),
  );
}

export function bumpReadingCount(pageSource: string, delta: number): string {
  return pageSource.replace(
    /A library of (\d+) books/,
    (_m, n: string) => `A library of ${Number(n) + delta} books`,
  );
}
