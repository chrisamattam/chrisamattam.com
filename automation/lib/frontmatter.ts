export function setFrontmatterField(source: string, field: string, value: string): string {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error("No frontmatter block found");
  const block = match[1];
  const lineRe = new RegExp(`^(${field}:\\s*).*$`, "m");
  if (!lineRe.test(block)) throw new Error(`Field not found in frontmatter: ${field}`);
  const newBlock = block.replace(lineRe, `$1${value}`);
  return source.replace(block, newBlock);
}
