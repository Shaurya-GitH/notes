import assert from "node:assert/strict"
import test from "node:test"
import { runInNewContext } from "node:vm"
import { build } from "esbuild"

test("SPA navigation pauses demos and reloads sources on a retained video element", async () => {
  const calls: string[] = []
  const video = {
    source: "first.mp4",
    playing: false,
    load() {
      calls.push(`load:${this.source}`)
    },
    pause() {
      this.playing = false
      calls.push(`pause:${this.source}`)
    },
  }
  let videos = [video]
  const document = Object.assign(new EventTarget(), {
    querySelectorAll: (selector: string) => (selector === ".pf-case video" ? videos : []),
    querySelector: () => null,
  })
  const cleanups = new Set<() => void>()
  const window = { addCleanup: (fn: () => void) => cleanups.add(fn) }
  const bundle = await build({
    entryPoints: [new URL("./gallery.inline.ts", import.meta.url).pathname],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
  })
  runInNewContext(bundle.outputFiles[0].text, { document, window })
  const cleanup = () => {
    cleanups.forEach((fn) => fn())
    cleanups.clear()
  }
  const motion = (reduce: boolean) =>
    document.dispatchEvent(new CustomEvent("motionchange", { detail: { reduce } }))

  document.dispatchEvent(new Event("nav"))
  video.playing = true
  cleanup()
  assert.equal(video.playing, false, "leaving the page must stop playback")
  video.source = "second.mp4"
  document.dispatchEvent(new Event("nav"))
  assert.deepEqual(calls, ["load:first.mp4", "pause:first.mp4", "load:second.mp4"])
  motion(false)
  assert.equal(calls.length, 3)
  video.playing = true
  motion(true)
  assert.equal(video.playing, false)
  assert.equal(calls.length, 4, "only the current motion listener remains")
  cleanup()
  const afterCleanup = calls.length
  videos = []
  document.dispatchEvent(new Event("nav"))
  motion(true)
  assert.equal(calls.length, afterCleanup, "departed demos have no motion listener")
  cleanup()
})
