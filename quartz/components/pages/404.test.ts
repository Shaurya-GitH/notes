import assert from "node:assert/strict"
import test from "node:test"
import { build } from "esbuild"
import { h } from "preact"
import { render } from "preact-render-to-string"

// The picture is assembled from paths, masks and two plates: one broken reference leaves a hole
// that fails silently. This checks the drawing is whole, not how it looks.
test("the 404 canvas draws real paths and every clip and gradient it uses exists", async () => {
  const bundle = await build({
    entryPoints: [new URL("./404.tsx", import.meta.url).pathname],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
  })
  const { default: NotFound } = await import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
  )
  const render404 = (baseUrl: string) =>
    render(h(NotFound(), { cfg: { baseUrl, locale: "en-US" } }))
  const html = render404("shauryamehta.me")

  const paths = [...html.matchAll(/ d="([^"]*)"/g)].map(([, d]) => d)
  assert.equal(paths.length, 3, `expected the three digits of 404, drew ${paths.length} paths`)
  for (const d of paths) {
    assert.doesNotMatch(d, /NaN|undefined|Infinity/, `broken path: ${d}`)
    assert.match(d, /^M[-\d]/, `path does not start at a point: ${d}`)
  }

  // the colour is masked onto the canvas, and the masks take their gradients: all must resolve
  for (const [, id] of html.matchAll(/url\("?#([\w-]+)"?\)/g)) {
    assert.ok(html.includes(`id="${id}"`), `${id} is referenced but never defined`)
  }
  for (const [, id] of html.matchAll(/href="#([\w-]+)"/g)) {
    assert.ok(html.includes(`id="${id}"`), `${id} is used but never defined`)
  }

  // the way out stays on the page
  assert.match(html, /Either this page is private/)
  assert.match(html, /<a class="nf-back" href="\/"/)

  for (const [baseUrl, root] of [
    ["shauryamehta.me", "/"],
    ["example.com/projects/notes", "/projects/notes"],
    ["example.com/projects/notes/", "/projects/notes/"],
  ]) {
    const page = render404(baseUrl)
    const images = [...page.matchAll(/<image\b[^>]*>/g)].map(([tag]) => [
      tag.match(/\bhref="([^"]+)"/)?.[1],
      tag.match(/\bmask="([^"]+)"/)?.[1],
    ])
    const plate = `${root.replace(/\/$/, "")}/static/vg/easel-lines`
    assert.deepEqual(images, [
      [`${plate}-ink.webp`, undefined],
      [`${plate}-canvas.webp`, "url(#nf-seep)"],
      [`${plate}-canvas.webp`, "url(#nf-colour)"],
    ])
    assert.equal(page.match(/<a class="nf-back" href="([^"]+)"/)?.[1], root)
  }
})
