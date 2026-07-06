/**
 * Compiles all in-repo site content into a single knowledge document that the
 * clone chatbot injects (whole) into every request. Build-time only.
 *
 *   Outputs:  data/site-knowledge.md          (the compiled corpus)
 *             data/knowledge-manifest.json     (valid citation paths + metadata)
 *
 * Run: npx tsx automation/compile-knowledge.ts  (also wired into `prebuild`)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { config } from "./config";
import { mdxToText, estimateTokens, section, contentHash } from "./lib/knowledge-doc";
import { journey } from "../data/journey";
import { library } from "../data/library";

const ROOT = process.cwd();
const rel = (...p: string[]) => path.join(ROOT, ...p);
const listMdx = (dir: string) =>
  fs.existsSync(rel(dir)) ? fs.readdirSync(rel(dir)).filter((f) => f.endsWith(".mdx")).sort() : [];

type Section = { label: string; path: string; markdown: string };
const sections: Section[] = [];
const raw: string[] = []; // for the content hash
const add = (label: string, p: string, meta: string, body: string) => {
  sections.push({ label, path: p, markdown: section(label, p, meta, body) });
};

// ── Projects → /work/<slug> ──
for (const file of listMdx("content/projects")) {
  const src = fs.readFileSync(rel("content/projects", file), "utf8");
  raw.push(src);
  const { data, content } = matter(src);
  const meta = [data.role, data.company, data.period, data.status && `Status: ${data.status}`]
    .filter(Boolean)
    .join(" · ");
  const body = [data.summary, mdxToText(content)].filter(Boolean).join("\n\n");
  add(`Work → ${data.title}`, `/work/${data.slug}`, meta, body);
}

// ── Writing → /writing/<slug> (skip drafts) ──
for (const file of listMdx("content/posts")) {
  const src = fs.readFileSync(rel("content/posts", file), "utf8");
  const { data, content } = matter(src);
  if (data.draft) continue;
  raw.push(src);
  const body = [data.summary, mdxToText(content)].filter(Boolean).join("\n\n");
  add(`Writing → ${data.title}`, `/writing/${data.slug}`, data.date ?? "", body);
}

// ── Hiking → /hiking/<slug> ──
for (const file of listMdx("content/hikes")) {
  const src = fs.readFileSync(rel("content/hikes", file), "utf8");
  raw.push(src);
  const { data, content } = matter(src);
  const loc = data.location ? `${data.location.area}, ${data.location.state}` : "";
  const meta = [data.region, loc, data.difficulty && `Difficulty: ${data.difficulty}`]
    .filter(Boolean)
    .join(" · ");
  const body = [data.hook, mdxToText(content)].filter(Boolean).join("\n\n");
  add(`Hiking → ${data.name}`, `/hiking/${data.id}`, meta, body);
}

// ── Journey / experience → / (homepage timeline) ──
{
  const lines = journey.map(
    (m) => `- ${m.period} — ${m.title} at ${m.org}: ${m.description}`
  );
  raw.push(JSON.stringify(journey));
  add("Journey & experience", "/", "Career and education timeline", lines.join("\n"));
}

// ── Reading → /reading (titles/authors only; image paths stripped) ──
{
  const lines = library.map((b) => `- ${b.title} — ${b.author} (${b.format})`);
  raw.push(JSON.stringify(library.map((b) => [b.title, b.author, b.format])));
  add("Reading → Library", "/reading", `${library.length} books`, lines.join("\n"));
}

// ── Assemble ──
const intro =
  "# Chris Mattam — site knowledge base\n\n" +
  "This document is the ENTIRE universe of information the assistant may draw on. " +
  "Every section header links to the page it came from; cite that path for any claim. " +
  "If something is not written here, it is not known.\n";

const markdown = [intro, ...sections.map((s) => s.markdown)].join("\n");
const tokenEstimate = estimateTokens(markdown);
const sources = Array.from(new Set(sections.map((s) => s.path)));

const manifest = {
  compiledAt: new Date().toISOString(),
  contentHash: contentHash(raw),
  tokenEstimate,
  sectionCount: sections.length,
  sources,
};

fs.writeFileSync(rel("data/site-knowledge.md"), markdown);
fs.writeFileSync(rel("data/knowledge-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

const pct = Math.round((tokenEstimate / config.knowledgeTokenBudget) * 100);
console.log(
  `✓ Compiled ${sections.length} sections → ~${tokenEstimate.toLocaleString()} tokens ` +
    `(${pct}% of ${config.knowledgeTokenBudget.toLocaleString()} budget)`
);
if (tokenEstimate > config.knowledgeTokenBudget) {
  console.warn(
    `⚠ OVER BUDGET by ${(tokenEstimate - config.knowledgeTokenBudget).toLocaleString()} tokens — ` +
      `trim content or revisit the knowledge architecture (RAG threshold ~100K).`
  );
}
