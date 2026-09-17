/**
 * The opening of a markdown body as one line of plain text, for listing
 * cards and share descriptions. Strips headings, emphasis, links and images
 * rather than rendering, which is enough for a teaser.
 */
export function excerpt(markdown: string, maxLength = 160): string {
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_>`~#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength).trim()}...` : plain;
}
