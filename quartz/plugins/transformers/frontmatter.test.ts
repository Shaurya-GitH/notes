import assert from "node:assert/strict"
import test from "node:test"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { VFile } from "vfile"
import { FrontMatter } from "./frontmatter"
import type { BuildCtx } from "../../util/ctx"

test("object covers stay out of social metadata while string aliases retain precedence", async () => {
  const ctx = {
    cfg: { configuration: { locale: "en-US" } },
    allSlugs: [],
  } as unknown as BuildCtx
  const processor = unified().use(remarkParse).use(FrontMatter().markdownPlugins!(ctx))
  const parse = async (fields: string) => {
    const file = new VFile(`---\ntitle: Project\n${fields}\n---\n`)
    await processor.run(processor.parse(file), file)
    return file.data.frontmatter!
  }

  const objectCover = "cover:\n  src: project/hero.webp\n  alt: Project screenshot"
  const data = await parse(objectCover)
  assert.equal(data.socialImage, undefined)
  assert.deepEqual(data.cover, { src: "project/hero.webp", alt: "Project screenshot" })
  assert.equal((await parse("cover: legacy.webp")).socialImage, "legacy.webp")
  assert.equal((await parse(`image: image.webp\n${objectCover}`)).socialImage, "image.webp")
  assert.equal(
    (await parse(`socialImage: social.webp\nimage: image.webp\n${objectCover}`)).socialImage,
    "social.webp",
  )
})
