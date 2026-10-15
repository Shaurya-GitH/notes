import test, { describe } from "node:test"
import assert from "node:assert"
import { Element, Root } from "hast"
import { backlinkContext } from "./backlinkContext"
import { FullSlug } from "./path"

const el = (tagName: string, children: Element["children"], properties = {}): Element => ({
  type: "element",
  tagName,
  properties,
  children,
})
const t = (value: string) => ({ type: "text" as const, value })
const link = (slug: string, text: string) =>
  el("a", [t(text)], { className: ["internal"], "data-slug": slug })
const root = (...children: Element[]): Root => ({ type: "root", children })

describe("backlinkContext", () => {
  test("marks the link inside its sentence", () => {
    const tree = root(
      el("ul", [
        el("li", [
          el("strong", [t("Process:")]),
          t(" Validation during the "),
          link("Security/TLS", "TLS"),
          t(" handshake."),
        ]),
      ]),
    )
    assert.deepStrictEqual(backlinkContext(tree, "Security/TLS" as FullSlug), {
      before: "Process: Validation during the ",
      mark: "TLS",
      after: " handshake.",
    })
  })

  test("skips a line that is only the link", () => {
    const tree = root(el("ul", [el("li", [link("Security/TLS", "TLS")])]))
    assert.strictEqual(backlinkContext(tree, "Security/TLS" as FullSlug), null)
  })

  test("ignores nested lists and reads maths as TeX", () => {
    const katex = el("span", [el("annotation", [t("g^a")]), t("ga-drawn")], {
      className: ["katex"],
    })
    const tree = root(
      el("ul", [
        el("li", [
          t("Uses "),
          katex,
          t(" with "),
          link("Security/RSA", "RSA"),
          el("ul", [el("li", [t("nested")])]),
        ]),
      ]),
    )
    assert.deepStrictEqual(backlinkContext(tree, "Security/RSA" as FullSlug), {
      before: "Uses g^a with ",
      mark: "RSA",
      after: "",
    })
  })

  test("cuts long blocks at 220 characters", () => {
    const long = "x".repeat(300)
    const tree = root(el("p", [link("A/B", "B"), t(" " + long)]))
    const ctx = backlinkContext(tree, "A/B" as FullSlug)!
    assert.strictEqual(ctx.mark, "B")
    assert.strictEqual((ctx.before + ctx.mark + ctx.after).length, 221)
    assert.ok(ctx.after.endsWith("…"))
  })

  test("no link, no context", () => {
    assert.strictEqual(backlinkContext(root(el("p", [t("plain")])), "A/B" as FullSlug), null)
  })
})
