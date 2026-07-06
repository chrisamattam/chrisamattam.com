import fs from "node:fs";
import path from "node:path";

/** The ONLY seam between compiled knowledge and inference. Swap the internals
 *  (Supabase store, retrieval layer, etc.) without touching the chat route. */
export type KnowledgeDoc = {
  markdown: string; // full compiled knowledge
  sources: string[]; // valid citation paths (from the manifest)
  compiledAt: string;
  tokenEstimate: number;
};

let cached: KnowledgeDoc | null = null;

export async function getSiteKnowledge(): Promise<KnowledgeDoc> {
  if (cached) return cached;
  const dir = path.join(process.cwd(), "data");
  // Fail closed: if the compiled knowledge is missing, the route must refuse to
  // serve rather than answer knowledge-free (see design §5).
  const markdown = fs.readFileSync(path.join(dir, "site-knowledge.md"), "utf8");
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "knowledge-manifest.json"), "utf8"));
  cached = {
    markdown,
    sources: manifest.sources,
    compiledAt: manifest.compiledAt,
    tokenEstimate: manifest.tokenEstimate,
  };
  return cached;
}
