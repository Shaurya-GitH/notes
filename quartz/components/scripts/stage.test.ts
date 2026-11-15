import assert from "node:assert/strict"
import test from "node:test"
import { runInNewContext } from "node:vm"
import { build } from "esbuild"

test("motion restarts replace generated rings and crows, and navigation removes them", async () => {
  // The sandbox cannot launch a browser. Supply the DOM boundary and paused animation driver;
  // execute the actual stage script, including its nav and motionchange event handlers.
  class Element extends EventTarget {
    children: Element[] = []
    parent?: Element
    style = {}
    dataset: Record<string, string> = {}
    classList = { remove() {} }
    innerHTML = ""
    attributes = new Map<string, string>()
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value)
    }
    appendChild(child: Element) {
      child.parent = this
      this.children.push(child)
    }
    remove() {
      if (this.parent) this.parent.children = this.parent.children.filter((el) => el !== this)
    }
    replaceChildren() {
      for (const child of [...this.children]) child.remove()
    }
    querySelectorAll(selector: string) {
      return this.children.filter((child) => child.attributes.get("class") === selector.slice(1))
    }
    querySelector() {
      return null
    }
    getBoundingClientRect() {
      return { top: 0 }
    }
    getContext() {
      return { setTransform() {} }
    }
  }

  const elements = new Map(
    [
      ".pf-stage",
      "#iris",
      "#rings",
      "#crows",
      "#flow",
      "#strands",
      "#reveal",
      "#eye",
      "#sky",
      "#field",
      "#scrim",
      "#beat-iris",
      "#beat-world",
      "#stops",
    ].map((selector) => [selector, new Element()]),
  )
  const html = new Element()
  html.dataset.motion = "on"
  const body = new Element()
  body.dataset.slug = "journey"
  const document = Object.assign(new EventTarget(), {
    documentElement: html,
    body,
    querySelector: (selector: string) => elements.get(selector) ?? null,
    querySelectorAll: () => [],
    createElement: () => new Element(),
    createElementNS: () => new Element(),
  })
  const cleanups: (() => void)[] = []
  let frames = 0
  const window = Object.assign(new EventTarget(), {
    document,
    addCleanup: (cleanup: () => void) => cleanups.push(cleanup),
  })
  const bundle = await build({
    entryPoints: [new URL("./stage.inline.ts", import.meta.url).pathname],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    external: ["animejs"],
  })
  runInNewContext(bundle.outputFiles[0].text, {
    document,
    window,
    require: (name: string) => {
      assert.equal(name, "animejs")
      return { animate: () => ({ seek() {}, revert() {}, duration: 1000 }), stagger: () => 0 }
    },
    Image: class {},
    matchMedia: () => ({ matches: false }),
    innerWidth: 834,
    innerHeight: 900,
    devicePixelRatio: 1,
    scrollY: 0,
    performance,
    requestAnimationFrame: () => ++frames,
    cancelAnimationFrame() {},
    clearTimeout() {},
  })

  const counts = () => ["#rings", "#crows"].map((id) => elements.get(id)?.children.length)
  document.dispatchEvent(new Event("nav"))
  assert.deepEqual(counts(), [16, 16])
  for (const motion of ["reduce", "on", "reduce", "on"]) {
    html.dataset.motion = motion
    document.dispatchEvent(new Event("motionchange"))
    assert.deepEqual(counts(), [16, 16], `generated children after motion=${motion}`)
  }
  cleanups.forEach((cleanup) => cleanup())
  assert.deepEqual(counts(), [0, 0])
  document.dispatchEvent(new Event("nav"))
  assert.deepEqual(counts(), [16, 16])

  // motion off schedules no frame loop at all
  html.dataset.motion = "reduce"
  const before = frames
  document.dispatchEvent(new Event("motionchange"))
  assert.equal(frames, before, "no requestAnimationFrame with motion off")
})
