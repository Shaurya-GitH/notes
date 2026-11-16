import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import matter from "gray-matter"
import { build } from "esbuild"
import { render } from "preact-render-to-string"
import { h } from "preact"

test("project media rendering", async (t) => {
  // Quartz imports inline browser scripts as text when building server components.
  const bundle = await build({
    stdin: {
      contents: `export { CaseStudyHead, CaseStudyRest } from "./CaseStudy"
        export { default as Shipped } from "./Shipped"`,
      resolveDir: new URL(".", import.meta.url).pathname,
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    footer: { js: "//# sourceURL=projectMedia.bundle.mjs" },
    plugins: [
      {
        name: "inline-scripts",
        setup(build) {
          build.onLoad({ filter: /\.inline\.ts$/ }, () => ({ contents: "", loader: "text" }))
        },
      },
    ],
  })
  const { CaseStudyHead, CaseStudyRest, Shipped } = await import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
  )
  const draw = (
    component: typeof CaseStudyHead,
    frontmatter: Record<string, unknown>,
    allFiles = [],
  ) => render(h(component(), { fileData: { slug: "shipped/project", frontmatter }, allFiles }))
  const invalid = [{}, { src: "" }, { src: "   " }, { src: null }]
  for (const cover of invalid) {
    assert.doesNotMatch(draw(CaseStudyHead, { cover }), /hero-media|<img/)
    const card = draw(Shipped, {
      shipped: { projects: [{ kind: "At work", art: "field", cover }] },
    })
    assert.doesNotMatch(card, /art framed|<img/)
  }
  const empty = draw(CaseStudyRest, { gallery: invalid, video: invalid })
  assert.doesNotMatch(empty, /gallery-h|demo-h|<dialog|<video/)

  const media = draw(CaseStudyRest, {
    gallery: [...invalid, { src: "project/shot.webp", alt: "Screenshot" }],
    video: [...invalid, { src: "project/demo.mp4", title: "Demo" }],
  })
  assert.equal((media.match(/class="shot"/g) ?? []).length, 1)
  assert.match(media, /data-i="0"/)
  assert.match(media, /src="\.\.\/static\/shipped\/project\/shot.webp"/)
  assert.match(media, /src="\.\.\/static\/shipped\/project\/demo.mp4"/)
  assert.equal((media.match(/<video/g) ?? []).length, 1)
  assert.doesNotMatch(media, /undefined|null|poster=|<track/)
  assert.match(
    draw(CaseStudyHead, { cover: { src: "project/hero.webp", alt: "Cover" } }),
    /hero-media/,
  )
  const card = draw(Shipped, {
    shipped: {
      projects: [
        { kind: "At work", art: "field", cover: { src: "project/card.webp", alt: "Card" } },
      ],
    },
  })
  assert.match(card, /art framed/)
  assert.match(card, /project\/card.webp/)

  await t.test("mediaFirst places the demo and gallery before the cover", () => {
    // its own sample page, so content edits never break it
    const data = {
      title: "Sample",
      outcome: "A sample project",
      mediaFirst: true,
      cover: { src: "sample/cover.webp", alt: "Cover" },
      video: [{ src: "sample/demo.mp4", title: "Demo" }],
      gallery: [{ src: "sample/one.webp", alt: "One" }],
    }
    const head = draw(CaseStudyHead, data)
    const rest = draw(CaseStudyRest, data)
    assert.ok(head.indexOf("</h1>") < head.indexOf('id="demo-h"'))
    assert.ok(head.indexOf('id="demo-h"') < head.indexOf('id="gallery-h"'))
    assert.ok(head.indexOf('id="gallery-h"') < head.indexOf('class="hero-media"'))
    assert.doesNotMatch(rest, /id="demo-h"|id="gallery-h"/)
    const normal = { ...data, mediaFirst: false }
    assert.match(draw(CaseStudyHead, normal), /class="hero-media"/)
    assert.doesNotMatch(draw(CaseStudyHead, normal), /id="demo-h"|id="gallery-h"/)
    assert.match(draw(CaseStudyRest, normal), /id="demo-h"/)
    assert.match(draw(CaseStudyRest, normal), /id="gallery-h"/)
  })

  await t.test("shopping diagram reserves its intrinsic dimensions before loading", () => {
    const { data } = matter(readFileSync("content/shipped/shopping-assistant.md", "utf8"))
    const html = draw(CaseStudyRest, data)
    const img = html.match(/<img[^>]*src="[^"]*shopping-assistant\/architecture\.svg"[^>]*>/)?.[0]
    assert.ok(img, "shopping architecture diagram renders")
    assert.match(img, /width="600"/)
    assert.match(img, /height="660"/)
    assert.match(img, /loading="lazy"/)
  })
})
