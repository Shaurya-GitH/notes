import { FullSlug, simplifySlug } from "./path"

// Links to notes that do not exist yet ("unwritten"): no note, folder or tag page has that slug.
// Built once per page from every slug in the vault (CrawlLinks).
export function unwrittenChecker(allSlugs: FullSlug[]) {
  const written = new Set<string>(allSlugs.map((s) => simplifySlug(s)))
  const folders = new Set<string>(
    allSlugs.flatMap((s) =>
      s
        .split("/")
        .slice(0, -1)
        .map((_, i, parts) => parts.slice(0, i + 1).join("/")),
    ),
  )
  return (full: FullSlug) => {
    const simple = simplifySlug(full) as string
    return !(
      written.has(simple) ||
      folders.has(simple.replace(/\/$/, "")) ||
      full.startsWith("tags/") ||
      simple === "/" ||
      simple === ""
    )
  }
}
