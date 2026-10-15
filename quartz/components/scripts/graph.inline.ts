import type { ContentDetails } from "../../plugins/emitters/contentIndex"
import { FullSlug, getFullSlug, resolveRelative } from "../../util/path"

// Starry Notes graph: notes drawn as haloed stars on a 2D canvas. The local graph puts this note
// in the middle, the notes it links to on the right and the notes linking here on the left; the
// global graph is a small force layout seeded so each folder starts in its own region.

type Node = {
  id: string
  label: string
  unwritten: boolean
  deg: number
  x: number
  y: number
  vx?: number
  vy?: number
}
type Graph = {
  canvas: HTMLCanvasElement
  nodes: Node[]
  E: [number, number][]
  view: { s: number; x: number; y: number }
}
type Opts = { labels?: "near" | "all"; radial?: boolean; big?: boolean }

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim()

function simulate(
  nodes: Node[],
  edges: [string, string][],
  w: number,
  h: number,
  iters: number,
  k = 70,
) {
  nodes.forEach((n, i) => {
    n.x ??= w / 2 + Math.cos(i * 2.4) * (40 + i * 6)
    n.y ??= h / 2 + Math.sin(i * 2.4) * (40 + i * 6)
    n.vx = 0
    n.vy = 0
  })
  const idx = new Map(nodes.map((n, i) => [n.id, i]))
  const E = edges
    .map(([a, b]) => [idx.get(a), idx.get(b)])
    .filter((e): e is [number, number] => e[0] != null && e[1] != null)
  // ponytail: O(n²) repulsion; fine for a few hundred notes, use a quadtree if the vault grows
  for (let it = 0; it < iters; it++) {
    const t = 1 - it / iters
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i],
          b = nodes[j]
        const dx = a.x - b.x,
          dy = a.y - b.y,
          f = (k * k) / (dx * dx + dy * dy + 0.01)
        a.vx! += dx * f * 0.02
        a.vy! += dy * f * 0.02
        b.vx! -= dx * f * 0.02
        b.vy! -= dy * f * 0.02
      }
    for (const [i, j] of E) {
      const a = nodes[i],
        b = nodes[j]
      const dx = b.x - a.x,
        dy = b.y - a.y,
        d = Math.hypot(dx, dy) || 1,
        f = (d - k) * 0.04
      a.vx! += (dx / d) * f
      a.vy! += (dy / d) * f
      b.vx! -= (dx / d) * f
      b.vy! -= (dy / d) * f
    }
    for (const n of nodes) {
      n.vx! += (w / 2 - n.x) * 0.01
      n.vy! += (h / 2 - n.y) * 0.01
      const sp = Math.hypot(n.vx!, n.vy!)
      if (sp > 18) {
        n.vx! *= 18 / sp
        n.vy! *= 18 / sp
      }
      n.x += n.vx! * t
      n.y += n.vy! * t
      n.vx! *= 0.5
      n.vy! *= 0.5
    }
  }
  return E
}

// scale and centre a laid-out graph into its box
function fit(g: Graph, w: number, h: number, pad = 34) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity
  for (const n of g.nodes) {
    x0 = Math.min(x0, n.x)
    y0 = Math.min(y0, n.y)
    x1 = Math.max(x1, n.x)
    y1 = Math.max(y1, n.y)
  }
  const s = Math.min(
    1.6,
    (w - pad * 2) / Math.max(1, x1 - x0),
    (h - pad * 2) / Math.max(1, y1 - y0),
  )
  g.view = { s, x: w / 2 - ((x0 + x1) / 2) * s, y: h / 2 - ((y0 + y1) / 2) * s }
}

function drawGraph(g: Graph, current: string, hover: Node | null, opt: Opts = {}) {
  const canvas = g.canvas
  const dpr = Math.min(devicePixelRatio || 1, 2),
    w = canvas.clientWidth,
    h = canvas.clientHeight
  if (!w || !h) return
  if (canvas.width !== w * dpr) {
    canvas.width = w * dpr
    canvas.height = h * dpr
  }
  const c = canvas.getContext("2d")!
  c.setTransform(dpr, 0, 0, dpr, 0, 0)
  c.clearRect(0, 0, w, h)
  const { s, x: ox, y: oy } = g.view
  const P = (n: Node) => [n.x * s + ox, n.y * s + oy]
  const near = new Set<string>()
  if (hover) {
    near.add(hover.id)
    for (const [i, j] of g.E) {
      if (g.nodes[i] === hover) near.add(g.nodes[j].id)
      if (g.nodes[j] === hover) near.add(g.nodes[i].id)
    }
  }
  const ink = css("--lightgray"),
    accent = css("--node"),
    star = css("--star"),
    text = css("--darkgray"),
    muted = css("--gray")
  c.lineCap = "round"
  for (const [i, j] of g.E) {
    const a = g.nodes[i],
      b = g.nodes[j],
      [x1, y1] = P(a),
      [x2, y2] = P(b)
    const lit = hover && near.has(a.id) && near.has(b.id)
    c.strokeStyle = lit ? accent : ink
    c.globalAlpha = hover && !lit ? 0.35 : 0.9
    c.lineWidth = lit ? 1.8 : 1.1
    c.beginPath()
    c.moveTo(x1, y1)
    c.quadraticCurveTo((x1 + x2) / 2 + (y2 - y1) * 0.08, (y1 + y2) / 2 - (x2 - x1) * 0.08, x2, y2)
    c.stroke()
  }
  c.globalAlpha = 1
  for (const n of g.nodes) {
    const [x, y] = P(n),
      cur = n.id === current,
      dim = hover && !near.has(n.id)
    const r = cur ? 6.5 : 3.2 + Math.min(4, n.deg * 0.7)
    c.globalAlpha = dim ? 0.3 : 1
    if (cur || n === hover) {
      // the halo: two soft rings, after the swirls round his stars
      c.fillStyle = star
      c.globalAlpha = dim ? 0.1 : 0.18
      c.beginPath()
      c.arc(x, y, r * 2.6, 0, 7)
      c.fill()
      c.globalAlpha = dim ? 0.3 : 0.35
      c.beginPath()
      c.arc(x, y, r * 1.7, 0, 7)
      c.fill()
      c.globalAlpha = dim ? 0.3 : 1
    }
    if (n.unwritten) {
      c.strokeStyle = muted
      c.setLineDash([2, 2])
      c.lineWidth = 1.2
      c.beginPath()
      c.arc(x, y, r, 0, 7)
      c.stroke()
      c.setLineDash([])
    } else {
      c.fillStyle = cur ? star : accent
      c.beginPath()
      c.arc(x, y, r, 0, 7)
      c.fill()
    }
    const showLabel =
      opt.labels === "all" ||
      cur ||
      near.has(n.id) ||
      (opt.big ? !hover && n.deg >= 4 : opt.labels === "near" && !hover)
    if (!showLabel) continue
    c.font = `${cur ? 600 : 400} ${opt.big ? 12 : 11.5}px "Source Serif 4", Georgia, serif`
    c.fillStyle = n.unwritten ? muted : text
    if (opt.radial && !cur) {
      // labels point away from the centre so neighbours never collide
      const side = x >= w / 2
      c.textAlign = side ? "left" : "right"
      c.textBaseline = "middle"
      const tx = x + (side ? r + 5 : -r - 5),
        room = side ? w - tx - 6 : tx - 6
      let label = n.label
      while (label.length > 3 && c.measureText(label).width > room)
        label = label.slice(0, -2).trimEnd() + "…"
      c.fillText(label, tx, y)
      c.textBaseline = "alphabetic"
    } else {
      c.textAlign = "center"
      c.fillText(n.label, x, y + r + 13)
    }
  }
  c.globalAlpha = 1
}

function pick(g: Graph, ev: MouseEvent): Node | null {
  const r = g.canvas.getBoundingClientRect(),
    { s, x: ox, y: oy } = g.view,
    x = ev.clientX - r.left,
    y = ev.clientY - r.top
  let best: Node | null = null,
    bd = 14
  for (const n of g.nodes) {
    const d = Math.hypot(n.x * s + ox - x, n.y * s + oy - y)
    if (d < bd) {
      bd = d
      best = n
    }
  }
  return best
}

const labelOf = (index: Record<string, ContentDetails>, id: string) =>
  index[id]?.title ?? id.split("/").pop()!.replace(/-/g, " ")

function buildLocal(
  container: HTMLElement,
  index: Record<string, ContentDetails>,
  current: string,
): Graph {
  const canvas = document.createElement("canvas")
  canvas.setAttribute("role", "img")
  container.replaceChildren(canvas)
  const ids = new Set([current]),
    E: [string, string][] = []
  for (const l of index[current]?.links ?? []) {
    ids.add(l)
    E.push([current, l])
  }
  for (const [slug, d] of Object.entries(index))
    if ((d.links ?? []).includes(current as never)) {
      ids.add(slug)
      E.push([slug, current])
    }
  const nodes: Node[] = [...ids].map((id) => ({
    id,
    label: labelOf(index, id),
    unwritten: !index[id],
    deg: 0,
    x: 0,
    y: 0,
  }))
  nodes.forEach((n) => (n.deg = E.filter((e) => e.includes(n.id)).length))
  canvas.setAttribute(
    "aria-label",
    `Graph of ${labelOf(index, current)} and the ${nodes.length - 1} notes it connects to`,
  )
  // radial layout: this note in the middle, links out on the right, backlinks on the left
  const w = container.clientWidth || 260,
    h = container.clientHeight || 240
  const me = nodes.find((n) => n.id === current)!
  me.x = w / 2
  me.y = h / 2
  const outs = new Set<string>(index[current]?.links ?? [])
  const right = nodes.filter((n) => n !== me && outs.has(n.id)),
    left = nodes.filter((n) => n !== me && !outs.has(n.id))
  const R = Math.min(w * 0.24, h * 0.36)
  const place = (arr: Node[], a0: number, a1: number) =>
    arr.forEach((n, i) => {
      const a = arr.length === 1 ? (a0 + a1) / 2 : a0 + ((a1 - a0) * i) / (arr.length - 1)
      const r = R * (i % 2 ? 0.86 : 1)
      n.x = w / 2 + Math.cos(a) * r
      n.y = h / 2 + Math.sin(a) * r
    })
  place(right, -Math.PI * 0.42, Math.PI * 0.42)
  place(left, Math.PI * 1.42, Math.PI * 0.58)
  // also draw links between neighbours, so clusters show
  for (const a of nodes)
    for (const l of index[a.id]?.links ?? [])
      if (l !== current && a.id !== current && ids.has(l)) E.push([a.id, l])
  const at = new Map(nodes.map((n, i) => [n.id, i]))
  return {
    canvas,
    nodes,
    E: E.map(([a, b]) => [at.get(a)!, at.get(b)!]),
    view: { s: 1, x: 0, y: 0 },
  }
}

function buildGlobal(container: HTMLElement, index: Record<string, ContentDetails>): Graph {
  const canvas = document.createElement("canvas")
  canvas.style.width = "100%"
  canvas.style.height = "100%"
  canvas.setAttribute("role", "img")
  container.appendChild(canvas)
  const ids = new Set(Object.keys(index).filter((s) => s !== "index" && !s.startsWith("tags/"))),
    E: [string, string][] = []
  for (const s of [...ids])
    for (const l of index[s].links ?? [])
      if (l !== s) {
        if (!index[l]) ids.add(l)
        E.push([s, l])
      }
  const deg = new Map<string, number>()
  for (const [a, b] of E) {
    deg.set(a, (deg.get(a) ?? 0) + 1)
    deg.set(b, (deg.get(b) ?? 0) + 1)
  }
  // seed each folder in its own region so clusters read as constellations
  const W = container.clientWidth,
    H = container.clientHeight
  const folders = [...new Set([...ids].map((id) => id.split("/")[0]))]
  const nodes: Node[] = [...ids].map((id, i) => {
    const a = (folders.indexOf(id.split("/")[0]) / folders.length) * Math.PI * 2
    return {
      id,
      label: labelOf(index, id),
      unwritten: !index[id],
      deg: deg.get(id) ?? 0,
      x: W / 2 + Math.cos(a) * W * 0.28 + Math.cos(i) * 30,
      y: H / 2 + Math.sin(a) * H * 0.3 + Math.sin(i) * 30,
    }
  })
  const g: Graph = {
    canvas,
    nodes,
    E: simulate(nodes, E, W, H, 220, 46),
    view: { s: 1, x: 0, y: 0 },
  }
  fit(g, W, H, 60)
  container.querySelector(".global-graph-caption")!.textContent =
    `${nodes.filter((n) => !n.unwritten).length} notes · ${E.length} links · drag to pan, scroll to zoom`
  canvas.setAttribute("aria-label", `Graph of all ${nodes.length} notes`)
  return g
}

function open(current: string, n: Node | null) {
  if (!n || n.unwritten) return
  window.spaNavigate(
    new URL(resolveRelative(current as FullSlug, n.id as FullSlug), location.toString()),
  )
}

document.addEventListener("nav", async () => {
  const current = getFullSlug(window)
  const index = (await fetchData) as Record<string, ContentDetails>
  const cleanups: (() => void)[] = []
  const on = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement | Window | Document,
    type: K | string,
    fn: (e: any) => void,
    opts?: AddEventListenerOptions,
  ) => {
    el.addEventListener(type, fn, opts)
    cleanups.push(() => el.removeEventListener(type, fn, opts))
  }

  // ---------- local graph ----------
  const container = document.querySelector(".graph-container") as HTMLElement | null
  let local: Graph | null = null
  let hov: Node | null = null
  const drawLocal = () => local && drawGraph(local, current, hov, { labels: "near", radial: true })
  const renderLocal = () => {
    if (!container?.clientWidth) return
    local = buildLocal(container, index, current)
    hov = null
    const canvas = local.canvas
    canvas.addEventListener("pointermove", (e) => {
      const n = pick(local!, e)
      if (n === hov) return
      hov = n
      canvas.style.cursor = n && !n.unwritten ? "pointer" : "default"
      drawLocal()
    })
    canvas.addEventListener("pointerleave", () => {
      hov = null
      drawLocal()
    })
    canvas.addEventListener("click", (e) => open(current, pick(local!, e)))
    drawLocal()
  }
  renderLocal()
  // labels are drawn on canvas, so draw again once the web fonts have arrived
  document.fonts?.ready.then(drawLocal)
  // the phone rail opens the graph later (RailSummary), so build it whenever it becomes visible
  on(document, "railopen", renderLocal)
  let rz = 0
  on(window, "resize", () => {
    clearTimeout(rz)
    rz = window.setTimeout(renderLocal, 150)
  })

  // ---------- global graph ----------
  const outer = document.querySelector(".global-graph-outer") as HTMLElement | null
  let global: Graph | null = null
  let gHover: Node | null = null
  let lastFocus: Element | null = null
  const drawGlobal = () =>
    global && drawGraph(global, current, gHover, { big: true, labels: "near" })
  const openGlobal = () => {
    if (!outer || outer.classList.contains("active")) return
    lastFocus = document.activeElement
    // portal to <body> so no sidebar stacking context can sit above it
    document.body.appendChild(outer)
    outer.classList.add("active")
    window.lenis?.stop()
    const box = outer.querySelector(".global-graph-container") as HTMLElement
    box.innerHTML =
      '<button type="button" class="global-graph-close">Close</button><p class="global-graph-caption"></p>'
    global = buildGlobal(box, index)
    const canvas = global.canvas
    let drag: { x: number; y: number; vx: number; vy: number; moved: boolean } | null = null
    canvas.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, y: e.clientY, vx: global!.view.x, vy: global!.view.y, moved: false }
      canvas.setPointerCapture(e.pointerId)
    })
    canvas.addEventListener("pointermove", (e) => {
      if (drag) {
        const dx = e.clientX - drag.x,
          dy = e.clientY - drag.y
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true
        global!.view.x = drag.vx + dx
        global!.view.y = drag.vy + dy
        drawGlobal()
        return
      }
      const n = pick(global!, e)
      if (n !== gHover) {
        gHover = n
        canvas.style.cursor = n && !n.unwritten ? "pointer" : "grab"
        drawGlobal()
      }
    })
    canvas.addEventListener("pointerup", (e) => {
      if (drag && !drag.moved) {
        const n = pick(global!, e)
        if (n && !n.unwritten) {
          closeGlobal()
          open(current, n)
        }
      }
      drag = null
    })
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault()
        const r = canvas.getBoundingClientRect(),
          mx = e.clientX - r.left,
          my = e.clientY - r.top,
          v = global!.view,
          ns = Math.min(4, Math.max(0.5, v.s * (e.deltaY < 0 ? 1.1 : 0.9)))
        v.x = mx - ((mx - v.x) * ns) / v.s
        v.y = my - ((my - v.y) * ns) / v.s
        v.s = ns
        drawGlobal()
      },
      { passive: false },
    )
    box.querySelector(".global-graph-close")!.addEventListener("click", closeGlobal)
    drawGlobal()
    ;(box.querySelector(".global-graph-close") as HTMLElement).focus()
  }
  const closeGlobal = () => {
    if (!outer?.classList.contains("active")) return
    outer.classList.remove("active")
    global = null
    gHover = null
    window.lenis?.start()
    ;(lastFocus as HTMLElement | null)?.focus?.()
  }
  for (const icon of document.querySelectorAll(".global-graph-icon"))
    on(icon as HTMLElement, "click", openGlobal)
  // the backdrop (outside the sheet) closes it too
  if (outer) on(outer, "click", (e: MouseEvent) => e.target === outer && closeGlobal())
  on(document, "keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape") closeGlobal()
    if (e.key === "g" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault()
      outer?.classList.contains("active") ? closeGlobal() : openGlobal()
    }
  })
  on(document, "themechange", () => {
    drawLocal()
    drawGlobal()
  })
  window.addCleanup(() => {
    closeGlobal()
    clearTimeout(rz)
    cleanups.forEach((f) => f())
  })
})
