import assert from "node:assert/strict"
import test from "node:test"
import { runInNewContext } from "node:vm"
import { build } from "esbuild"

const x = "https://platform.twitter.com/embed/Tweet.html?id=1"
const li = "https://www.linkedin.com/embed/feed/update/urn:li:activity:2?collapsed=1"

async function slideshow(sources = [x, li, li], width = 400) {
  // A minimal DOM for the reel; geometry is supplied for each viewport and list size.
  class El extends EventTarget {
    children: El[] = []
    parent?: El
    classes = new Set<string>()
    classList = {
      add: (c: string) => this.classes.add(c),
      contains: (c: string) => this.classes.has(c),
    }
    dataset: Record<string, string> = {}
    attrs: Record<string, string> = {}
    textContent = ""
    constructor(
      public tag = "DIV",
      public offsetLeft = 0,
    ) {
      super()
    }
    get isConnected() {
      return !!this.parent
    }
    append(child: El) {
      child.parent = this
      this.children.push(child)
    }
    remove() {
      if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this)
      this.parent = undefined
    }
    querySelector(s: string): Frame | null {
      if (s === "iframe") return this.children.find((c) => c instanceof Frame) ?? null
      return null
    }
    setAttribute(k: string, v: string) {
      this.attrs[k] = v
    }
  }
  class Frame extends El {
    contentWindow = {}
    src = ""
    inert = false
    constructor() {
      super("IFRAME")
    }
  }
  const track = Object.assign(new El("UL"), { clientWidth: width, scrollLeft: 0, scrolledTo: -1 })
  track.addEventListener("scroll", () => {})
  ;(track as any).scrollTo = ({ left }: { left: number }) => (track.scrolledTo = left)
  for (const [i, src] of sources.entries()) {
    const s = new El("LI", i * 414)
    s.dataset.embed = src
    track.append(s)
  }
  const slides = track.children
  Object.assign(slides[0], { offsetWidth: 400 })
  const [prev, next, count] = [new El("BUTTON"), new El("BUTTON"), new El("P")]
  const reel = Object.assign(new El(), {
    querySelector: (s: string) =>
      ({ ".slides": track, ".prev": prev, ".next": next, ".count": count })[s] ?? null,
  })
  let near: (entries: { isIntersecting: boolean }[]) => void = () => {}
  const timers = new Map<number, () => void>()
  let rafs: (() => void)[] = []
  let probes = 0
  const cleanups: (() => void)[] = []
  const win = new EventTarget()
  const context = {
    document: Object.assign(new EventTarget(), {
      documentElement: { dataset: { motion: "on" } },
      querySelector: (s: string) => (s === ".pf-home .reel" ? reel : null),
      createElement: () => new Frame(),
    }),
    window: Object.assign(win, {
      addCleanup: (fn: () => void) => cleanups.push(fn),
      setTimeout: (fn: () => void) => (timers.set(timers.size + 1, fn), timers.size),
    }),
    addEventListener: win.addEventListener.bind(win),
    removeEventListener: win.removeEventListener.bind(win),
    clearTimeout: (id: number) => timers.delete(id),
    requestAnimationFrame: (fn: () => void) => (rafs.push(fn), rafs.length),
    cancelAnimationFrame: () => (rafs = []),
    getComputedStyle: () => ({ paddingLeft: "0px" }),
    fetch: () => {
      probes++
      return Promise.resolve({ type: "opaque", status: 0, ok: false })
    },
    IntersectionObserver: class {
      constructor(cb: typeof near) {
        near = cb
      }
      observe() {}
      disconnect() {}
    },
    MessageEvent: Event,
    Promise,
  }
  const bundle = await build({
    entryPoints: [new URL("./posts.inline.ts", import.meta.url).pathname],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
  })
  runInNewContext(bundle.outputFiles[0].text, context)
  const frames = () => slides.map((s) => (s.querySelector("iframe") ? 1 : 0))
  context.document.dispatchEvent(new Event("nav"))
  return {
    frames,
    slides,
    track,
    prev,
    next,
    count,
    win,
    timers,
    cleanups,
    near: () => near([{ isIntersecting: true }]),
    flush: () => rafs.splice(0).forEach((fn) => fn()),
    probes: () => probes,
  }
}

test("posts slideshow: no embed before the section is near, then only slides in view; failures keep the card", async () => {
  const { frames, slides, track, next, count, win, timers, cleanups, near, flush } =
    await slideshow()

  assert.deepEqual(frames(), [0, 0, 0], "nothing third-party before the section is near")
  assert.equal(count.textContent, "1 / 3")
  near()
  assert.deepEqual(frames(), [1, 0, 0], "only the slide in view embeds")

  // X: the frame's own message is the sign it rendered
  const xFrame = slides[0].querySelector("iframe")!
  win.dispatchEvent(Object.assign(new Event("message"), { source: xFrame.contentWindow }))
  assert.ok(slides[0].classList.contains("embedded"))

  // next: one step; the scroll it causes embeds the new slide
  next.dispatchEvent(new Event("click"))
  assert.equal(track.scrolledTo, 414)
  track.scrollLeft = 414
  track.dispatchEvent(new Event("scroll"))
  flush()
  assert.equal(count.textContent, "2 / 3")
  assert.deepEqual(frames(), [1, 1, 0])

  // A frame error removes the frame and keeps the card.
  slides[1].querySelector("iframe")!.dispatchEvent(new Event("error"))
  assert.deepEqual(frames(), [1, 0, 0])
  assert.ok(slides[1].classList.contains("failed"))

  // a hung embed falls back when its timer fires
  track.scrollLeft = 828
  track.dispatchEvent(new Event("scroll"))
  flush()
  assert.deepEqual(frames(), [1, 0, 1])
  ;[...timers.values()].forEach((fn) => fn())
  assert.ok(slides[2].classList.contains("failed"))
  assert.deepEqual(frames(), [1, 0, 0])

  // leaving the page removes the listeners: a click no longer steps
  cleanups.forEach((fn) => fn())
  track.scrolledTo = -1
  next.dispatchEvent(new Event("click"))
  assert.equal(track.scrolledTo, -1)
})

test("LinkedIn load keeps the fallback link available without an opaque probe", async () => {
  const { slides, near, probes, timers, cleanups } = await slideshow([li])
  near()
  const frame = slides[0].querySelector("iframe")!
  // A cross-origin error page emits the same load event as a successful post.
  frame.dispatchEvent(new Event("load"))
  await new Promise((r) => setImmediate(r))
  assert.equal(probes(), 0, "no extra request that cannot reveal HTTP errors")
  assert.ok(slides[0].classList.contains("loaded"))
  assert.equal(frame.inert, false)
  assert.equal(slides[0].classList.contains("embedded"), false, "do not hide LinkedIn's link")
  assert.equal(timers.size, 0)
  cleanups.forEach((fn) => fn())
})

test("pending frames stay inert until they render; a late load cannot undo timeout", async () => {
  const { slides, near, win, timers, cleanups } = await slideshow([x, li], 814)
  near()
  const xFrame = slides[0].querySelector("iframe")!
  const liFrame = slides[1].querySelector("iframe")!
  assert.equal(xFrame.inert, true)
  assert.equal(liFrame.inert, true)
  win.dispatchEvent(Object.assign(new Event("message"), { source: xFrame.contentWindow }))
  assert.equal(xFrame.inert, false)
  ;[...timers.values()].forEach((fn) => fn())
  liFrame.dispatchEvent(new Event("load"))
  assert.equal(liFrame.inert, true)
  assert.equal(slides[1].querySelector("iframe"), null)
  assert.ok(slides[1].classList.contains("failed"))
  assert.equal(slides[1].classList.contains("loaded"), false)
  cleanups.forEach((fn) => fn())
})

test("short desktop lists load every slide and keep indices nonnegative", async (t) => {
  for (const sources of [[x], [x, li]]) {
    await t.test(`${sources.length} post(s)`, async () => {
      const { frames, track, prev, next, count, near, flush, cleanups } = await slideshow(
        sources,
        1228,
      )
      assert.equal(count.textContent, sources.length === 1 ? "1 / 1" : "1–2 / 2")
      assert.equal(prev.attrs["aria-disabled"], "true")
      assert.equal(next.attrs["aria-disabled"], "true")
      near()
      assert.deepEqual(
        frames(),
        sources.map(() => 1),
      )
      next.dispatchEvent(new Event("click"))
      assert.equal(track.scrolledTo, 0)
      track.scrollLeft = -414
      track.dispatchEvent(new Event("scroll"))
      flush()
      assert.equal(count.textContent, sources.length === 1 ? "1 / 1" : "1–2 / 2")
      cleanups.forEach((fn) => fn())
    })
  }
})
