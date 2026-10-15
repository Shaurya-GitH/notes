import { Element, ElementContent, Root } from "hast"
import { FullSlug, simplifySlug } from "./path"

// The sentence a note uses to link to another, for the backlinks rail: the text of the block that
// holds the first link to `target`, cut at 220 characters, with the link's own text marked.
// Mirrors the design prototype's build.py, but reads the rendered tree, so markdown links and
// wikilinks both count.

const BLOCKS = new Set(["p", "li", "td", "th", "dt", "dd", "h1", "h2", "h3", "h4", "h5", "h6"])
const LIMIT = 220

export interface BacklinkContext {
  before: string
  mark: string
  after: string
}

const classes = (el: Element): string[] => {
  const c: unknown = el.properties?.className
  return Array.isArray(c) ? c.map(String) : typeof c === "string" ? c.split(" ") : []
}

// plain text of a block: nested lists are separate lines in the source, and KaTeX is read as the
// TeX it was written in (its MathML copy and its drawn copy would otherwise both count)
function textOf(node: ElementContent | Root, top = true): string {
  if (node.type === "text") return node.value
  if (node.type !== "element" && node.type !== "root") return ""
  if (node.type === "element") {
    if (!top && (node.tagName === "ul" || node.tagName === "ol")) return ""
    const cls = classes(node)
    if (cls.includes("katex")) {
      const tex = findTag(node, "annotation")
      return tex ? textOf(tex, false) : ""
    }
    if (cls.includes("katex-display")) return ""
  }
  return node.children.map((c) => textOf(c as ElementContent, false)).join("")
}

function findTag(node: Element, tag: string): Element | undefined {
  for (const c of node.children) {
    if (c.type !== "element") continue
    if (c.tagName === tag) return c
    const hit = findTag(c, tag)
    if (hit) return hit
  }
}

// depth-first: the first internal link to target and the block that holds it
function findLink(
  node: Root | Element,
  target: string,
  block?: Element,
): { link: Element; block: Element } | undefined {
  for (const c of node.children) {
    if (c.type !== "element") continue
    const here = BLOCKS.has(c.tagName) ? c : block
    const slug = c.properties?.["data-slug"]
    if (c.tagName === "a" && typeof slug === "string" && simplifySlug(slug as FullSlug) === target)
      return here ? { link: c, block: here } : undefined
    const hit = findLink(c, target, here)
    if (hit) return hit
  }
}

export function backlinkContext(tree: Root | undefined, target: FullSlug): BacklinkContext | null {
  if (!tree) return null
  const found = findLink(tree, simplifySlug(target))
  if (!found) return null
  let text = textOf(found.block).replace(/\s+/g, " ").trim()
  const shown = textOf(found.link).replace(/\s+/g, " ").trim()
  // a line that is only the link (a folder's list of notes) says nothing new
  if (text.replace(/^[ .]+|[ .]+$/g, "") === shown) return null
  if (text.length > LIMIT) text = text.slice(0, LIMIT) + "…"
  const i = shown ? text.indexOf(shown) : -1
  if (i < 0) return { before: text, mark: "", after: "" }
  return { before: text.slice(0, i), mark: shown, after: text.slice(i + shown.length) }
}
