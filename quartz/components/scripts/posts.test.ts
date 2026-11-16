import assert from "node:assert/strict"
import test from "node:test"
import { runInNewContext } from "node:vm"
import { build } from "esbuild"

test("posts slideshow: no embed before the section is near, then only slides in view; failures keep the card", async () => {
  // The sandbox has no browser: a minimal DOM for the reel (three slides, one in view at a time).
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
    querySelector(s: string): El | null {
      if (s === "iframe") return this.children.find((c) => c.tag === "IFRAME") ?? null
      return null
    }
    setAttribute(k: string, v: string) {
      this.attrs[k] = v
    }
  }
  class Frame extends El {
    contentWindow = {}
    src = ""
    constructor() {
      super("IFRAME")
    }
  }
  const track = Object.assign(new El("UL"), { clientWidth: 400, scrollLeft: 0, scrolledTo: -1 })
  track.addEventListener("scroll", () => {})
  ;(track as any).scrollTo = ({ left }: { left: number }) => (track.scrolledTo = left)
  const x = "https://platform.twitter.com/embed/Tweet.html?id=1"
  const li = "https://www.linkedin.com/embed/feed/update/urn:li:activity:2?collapsed=1"
  for (const [i, src] of [x, li, li].entries()) {
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
  let probe: (ok: boolean) => void = () => {}
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
    fetch: () => new Promise((ok, no) => (probe = (y) => (y ? ok({}) : no(new Error("blocked"))))),
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

  assert.deepEqual(frames(), [0, 0, 0], "nothing third-party before the section is near")
  assert.equal(count.textContent, "1 / 3")
  near([{ isIntersecting: true }])
  assert.deepEqual(frames(), [1, 0, 0], "only the slide in view embeds")

  // X: the frame's own message is the sign it rendered
  const xFrame = slides[0].querySelector("iframe") as Frame
  win.dispatchEvent(Object.assign(new Event("message"), { source: xFrame.contentWindow }))
  assert.ok(slides[0].classList.contains("embedded"))

  // next: one step; the scroll it causes embeds the new slide
  next.dispatchEvent(new Event("click"))
  assert.equal(track.scrolledTo, 414)
  track.scrollLeft = 414
  track.dispatchEvent(new Event("scroll"))
  rafs.splice(0).forEach((fn) => fn())
  assert.equal(count.textContent, "2 / 3")
  assert.deepEqual(frames(), [1, 1, 0])

  // LinkedIn: a failed probe means an error page, so the frame goes and the card stays
  probe(false)
  await new Promise((r) => setImmediate(r))
  assert.deepEqual(frames(), [1, 0, 0])
  assert.ok(slides[1].classList.contains("failed"))

  // a hung embed falls back when its timer fires
  track.scrollLeft = 828
  track.dispatchEvent(new Event("scroll"))
  rafs.splice(0).forEach((fn) => fn())
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
