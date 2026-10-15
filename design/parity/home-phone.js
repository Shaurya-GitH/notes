// Home parity: the design artifact (design/prototype, port 8765) against the build's home page
// (port 8080), at matched story positions. Positions are in viewport heights from the top for the
// opening beats, and as progress through #spiral for the spiral (the build's reading panel holds
// all of index.md, so the spiral starts lower there). Reports probe mismatches, stage state, and
// a pixel-diff ratio per checkpoint; diff images land in design/parity/out/home-<name>-diff.png.
async (page) => {
  const OUT = "design/parity/out/"
  const PROTO = "http://localhost:8765/starry-notes.html"
  const BUILD = "http://localhost:8080/"
  const SIZE = [390, 844]
  const CHECKS = [
    { name: "v0", at: ["vh", 0] },
    { name: "v0.5", at: ["vh", 0.5] },
    { name: "v1", at: ["vh", 1] },
    { name: "v1.6", at: ["vh", 1.6] },
    { name: "v2.7", at: ["vh", 2.7] },
    { name: "spiral0", at: ["spiral", 0] },
    { name: "spiral50", at: ["spiral", 0.5] },
    { name: "spiral100", at: ["spiral", 1] },
  ]
  const PROBES = [
    ["sidebar", ".sidebar"],
    ["brand", ".sidebar .brand, .sidebar .page-title"],
    ["search", ".sidebar .search, .sidebar .search-button"],
    ["first folder", "#folders a, .explorer-content a.folder-title"],
    ["intro", ".panel.intro"],
    ["intro h1", ".panel.intro h1"],
    ["intro tag", ".panel.intro .tag"],
    ["quote", ".quote"],
    ["label", ".panel.label"],
    ["spiral head", ".spiral-head"],
    ["spiral h2", ".spiral-head h2"],
    ["first card", ".card"],
    ["mode", ".mode"],
  ]
  const PROPS = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color",
    "background-color", "padding", "border-radius", "opacity", "transform", "width", "height"]
  const LAYERS = ["#eye", "#sky", "#field", "#sky2", "#rings", "#flow", "#strands", "#scrim", ".wipe"]
  const browser = page.context().browser()
  const visit = async (url) => {
    const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] } })
    const p = await ctx.newPage()
    await p.goto(url, { waitUntil: "commit", timeout: 60000 })
    await p.waitForFunction(() => document.readyState !== "loading", null, { timeout: 60000 })
    await p.evaluate(() => document.fonts && document.fonts.ready)
    await p.waitForTimeout(2500)
    const res = {}
    for (const c of CHECKS) {
      // jump, then confirm the page really is there (retry if smooth scrolling moved it)
      for (let tries = 0; tries < 4; tries++) {
        const want = await p.evaluate(([kind, f]) => {
          const s = document.querySelector("#spiral")
          const top = Math.round(kind === "vh" ? f * innerHeight : s.getBoundingClientRect().top + scrollY + f * (s.offsetHeight - innerHeight))
          scrollTo({ top, behavior: "instant" })
          window.lenis?.scrollTo?.(top, { immediate: true })
          return top
        }, c.at)
        await p.waitForTimeout(1200)
        if (Math.abs((await p.evaluate(() => scrollY)) - want) <= 2) break
      }
      const data = await p.evaluate(([probes, props, layers]) => {
        const out = { probes: {}, layers: {} }
        for (const [label, sel] of probes) {
          const el = document.querySelector(sel)
          if (!el) { out.probes[label] = null; continue }
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el), st = {}
          for (const k of props) st[k] = cs.getPropertyValue(k)
          out.probes[label] = { box: [r.left, r.top, r.width, r.height].map((v) => Math.round(v)), st }
        }
        for (const sel of layers) {
          const el = document.querySelector(sel)
          if (el) out.layers[sel] = [(+getComputedStyle(el).opacity).toFixed(2), (el.style.transform || el.style.clipPath || "").slice(0, 60)]
        }
        return out
      }, [PROBES, PROPS, LAYERS])
      data.shot = (await p.screenshot()).toString("base64")
      res[c.name] = data
    }
    await ctx.close()
    return res
  }
  const A = await visit(PROTO), B = await visit(BUILD)
  const cmp = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] } })
  const cp = await cmp.newPage()
  const report = {}
  for (const c of CHECKS) {
    const a = A[c.name], b = B[c.name], diffs = []
    for (const [label] of PROBES) {
      const x = a.probes[label], y = b.probes[label]
      if (!x || !y) { if (x || y) diffs.push({ label, issue: x ? "missing in build" : "missing in design" }); continue }
      const d = x.box.map((v, i) => y.box[i] - v), st = {}
      for (const k of PROPS) if (x.st[k] !== y.st[k]) st[k] = [x.st[k], y.st[k]]
      if (d.some((v) => Math.abs(v) > 1) || Object.keys(st).length) diffs.push({ label, design: x.box, delta: d, st })
    }
    const layers = {}
    for (const k of Object.keys(a.layers)) if (JSON.stringify(a.layers[k]) !== JSON.stringify(b.layers[k])) layers[k] = [a.layers[k], b.layers[k]]
    const ratio = await cp.evaluate(async ([A, B]) => {
      const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = "data:image/png;base64," + s })
      const [ia, ib] = await Promise.all([load(A), load(B)])
      const w = ia.width, h = ia.height, cv = document.createElement("canvas")
      cv.width = w; cv.height = h
      const x = cv.getContext("2d")
      x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h)
      x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h)
      const o = x.createImageData(w, h)
      let n = 0
      for (let i = 0; i < da.data.length; i += 4) {
        const hit = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]) > 48
        if (hit) n++
        o.data[i] = hit ? 255 : da.data[i] * 0.25; o.data[i + 1] = hit ? 40 : da.data[i + 1] * 0.25
        o.data[i + 2] = hit ? 40 : da.data[i + 2] * 0.25; o.data[i + 3] = 255
      }
      x.putImageData(o, 0, 0)
      document.body.replaceChildren(cv)
      document.body.style.margin = 0
      return n / (w * h)
    }, [a.shot, b.shot])
    await cp.screenshot({ path: `${OUT}home-phone-${c.name}-diff.png` })
    report[c.name] = { pixels: (ratio * 100).toFixed(1) + "%", diffs, layers }
  }
  await cmp.close()
  return report
}
