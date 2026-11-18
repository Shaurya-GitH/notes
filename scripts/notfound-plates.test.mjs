import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import sharp from "sharp"

test("rejecting a source with incompatible dimensions preserves both existing plates", async (t) => {
  const cwd = await mkdtemp(join(tmpdir(), "notfound-plates-"))
  t.after(() => rm(cwd, { recursive: true, force: true }))
  const source = join(cwd, "design/404")
  const output = join(cwd, "quartz/static/vg")
  await mkdir(source, { recursive: true })
  await mkdir(output, { recursive: true })
  await sharp({ create: { width: 500, height: 500, channels: 3, background: "#fff" } })
    .png()
    .toFile(join(source, "easel-lines.png"))

  const ink = join(output, "easel-lines-ink.webp")
  const canvas = join(output, "easel-lines-canvas.webp")
  await writeFile(ink, "existing ink")
  await writeFile(canvas, "existing canvas")
  const script = fileURLToPath(new URL("./notfound-plates.mjs", import.meta.url))
  await assert.rejects(
    promisify(execFile)(process.execPath, [script], { cwd }),
    /Expected a 1376 × 768 drawing, got 500 × 500/,
  )
  assert.equal(await readFile(ink, "utf8"), "existing ink")
  assert.equal(await readFile(canvas, "utf8"), "existing canvas")
})
