// Parity measurements: for each page pair, records every probed element's box (document coords) and
// the computed styles that decide its look, in the design artifact and in the Quartz build, then
// reports each mismatch and a pixel-diff ratio (diff image: design/parity/out/<pair>-diff.png).
// Same servers as compare.js. Run: browser_run_code_unsafe({ filename: "design/parity/measure.js" })
async (page) => {
  const OUT = "design/parity/out/"
  const READER = "http://localhost:8766/test.html"
  const BUILD = "http://localhost:8080/"
  const PAIRS = [
    { name: "tls-light-desktop", proto: READER, build: BUILD + "Security/TLS", size: [1440, 900], theme: "light" },
    { name: "tls-dark-desktop", proto: READER, build: BUILD + "Security/TLS", size: [1440, 900], theme: "dark" },
    { name: "tls-light-phone", proto: READER, build: BUILD + "Security/TLS", size: [390, 844], theme: "light" },
    { name: "docker-light-desktop", proto: READER, slug: "Docker/Introduction", build: BUILD + "Docker/Introduction", size: [1440, 900], theme: "light" },
    { name: "docker-dark-phone", proto: READER, slug: "Docker/Introduction", build: BUILD + "Docker/Introduction", size: [390, 844], theme: "dark" },
    { name: "spring-dark-desktop", proto: READER, slug: "Spring/Introduction", build: BUILD + "Spring/Introduction", size: [1440, 900], theme: "dark" },
  ]
  // [label, selector]: the first match on each side is compared
  const PROBES = [
    ["body", "body"],
    ["left sidebar", ".sidebar.left"],
    ["page title", ".page-title"],
    ["search button", ".search > .search-button"],
    ["explorer header", ".explorer .desktop-explorer h2"],
    ["explorer list", ".explorer-content > ul.explorer-ul"],
    ["explorer note", ".explorer-content li > a:not(.folder-title)"],
    ["explorer folder", ".explorer-content a.folder-title"],
    ["theme button", ".darkmode"],
    ["reader button", ".readermode"],
    ["active note", ".explorer-content a.active"],
    ["centre column", ".center"],
    ["breadcrumbs", ".breadcrumb-container"],
    ["title", "h1.article-title"],
    ["content meta", ".content-meta"],
    ["article", "article"],
    ["paragraph", "article > p"],
    ["h2", "article h2"],
    ["h3", "article h3"],
    ["list item", "article li"],
    ["internal link", "article a.internal"],
    ["callout", "article .callout"],
    ["callout title", "article .callout-title-inner"],
    ["inline code", "article p code, article li code"],
    ["blockquote", "article blockquote:not(.callout)"],
    ["table", "article .table-container"],
    ["th", "article th"],
    ["maths", "article .katex"],
    ["strong", "article li > strong"],
    ["code block", "article pre"],
    ["hr", "article hr"],
    ["right rail", ".sidebar.right"],
    ["graph box", ".graph > .graph-outer"],
    ["toc link", ".toc-content a"],
    ["backlink", ".backlinks li > a"],
    ["footer", "footer"],
  ]
  const PROPS = ["font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "color",
    "background-color", "padding", "margin", "border-radius", "border-top", "border-left", "text-transform", "opacity"]
  const browser = page.context().browser()
  const visit = async (url, pr) => {
    const ctx = await browser.newContext({ viewport: { width: pr.size[0], height: pr.size[1] }, reducedMotion: "reduce" })
    await ctx.addInitScript((t) => localStorage.setItem("theme", t), pr.theme)
    const p = await ctx.newPage()
    await p.goto(url, { waitUntil: "commit", timeout: 60000 })
    await p.waitForFunction(() => document.readyState !== "loading", null, { timeout: 60000 })
    await p.evaluate(() => document.fonts && document.fonts.ready)
    await p.waitForTimeout(1500)
    // the design swaps its showcase notes in place, so open the wanted one through its own link
    if (url === pr.proto && pr.slug) {
      await p.evaluate((slug) => document.querySelector(`a[data-target="${slug}"]`).click(), pr.slug)
      await p.waitForTimeout(800)
    }
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }))
    await p.waitForTimeout(300)
    const data = await p.evaluate(([probes, props]) => {
      const out = {}
      for (const [label, sel] of probes) {
        const el = document.querySelector(sel)
        if (!el) { out[label] = null; continue }
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el)
        const st = {}
        for (const k of props) st[k] = cs.getPropertyValue(k)
        out[label] = { box: [r.left, r.top + scrollY, r.width, r.height].map((v) => Math.round(v * 10) / 10), st }
      }
      return out
    }, [PROBES, PROPS])
    const shot = await p.screenshot()
    await ctx.close()
    return { data, shot: shot.toString("base64") }
  }
  const report = {}
  for (const pr of PAIRS) {
    if (globalThis.PARITY_ONLY && !pr.name.startsWith(globalThis.PARITY_ONLY)) continue
    const a = await visit(pr.proto, pr), b = await visit(pr.build, pr)
    const diffs = []
    for (const [label] of PROBES) {
      const x = a.data[label], y = b.data[label]
      if (!x || !y) { if (x || y) diffs.push({ label, issue: x ? "missing in build" : "missing in design" }); continue }
      const box = x.box.map((v, i) => Math.round((y.box[i] - v) * 10) / 10)
      const off = box.some((d) => Math.abs(d) > 0.5)
      const st = {}
      for (const k of PROPS) if (x.st[k] !== y.st[k]) st[k] = [x.st[k], y.st[k]]
      if (off || Object.keys(st).length) diffs.push({ label, design: x.box, buildDelta: off ? box : undefined, styles: st })
    }
    // pixel diff, computed in a blank page from the two screenshots
    const cmp = await browser.newContext({ viewport: { width: pr.size[0], height: pr.size[1] }, reducedMotion: "reduce" })
    const cp = await cmp.newPage()
    const ratio = await cp.evaluate(async ([A, B]) => {
      const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = "data:image/png;base64," + s })
      const [ia, ib] = await Promise.all([load(A), load(B)])
      const w = ia.width, h = ia.height, c = document.createElement("canvas")
      c.width = w; c.height = h
      const x = c.getContext("2d")
      x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h)
      x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h)
      const o = x.createImageData(w, h)
      let n = 0
      for (let i = 0; i < da.data.length; i += 4) {
        const d = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2])
        const hit = d > 48
        if (hit) n++
        o.data[i] = hit ? 255 : da.data[i] * 0.25; o.data[i + 1] = hit ? 40 : da.data[i + 1] * 0.25
        o.data[i + 2] = hit ? 40 : da.data[i + 2] * 0.25; o.data[i + 3] = 255
      }
      x.putImageData(o, 0, 0)
      document.body.style.margin = 0
      document.body.appendChild(c)
      return n / (w * h)
    }, [a.shot, b.shot])
    await cp.screenshot({ path: `${OUT}${pr.name}-diff.png` })
    await cmp.close()
    report[pr.name] = { pixelsDifferent: Math.round(ratio * 1000) / 10 + "%", mismatches: diffs.length, diffs }
  }
  return report
}
