import assert from "node:assert/strict"
import test from "node:test"
import { build } from "esbuild"
import { render } from "preact-render-to-string"
import { h } from "preact"

test("partial project media is omitted without hiding valid media or leaving empty sections", async () => {
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
})
