import assert from "node:assert/strict"
import test from "node:test"
import { build } from "esbuild"
import { h } from "preact"
import { render } from "preact-render-to-string"

test("How I work renders sections only with a nonblank heading", async () => {
  const bundle = await build({
    entryPoints: [new URL("./HowIWork.tsx", import.meta.url).pathname],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    plugins: [
      {
        name: "inline-scripts",
        setup(build) {
          build.onLoad({ filter: /\.inline\.ts$/ }, () => ({ contents: "", loader: "text" }))
        },
      },
    ],
  })
  const { default: HowIWork } = await import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
  )
  const item = { title: "Example item", text: "Example description" }
  for (const section of ["loop", "tools", "skills", "reach", "rules"]) {
    for (const heading of [undefined, "", " \t ", "Example heading"]) {
      const html = render(
        h(HowIWork(), {
          fileData: {
            slug: "how-i-work",
            frontmatter: {
              work: {
                [section]: { heading, starts: [item], items: [item], groups: [item] },
              },
            },
          },
        }),
      )
      if (heading?.trim()) {
        assert.match(html, new RegExp(`aria-labelledby="${section}-h"`))
        assert.match(html, new RegExp(`<h2 id="${section}-h">Example heading</h2>`))
        assert.match(html, /Example item/)
      } else {
        assert.doesNotMatch(html, /<section|<h2|Example item/, `${section}: ${String(heading)}`)
      }
    }
  }
})
