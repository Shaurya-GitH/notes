// Scroll-smoothness check: scrolls each page end to end with real wheel events (so Lenis drives
// the scroll, as for a visitor) in a real Chrome at 1440x900, motion on, and reports frames over
// 20 ms, long tasks, main-thread time and the CPU the renderer and GPU processes burn, scrolling
// and idle. No dependencies: Chrome DevTools Protocol over Node's WebSocket.
//
//   node scripts/perf/scroll.mjs http://localhost:8080 [--cpu 4] [--pages /,/journey] [--base URL]
//
// With --base, the same pages are measured on the base build too, and the run fails (exit 1) when
// a page misses its vsync on more than BUDGET more of its frames than the base's home does, or
// idles hotter.
import { spawn } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const args = process.argv.slice(2)
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d)
const site = args[0]?.startsWith("http") ? args[0] : "http://localhost:8080"
const base = opt("--base")
const cpu = Number(opt("--cpu", "1"))
const pages = opt("--pages", "/,/journey,/shipped,/System-Design/Rate-limiting").split(",")
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
// devtools-style overrides injected after load, to measure one suspect at a time
const css = opt("--css", "")
// --trace: busiest threads and their top events while scrolling, across every Chrome process
const trace = args.includes("--trace")
const BUDGET = 0.02 // share of frames that may miss their vsync beyond the base home's
const PORT = 9300 + Math.floor(Math.random() * 500)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const dir = mkdtempSync(join(tmpdir(), "perf-"))
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${dir}`,
  "--window-size=1440,1000",
  // headless by default so it never opens a window on the owner's screen; `--headed` to watch
  // (or to measure a high-refresh display, which headless Chrome does not emulate)
  ...(process.argv.includes("--headed") ? [] : ["--headless=new"]),
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  // a window another app covers stops drawing; measure it as if it were in front
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--disable-background-timer-throttling",
  "about:blank",
])

async function connect(url) {
  const ws = new WebSocket(url)
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)))
  let id = 0
  const wait = new Map()
  const on = new Map()
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data)
    if (d.id && wait.has(d.id)) (wait.get(d.id)(d), wait.delete(d.id))
    else if (d.method) on.get(d.method)?.(d.params)
  }
  const send = (method, params = {}) =>
    new Promise((r, j) => {
      wait.set(++id, (d) => (d.error ? j(new Error(method + ": " + d.error.message)) : r(d.result)))
      ws.send(JSON.stringify({ id, method, params }))
    })
  return { send, on: (e, f) => on.set(e, f), close: () => ws.close() }
}

let ver
for (let i = 0; i < 50 && !ver; i++) {
  await sleep(200)
  ver = await fetch(`http://127.0.0.1:${PORT}/json/version`)
    .then((r) => r.json())
    .catch(() => null)
}
const browser = await connect(ver.webSocketDebuggerUrl)
const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }).then(
  (r) => r.json(),
)
const page = await connect(target.webSocketDebuggerUrl)
await page.send("Page.enable")
await page.send("Performance.enable")
await page.send("Runtime.enable")
await page.send("LayerTree.enable")
let layers = 0
page.on("LayerTree.layerTreeDidChange", (p) => p.layers && (layers = p.layers.length))
await page.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 2,
  mobile: false,
})
await page.send("Emulation.setCPUThrottlingRate", { rate: cpu })

const evaluate = async (expr) =>
  (
    await page.send("Runtime.evaluate", {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    })
  ).result.value
// CPU seconds of the renderer and GPU processes (the compositor and raster work main-thread
// numbers miss)
async function procCpu() {
  const { processInfo } = await browser.send("SystemInfo.getProcessInfo")
  const sum = (t) => processInfo.filter((p) => p.type === t).reduce((s, p) => s + p.cpuTime, 0)
  return { renderer: sum("renderer"), gpu: sum("GPU") }
}
async function metrics() {
  const { metrics } = await page.send("Performance.getMetrics")
  return Object.fromEntries(metrics.map((m) => [m.name, m.value]))
}
const delta = (a, b, k) => b[k] - a[k]

const RECORDER = `(() => {
  window.__perf = { d: [], long: 0, longMs: 0, run: true }
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { __perf.long++; __perf.longMs += e.duration }))
    .observe({ type: "longtask" })
  let last = performance.now()
  const f = (t) => { __perf.d.push(t - last); last = t; if (__perf.run) requestAnimationFrame(f) }
  requestAnimationFrame(f)
})()`

async function measure(origin, path) {
  await page.send("Page.navigate", { url: origin + path })
  await sleep(4000) // load, fonts and the first paint of every plate
  layers = 0
  await page.send("LayerTree.disable")
  await page.send("LayerTree.enable") // re-enabling reports the whole tree
  await evaluate(`localStorage.setItem("motion","on"); document.documentElement.dataset.motion`)
  if (css)
    await evaluate(
      `document.head.append(Object.assign(document.createElement("style"), { textContent: ${JSON.stringify(css)} }))`,
    )

  // idle: 5 s with nothing touched
  let c0 = await procCpu()
  let m0 = await metrics()
  await sleep(5000)
  let c1 = await procCpu()
  let m1 = await metrics()
  const idle = {
    renderer: (c1.renderer - c0.renderer) / 5,
    gpu: (c1.gpu - c0.gpu) / 5,
    main: delta(m0, m1, "TaskDuration") / 5,
  }

  // scroll end to end: a wheel notch of 100 px every 50 ms, as a quick trackpad flick train
  await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 720, y: 450 })
  await evaluate(RECORDER)
  const events = []
  if (trace) {
    browser.on("Tracing.dataCollected", (d) => events.push(...d.value))
    await browser.send("Tracing.start", {
      traceConfig: {
        includedCategories: [
          "toplevel",
          "viz",
          "gpu",
          "cc",
          "benchmark",
          "disabled-by-default-devtools.timeline",
        ],
      },
    })
  }
  c0 = await procCpu()
  m0 = await metrics()
  const t0 = Date.now()
  for (let i = 0; i < 600; i++) {
    await page.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 100,
    })
    await sleep(50)
    if (
      i % 10 === 9 &&
      (await evaluate("scrollY + innerHeight >= document.documentElement.scrollHeight - 4"))
    )
      break
  }
  await sleep(800) // the glide settles
  const secs = (Date.now() - t0) / 1000
  c1 = await procCpu()
  m1 = await metrics()
  if (trace) {
    const done = new Promise((r) => browser.on("Tracing.tracingComplete", r))
    await browser.send("Tracing.end")
    await done
    const names = {}
    for (const e of events) if (e.name === "thread_name") names[e.pid + ":" + e.tid] = e.args.name
    const busy = {}
    for (const e of events) {
      if (e.ph !== "X" || !e.dur) continue
      const k = names[e.pid + ":" + e.tid] ?? "?"
      busy[k] ??= {}
      busy[k][e.name] = (busy[k][e.name] ?? 0) + e.dur / 1000
    }
    for (const [t, ev] of Object.entries(busy)) {
      const top = Object.entries(ev)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
      if (top[0][1] > 20)
        console.log("  trace", t, top.map(([n, ms]) => `${n} ${Math.round(ms)}ms`).join(", "))
    }
  }
  const p = await evaluate(
    "__perf.run = false, { d: __perf.d.slice(1), long: __perf.long, longMs: __perf.longMs, y: scrollY }",
  )
  const n = p.d.length
  const vsync = [...p.d].sort((a, b) => a - b)[Math.floor(n * 0.1)]
  return {
    page: origin.replace(/^https?:\/\//, "") + path,
    frames: n,
    fps: +(n / secs).toFixed(1),
    over20: p.d.filter((d) => d > 20).length,
    // a frame that missed its vsync (1.5x the display's interval: 12.5 ms on a 120 Hz screen)
    missed: +(p.d.filter((d) => d > 1.5 * vsync).length / n).toFixed(3),
    dropped: +(p.d.filter((d) => d > 20).length / n).toFixed(3),
    p95: +p.d.sort((a, b) => a - b)[Math.floor(n * 0.95)].toFixed(1),
    worst: p.d.slice(-3).map(Math.round).join("/"),
    jankMs: Math.round(p.d.filter((d) => d > 20).reduce((s, d) => s + d, 0)),
    longTasks: p.long,
    longMs: Math.round(p.longMs),
    scriptMs: Math.round(delta(m0, m1, "ScriptDuration") * 1000),
    styleLayoutMs: Math.round(
      (delta(m0, m1, "RecalcStyleDuration") + delta(m0, m1, "LayoutDuration")) * 1000,
    ),
    taskMs: Math.round(delta(m0, m1, "TaskDuration") * 1000),
    rendererCpu: +((c1.renderer - c0.renderer) / secs).toFixed(2),
    gpuCpu: +((c1.gpu - c0.gpu) / secs).toFixed(2),
    layers,
    idleRenderer: +idle.renderer.toFixed(2),
    idleGpu: +idle.gpu.toFixed(2),
    idleMain: +idle.main.toFixed(3),
  }
}

const rows = []
try {
  for (const origin of base ? [base, site] : [site])
    for (const path of pages) {
      const r = await measure(origin, path)
      rows.push(r)
      console.log(JSON.stringify(r))
    }
} finally {
  page.close()
  browser.close()
  chrome.kill()
  await sleep(300)
  rmSync(dir, { recursive: true, force: true })
}
console.table(rows)

if (base) {
  const ref = rows.find((r) => r.page.endsWith(base.replace(/^https?:\/\//, "") + "/"))
  const bad = rows.filter(
    (r) =>
      !r.page.startsWith(base.replace(/^https?:\/\//, "")) &&
      (r.missed > ref.missed + BUDGET ||
        r.idleRenderer + r.idleGpu > (ref.idleRenderer + ref.idleGpu) * 1.5 + 0.05),
  )
  for (const r of bad)
    console.error(
      `FAIL ${r.page}: missed vsync ${r.missed} (base home ${ref.missed}), idle cpu ${(r.idleRenderer + r.idleGpu).toFixed(2)} (base home ${(ref.idleRenderer + ref.idleGpu).toFixed(2)})`,
    )
  process.exit(bad.length ? 1 : 0)
}
