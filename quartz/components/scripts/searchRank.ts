import type { ContentDetails } from "../../plugins/emitters/contentIndex"

// The search ranking from the design: every word must appear in the title or the text ("#tag"
// words must be tags); a word in the title scores 10, a title starting with it 5 more.

export type Hit = { slug: string; d: ContentDetails; score: number }

export function snippet(text: string, terms: string[], len = 150) {
  const low = text.toLowerCase()
  let at = -1
  for (const t of terms) {
    const i = low.indexOf(t)
    if (i >= 0 && (at < 0 || i < at)) at = i
  }
  const s = Math.max(0, at - 40)
  return (s > 0 ? "…" : "") + text.slice(s, s + len) + (s + len < text.length ? "…" : "")
}

export function rank(index: Record<string, ContentDetails>, terms: string[], limit = 8): Hit[] {
  return Object.entries(index)
    .filter(([s]) => s !== "index")
    .map(([slug, d]) => {
      const t = d.title.toLowerCase(),
        body = (d.content ?? "").toLowerCase(),
        tags = (d.tags ?? []).map((x) => x.toLowerCase())
      const ok = terms.every((x) =>
        x.startsWith("#") ? tags.includes(x.slice(1)) : t.includes(x) || body.includes(x),
      )
      if (!ok) return null
      const score = terms.reduce(
        (a, x) => a + (t.includes(x) ? 10 : 0) + (t.startsWith(x) ? 5 : 0),
        0,
      )
      return { slug, d, score }
    })
    .filter((h): h is Hit => h !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
