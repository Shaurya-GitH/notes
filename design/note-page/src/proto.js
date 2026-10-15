;(() => {
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches
  const INDEX = JSON.parse($("#content-index").textContent)
  const SHOWCASE = JSON.parse($("#showcase").textContent)
  const LIVE = "https://shaurya-gith.github.io/notes/"
  const root = document.documentElement
  const store = {
    get(k) {
      try {
        return localStorage.getItem(k)
      } catch {
        return null
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v)
      } catch {}
    },
  }
  const folderOf = (slug) =>
    INDEX[slug]?.folder ?? slug.split("/").slice(0, -1).join("/").replace(/-/g, " ")
  const isShowcase = (slug) => SHOWCASE.includes(slug)
  let current = $("body").dataset.slug || SHOWCASE[0]
  document.body.dataset.slug = current

  // ---------- theme: follow the viewer's choice, then the page's own toggle ----------
  function systemTheme() {
    const dt = root.getAttribute("data-theme")
    if (dt === "dark" || dt === "light") return dt
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  function setTheme(t) {
    root.setAttribute("saved-theme", t)
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t } }))
  }
  setTheme(store.get("theme") || systemTheme())
  new MutationObserver(() => {
    if (!store.get("theme")) setTheme(systemTheme())
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] })
  $("button.darkmode").addEventListener("click", () => {
    const t = root.getAttribute("saved-theme") === "dark" ? "light" : "dark"
    store.set("theme", t)
    setTheme(t)
  })
  $("button.readermode").addEventListener("click", () => {
    const on = root.getAttribute("reader-mode") === "on"
    root.setAttribute("reader-mode", on ? "off" : "on")
    $("button.readermode").setAttribute("aria-pressed", String(!on))
  })
  $("button.readermode").setAttribute("aria-pressed", "false")

  // ---------- links: showcase notes swap in place, the rest open the live site ----------
  function hrefFor(slug) {
    return LIVE + slug
  }
  function wireLink(a, slug) {
    a.href = hrefFor(slug)
    a.dataset.target = slug
    if (!isShowcase(slug)) {
      a.target = "_blank"
      a.rel = "noopener"
    }
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-target]")
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return
    if (a.classList.contains("unwritten")) {
      e.preventDefault()
      return
    }
    if (isShowcase(a.dataset.target)) {
      e.preventDefault()
      go(a.dataset.target)
    }
  })

  // ---------- explorer (Quartz markup, chevron promoted to a button) ----------
  const tree = { children: new Map(), slug: "", name: "" }
  for (const slug of Object.keys(INDEX).sort()) {
    if (slug === "index" || slug.startsWith("tags/")) continue
    const parts = slug.split("/"),
      file = INDEX[slug]
    let node = tree,
      path = ""
    parts.slice(0, -1).forEach((seg, i) => {
      path = path ? path + "/" + seg : seg
      if (!node.children.has(seg))
        node.children.set(seg, {
          children: new Map(),
          slug: path,
          name: file.folderParts?.[i] ?? seg.replace(/-/g, " "),
          folder: true,
        })
      node = node.children.get(seg)
    })
    node.children.set(parts.at(-1), { slug, name: file.title, folder: false })
  }
  let saved = []
  try {
    saved = JSON.parse(store.get("fileTree") || "[]")
  } catch {}
  const isOpen = (path) =>
    saved.find((s) => s.path === path)?.collapsed === false || current.startsWith(path + "/")
  const sortNodes = (a, b) =>
    a.folder === b.folder
      ? a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
      : a.folder
        ? -1
        : 1
  function fileNode(n) {
    const li = $("#template-file").content.cloneNode(true).querySelector("li")
    const a = li.querySelector("a")
    a.textContent = n.name
    a.dataset.for = n.slug
    wireLink(a, n.slug)
    if (n.slug === current) {
      a.classList.add("active")
      a.setAttribute("aria-current", "page")
    }
    return li
  }
  function folderNode(n) {
    const li = $("#template-folder").content.cloneNode(true).querySelector("li")
    const fc = li.querySelector(".folder-container"),
      outer = li.querySelector(".folder-outer"),
      ul = outer.querySelector("ul")
    fc.dataset.folderpath = n.slug
    const svg = fc.querySelector("svg.folder-icon")
    svg.classList.remove("folder-icon")
    svg.setAttribute("aria-hidden", "true")
    const btn = document.createElement("button")
    btn.type = "button"
    btn.className = "folder-icon"
    btn.appendChild(svg)
    fc.prepend(btn)
    const a = document.createElement("a")
    a.className = "folder-title"
    a.textContent = n.name
    a.href = LIVE + n.slug + "/"
    a.target = "_blank"
    a.rel = "noopener"
    fc.querySelector(".folder-button").replaceWith(a)
    const open = isOpen(n.slug)
    outer.classList.toggle("open", open)
    btn.setAttribute("aria-expanded", String(open))
    btn.setAttribute("aria-label", (open ? "Collapse " : "Expand ") + n.name)
    for (const c of [...n.children.values()].sort(sortNodes))
      ul.appendChild(c.folder ? folderNode(c) : fileNode(c))
    return li
  }
  function renderExplorer() {
    const ul = $("ul.explorer-ul")
    $$(":scope > li:not(.overflow-end)", ul).forEach((li) => li.remove())
    const end = $("li.overflow-end", ul)
    for (const c of [...tree.children.values()].sort(sortNodes))
      ul.insertBefore(c.folder ? folderNode(c) : fileNode(c), end)
  }
  renderExplorer()
  // edge fades and drag colour for the explorer's one scroll area (Quartz's OverflowList sets gradient-active the same way)
  const exUl = $("ul.explorer-ul")
  const edges = () => {
    exUl.classList.toggle("scrolled", exUl.scrollTop > 2)
    exUl.classList.toggle(
      "gradient-active",
      exUl.scrollTop + exUl.clientHeight < exUl.scrollHeight - 2,
    )
  }
  exUl.addEventListener("scroll", edges, { passive: true })
  exUl.addEventListener("transitionend", edges)
  new ResizeObserver(edges).observe(exUl)
  new MutationObserver(() => requestAnimationFrame(edges)).observe(exUl, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  })
  exUl.addEventListener("pointerdown", (e) => {
    if (e.offsetX > exUl.clientWidth) {
      exUl.classList.add("dragging")
      addEventListener("pointerup", () => exUl.classList.remove("dragging"), { once: true })
    }
  })
  requestAnimationFrame(() => {
    const a = $(".explorer a.active"),
      box = $("ul.explorer-ul")
    if (a && box)
      box.scrollTop +=
        a.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight / 2
  })
  $(".explorer").addEventListener("click", (e) => {
    const btn = e.target.closest("button.folder-icon")
    if (!btn) return
    const fc = btn.closest(".folder-container"),
      outer = fc.nextElementSibling
    const open = outer.classList.toggle("open")
    btn.setAttribute("aria-expanded", String(open))
    btn.setAttribute(
      "aria-label",
      (open ? "Collapse " : "Expand ") + fc.querySelector(".folder-title").textContent,
    )
    const path = fc.dataset.folderpath,
      s = saved.find((x) => x.path === path)
    s ? (s.collapsed = !open) : saved.push({ path, collapsed: !open })
    store.set("fileTree", JSON.stringify(saved))
  })
  const explorer = $(".explorer")
  $("button.desktop-explorer").addEventListener("click", (e) => {
    const collapsed = explorer.classList.toggle("collapsed")
    e.currentTarget.setAttribute("aria-expanded", String(!collapsed))
  })
  const mobileBtn = $("button.mobile-explorer")
  mobileBtn.setAttribute("aria-label", "Open explorer")
  mobileBtn.classList.remove("hide-until-loaded")
  if (innerWidth <= 800) explorer.classList.add("collapsed")
  mobileBtn.addEventListener("click", () => {
    const collapsed = explorer.classList.toggle("collapsed")
    root.classList.toggle("mobile-no-scroll", !collapsed)
    $("#quartz-body").classList.toggle("lock-scroll", !collapsed)
    mobileBtn.setAttribute("aria-expanded", String(!collapsed))
    mobileBtn.setAttribute("aria-label", collapsed ? "Open explorer" : "Close explorer")
  })

  // ---------- page swap (stands in for Quartz's SPA router) ----------
  function go(slug, push = true) {
    const tpl = $("#page-" + CSS.escape(slug.replace(/\//g, "__")))
    if (!tpl) return
    const frag = tpl.content
    $(".center").replaceWith(frag.querySelector(".center").cloneNode(true))
    $(".sidebar.right").replaceWith(frag.querySelector(".sidebar.right").cloneNode(true))
    current = slug
    $("body").dataset.slug = slug
    document.title = INDEX[slug].title + " · Notes"
    $$(".explorer a.active").forEach((a) => {
      a.classList.remove("active")
      a.removeAttribute("aria-current")
    })
    const a = $(`.explorer a[data-for="${CSS.escape(slug)}"]`)
    if (a) {
      a.classList.add("active")
      a.setAttribute("aria-current", "page")
    }
    // open the folder of the new page
    const fc = $(`.folder-container[data-folderpath="${CSS.escape(slug.split("/")[0])}"]`)
    if (fc && !fc.nextElementSibling.classList.contains("open"))
      fc.querySelector("button.folder-icon").click()
    if (!explorer.classList.contains("collapsed") && innerWidth <= 800) mobileBtn.click()
    requestAnimationFrame(() => {
      const a2 = $(".explorer a.active"),
        box = $("ul.explorer-ul")
      if (a2 && box)
        box.scrollTop +=
          a2.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight / 2
    })
    lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0)
    initPage()
    $(".center h1.article-title")?.focus({ preventScroll: true })
  }

  // ---------- per-page wiring ----------
  let tocObs = null
  function initPage() {
    for (const a of $$(
      ".center a.internal[data-slug], .center a.internal[href], .sidebar.right a.internal",
    )) {
      if (a.getAttribute("role") === "anchor") continue
      const slug = a.dataset.slug || a.dataset.target
      if (!slug) continue
      if (!INDEX[slug]) {
        a.classList.add("unwritten")
        a.setAttribute("aria-describedby", "unwritten-tip")
        a.removeAttribute("href")
        a.dataset.target = slug
        a.tabIndex = 0
        continue
      }
      wireLink(a, slug)
    }
    const h1 = $(".center h1.article-title")
    if (h1) h1.tabIndex = -1
    // contents: the heading nearest the top third is in view
    tocObs?.disconnect()
    const heads = $$(".center article :is(h1,h2,h3,h4,h5,h6)[id]")
    const mark = () => {
      let cur = heads[0]
      for (const h of heads) if (h.getBoundingClientRect().top < innerHeight * 0.32) cur = h
      $$(".toc-content a").forEach((a) =>
        a.classList.toggle("in-view", cur && a.dataset.for === cur.id),
      )
    }
    tocObs = {
      disconnect() {
        removeEventListener("scroll", mark)
      },
    }
    addEventListener("scroll", mark, { passive: true })
    mark()
    $(".toc-header")?.addEventListener("click", (e) => {
      const btn = e.currentTarget,
        ul = $(".toc-content"),
        open = btn.getAttribute("aria-expanded") !== "false"
      btn.setAttribute("aria-expanded", String(!open))
      ul.hidden = open
    })
    // copy buttons on code blocks
    for (const pre of $$(".center pre")) {
      if (pre.querySelector("code.mermaid") || pre.querySelector(".clipboard-button")) continue
      const b = document.createElement("button")
      b.className = "clipboard-button"
      b.type = "button"
      b.setAttribute("aria-label", "Copy code")
      b.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>'
      b.addEventListener("click", () => {
        const text = pre.querySelector("code").innerText
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            b.setAttribute("aria-label", "Copied")
            setTimeout(() => b.setAttribute("aria-label", "Copy code"), 1500)
          })
          .catch(() => {
            const r = document.createRange()
            r.selectNodeContents(pre.querySelector("code"))
            getSelection().removeAllRanges()
            getSelection().addRange(r)
          })
      })
      pre.prepend(b)
    }
    // right rail summary for phones
    const rail = $(".sidebar.right")
    const outs = (INDEX[current]?.links || []).length,
      backs = $$(".backlinks li > a", rail).length
    const sum = document.createElement("button")
    sum.type = "button"
    sum.className = "rail-summary"
    sum.setAttribute("aria-expanded", "false")
    sum.innerHTML = `<span>Connections<br><small>${backs} backlink${backs === 1 ? "" : "s"} · ${outs} link${outs === 1 ? "" : "s"} out</small></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`
    sum.addEventListener("click", () => {
      const o = rail.classList.toggle("rail-open")
      sum.setAttribute("aria-expanded", String(o))
      if (o) buildLocal()
    })
    rail.prepend(sum)
    renderMermaid()
    buildLocal()
  }

  // ---------- popover previews ----------
  const pop = document.createElement("div")
  pop.className = "popover"
  pop.hidden = true
  pop.setAttribute("role", "tooltip")
  pop.id = "link-preview"
  pop.innerHTML = '<div class="popover-inner"></div>'
  document.body.appendChild(pop)
  const tip = document.createElement("span")
  tip.id = "unwritten-tip"
  tip.hidden = true
  tip.textContent = "Not written yet"
  document.body.appendChild(tip)
  let popT = null
  function showPop(a) {
    const slug = a.dataset.target || a.dataset.slug
    if (!slug) return
    const d = INDEX[slug],
      inner = pop.firstElementChild
    inner.innerHTML = d
      ? `<div class="popover-folder">${folderOf(slug)}</div><h1></h1><p></p>`
      : `<div class="popover-folder">Not written yet</div><h1></h1><p class="unwritten-note">This link points to a note that does not exist yet.</p>`
    inner.querySelector("h1").textContent = d ? d.title : a.textContent
    if (d) inner.querySelector("p").textContent = d.excerpt
    const r = a.getBoundingClientRect()
    pop.hidden = false
    pop.classList.add("active-popover")
    const w = inner.offsetWidth,
      x = Math.min(Math.max(12, r.left + scrollX), scrollX + innerWidth - w - 12)
    const below = r.bottom + 10 + inner.offsetHeight < innerHeight
    pop.style.left = x + "px"
    pop.style.top =
      (below ? r.bottom + scrollY + 10 : r.top + scrollY - inner.offsetHeight - 10) + "px"
  }
  const hidePop = () => {
    clearTimeout(popT)
    pop.hidden = true
    pop.classList.remove("active-popover")
  }
  document.addEventListener("pointerover", (e) => {
    const a = e.target.closest(
      ".center article a.internal:not([role=anchor]), .backlinks a.internal",
    )
    if (!a) return
    clearTimeout(popT)
    popT = setTimeout(() => showPop(a), 220)
    a.addEventListener("pointerleave", hidePop, { once: true })
  })
  document.addEventListener("focusin", (e) => {
    const a = e.target.closest?.(".center article a.internal:not([role=anchor])")
    a ? showPop(a) : hidePop()
  })
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hidePop()
  })
  addEventListener("scroll", hidePop, { passive: true })

  // ---------- graph: notes drawn as haloed stars ----------
  const css = (v) => getComputedStyle(root).getPropertyValue(v).trim()
  function simulate(nodes, edges, w, h, iters, opts = {}) {
    const k = opts.k ?? 70
    nodes.forEach((n, i) => {
      n.x ??= w / 2 + Math.cos(i * 2.4) * (40 + i * 6)
      n.y ??= h / 2 + Math.sin(i * 2.4) * (40 + i * 6)
      n.vx = 0
      n.vy = 0
    })
    const idx = new Map(nodes.map((n, i) => [n.id, i]))
    const E = edges
      .map(([a, b]) => [idx.get(a), idx.get(b)])
      .filter(([a, b]) => a != null && b != null)
    for (let it = 0; it < iters; it++) {
      const t = 1 - it / iters
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j]
          let dx = a.x - b.x,
            dy = a.y - b.y
          const d2 = dx * dx + dy * dy + 0.01,
            f = (k * k) / d2
          a.vx += dx * f * 0.02
          a.vy += dy * f * 0.02
          b.vx -= dx * f * 0.02
          b.vy -= dy * f * 0.02
        }
      for (const [i, j] of E) {
        const a = nodes[i],
          b = nodes[j]
        const dx = b.x - a.x,
          dy = b.y - a.y,
          d = Math.hypot(dx, dy) || 1,
          f = (d - k) * 0.04
        a.vx += (dx / d) * f
        a.vy += (dy / d) * f
        b.vx -= (dx / d) * f
        b.vy -= (dy / d) * f
      }
      for (const n of nodes) {
        n.vx += (w / 2 - n.x) * 0.01
        n.vy += (h / 2 - n.y) * 0.01
        const sp = Math.hypot(n.vx, n.vy),
          cap = 18
        if (sp > cap) {
          n.vx *= cap / sp
          n.vy *= cap / sp
        }
        if (!n.fixed) {
          n.x += n.vx * t
          n.y += n.vy * t
        }
        n.vx *= 0.5
        n.vy *= 0.5
      }
    }
    return E
  }
  // scale and centre a laid-out graph into its box
  function fit(g, w, h, pad = 34) {
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
  function drawGraph(canvas, g, hover, opt = {}) {
    const dpr = Math.min(devicePixelRatio || 1, 2),
      w = canvas.clientWidth,
      h = canvas.clientHeight
    if (!w || !h) return
    if (canvas.width !== w * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
    }
    const c = canvas.getContext("2d")
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, w, h)
    const s = g.view?.s ?? 1,
      ox = g.view?.x ?? 0,
      oy = g.view?.y ?? 0
    const P = (n) => [n.x * s + ox, n.y * s + oy]
    const near = new Set()
    if (hover) {
      near.add(hover.id)
      g.E.forEach(([i, j]) => {
        if (g.nodes[i] === hover) near.add(g.nodes[j].id)
        if (g.nodes[j] === hover) near.add(g.nodes[i].id)
      })
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
      const r = (cur ? 6.5 : 3.2 + Math.min(4, (n.deg || 0) * 0.7)) * (opt.big ? 1 : 1)
      c.globalAlpha = dim ? 0.3 : 1
      if (cur || n === hover) {
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
        (opt.big ? !hover && (n.deg || 0) >= 4 : opt.labels === "near" && !hover)
      if (showLabel) {
        c.font = `${cur ? 600 : 400} ${opt.big ? 12 : 11.5}px "Source Serif 4", Georgia, serif`
        c.fillStyle = n.unwritten ? muted : text
        if (opt.radial && !cur) {
          // labels point away from the centre so neighbours never collide
          const side = x >= canvas.clientWidth / 2
          c.textAlign = side ? "left" : "right"
          c.textBaseline = "middle"
          const tx = x + (side ? r + 5 : -r - 5),
            room = side ? canvas.clientWidth - tx - 6 : tx - 6
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
    }
    c.globalAlpha = 1
  }
  function pick(g, canvas, ev) {
    const r = canvas.getBoundingClientRect(),
      s = g.view?.s ?? 1,
      ox = g.view?.x ?? 0,
      oy = g.view?.y ?? 0
    const x = ev.clientX - r.left,
      y = ev.clientY - r.top
    let best = null,
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
  function openNode(n) {
    if (!n || n.unwritten) return
    if (isShowcase(n.id)) {
      closeGlobal()
      go(n.id)
    } else window.open(LIVE + n.id, "_blank", "noopener")
  }
  let local = null
  function buildLocal() {
    const canvas = document.createElement("canvas")
    canvas.setAttribute("role", "img")
    const cont = $(".graph-container")
    cont.innerHTML = ""
    cont.appendChild(canvas)
    const ids = new Set([current]),
      E = []
    for (const l of INDEX[current]?.links || []) {
      ids.add(l)
      E.push([current, l])
    }
    for (const [slug, d] of Object.entries(INDEX))
      if ((d.links || []).includes(current)) {
        ids.add(slug)
        E.push([slug, current])
      }
    const nodes = [...ids].map((id) => ({
      id,
      label: INDEX[id]?.title ?? id.split("/").pop().replace(/-/g, " "),
      unwritten: !INDEX[id],
    }))
    nodes.forEach((n) => (n.deg = E.filter((e) => e.includes(n.id)).length))
    canvas.setAttribute(
      "aria-label",
      `Graph of ${INDEX[current].title} and the ${nodes.length - 1} notes it connects to`,
    )
    // radial layout: this note in the middle, links out on the right, backlinks on the left
    const w = cont.clientWidth || 260,
      h = cont.clientHeight || 240
    const me = nodes.find((n) => n.id === current)
    me.x = w / 2
    me.y = h / 2
    const outs = new Set(INDEX[current]?.links || [])
    const right = nodes.filter((n) => n !== me && outs.has(n.id)),
      left = nodes.filter((n) => n !== me && !outs.has(n.id))
    const R = Math.min(w * 0.24, h * 0.36)
    const place = (arr, a0, a1) =>
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
      for (const l of INDEX[a.id]?.links || [])
        if (l !== current && a.id !== current && ids.has(l)) E.push([a.id, l])
    const idx = new Map(nodes.map((n, i) => [n.id, i]))
    local = { canvas, nodes, E: E.map(([a, b]) => [idx.get(a), idx.get(b)]) }
    let hov = null
    canvas.addEventListener("pointermove", (e) => {
      const n = pick(local, canvas, e)
      if (n !== hov) {
        hov = n
        canvas.style.cursor = n && !n.unwritten ? "pointer" : "default"
        drawGraph(canvas, local, hov, { labels: "near", radial: true })
      }
    })
    canvas.addEventListener("pointerleave", () => {
      hov = null
      drawLocal()
    })
    canvas.addEventListener("click", (e) => openNode(pick(local, canvas, e)))
    drawLocal()
    const legend = document.createElement("div")
    legend.className = "graph-legend"
    legend.innerHTML = `<span><i style="background:var(--star)"></i>This note</span><span><i style="background:var(--node)"></i>Linked</span><span><i style="border:1px dashed var(--gray)"></i>Not written</span>`
    $(".graph .graph-legend")?.remove()
    $(".graph").appendChild(legend)
  }
  const drawLocal = () =>
    local && drawGraph(local.canvas, local, null, { labels: "near", radial: true })
  document.addEventListener("themechange", () => {
    drawLocal()
    global && drawGlobal()
  })
  let rz = null
  addEventListener("resize", () => {
    clearTimeout(rz)
    rz = setTimeout(() => $(".graph-container")?.clientWidth && buildLocal(), 150)
  })

  let global = null,
    gHover = null
  function buildGlobal() {
    const cont = $(".global-graph-container")
    cont.innerHTML =
      '<button type="button" class="global-graph-close">Close</button><p class="global-graph-caption"></p>'
    const canvas = document.createElement("canvas")
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.setAttribute("role", "img")
    cont.appendChild(canvas)
    const ids = new Set(Object.keys(INDEX).filter((s) => s !== "index" && !s.startsWith("tags/"))),
      E = []
    for (const s of [...ids])
      for (const l of INDEX[s].links || [])
        if (l !== s) {
          if (!INDEX[l]) ids.add(l)
          E.push([s, l])
        }
    const nodes = [...ids].map((id) => ({
      id,
      label: INDEX[id]?.title ?? id.split("/").pop().replace(/-/g, " "),
      unwritten: !INDEX[id],
    }))
    const deg = new Map()
    E.forEach(([a, b]) => {
      deg.set(a, (deg.get(a) || 0) + 1)
      deg.set(b, (deg.get(b) || 0) + 1)
    })
    nodes.forEach((n) => (n.deg = deg.get(n.id) || 0))
    // seed each folder in its own region so clusters read as constellations
    const folders = [...new Set(nodes.map((n) => n.id.split("/")[0]))]
    const W = cont.clientWidth,
      H = cont.clientHeight
    nodes.forEach((n, i) => {
      const f = folders.indexOf(n.id.split("/")[0]),
        a = (f / folders.length) * Math.PI * 2
      n.x = W / 2 + Math.cos(a) * W * 0.28 + Math.cos(i) * 30
      n.y = H / 2 + Math.sin(a) * H * 0.3 + Math.sin(i) * 30
    })
    const e2 = simulate(nodes, E, W, H, 220, { k: 46 })
    global = { canvas, nodes, E: e2, view: { s: 1, x: 0, y: 0 } }
    fit(global, W, H, 60)
    cont.querySelector(".global-graph-caption").textContent =
      `${nodes.filter((n) => !n.unwritten).length} notes · ${E.length} links · drag to pan, scroll to zoom`
    canvas.setAttribute("aria-label", `Graph of all ${nodes.length} notes`)
    let drag = null
    canvas.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, y: e.clientY, vx: global.view.x, vy: global.view.y, moved: false }
      canvas.setPointerCapture(e.pointerId)
    })
    canvas.addEventListener("pointermove", (e) => {
      if (drag) {
        const dx = e.clientX - drag.x,
          dy = e.clientY - drag.y
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true
        global.view.x = drag.vx + dx
        global.view.y = drag.vy + dy
        drawGlobal()
        return
      }
      const n = pick(global, canvas, e)
      if (n !== gHover) {
        gHover = n
        canvas.style.cursor = n && !n.unwritten ? "pointer" : "grab"
        drawGlobal()
      }
    })
    canvas.addEventListener("pointerup", (e) => {
      if (drag && !drag.moved) openNode(pick(global, canvas, e))
      drag = null
    })
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault()
        const r = canvas.getBoundingClientRect(),
          mx = e.clientX - r.left,
          my = e.clientY - r.top,
          v = global.view,
          ns = Math.min(4, Math.max(0.5, v.s * (e.deltaY < 0 ? 1.1 : 0.9)))
        v.x = mx - ((mx - v.x) * ns) / v.s
        v.y = my - ((my - v.y) * ns) / v.s
        v.s = ns
        drawGlobal()
      },
      { passive: false },
    )
    cont.querySelector(".global-graph-close").addEventListener("click", closeGlobal)
  }
  const drawGlobal = () => drawGraph(global.canvas, global, gHover, { big: true, labels: "near" })
  let lastFocus = null
  function openGlobal() {
    lastFocus = document.activeElement
    // portal to <body> so no sidebar stacking context can sit above it
    const outer = $(".global-graph-outer")
    if (outer.parentElement !== document.body) document.body.appendChild(outer)
    $(".global-graph-outer").classList.add("active")
    lenis?.stop()
    buildGlobal()
    drawGlobal()
    $(".global-graph-close").focus()
  }
  function closeGlobal() {
    const o = $(".global-graph-outer")
    if (!o?.classList.contains("active")) return
    o.classList.remove("active")
    lenis?.start()
    lastFocus?.focus?.()
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest(".global-graph-icon")) openGlobal()
  })
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeGlobal()
  })

  // ---------- search ----------
  const sc = $(".search-container"),
    input = $("input.search-bar"),
    layout = $(".search-layout")
  layout.innerHTML =
    '<div class="results-container" role="listbox" aria-label="Results"></div><div class="preview-container" aria-live="polite"></div>'
  const hint = document.createElement("div")
  hint.className = "search-hint"
  hint.innerHTML = "<span>↑ ↓ to move</span><span>Enter to open</span><span>Esc to close</span>"
  $(".search-space").appendChild(hint)
  const esc = (s) =>
    s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m])
  const markUp = (text, terms) => {
    let h = esc(text)
    for (const t of terms)
      h = h.replace(
        new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"),
        "<mark>$1</mark>",
      )
    return h
  }
  let results = [],
    sel = 0,
    searchReturn = null
  function snippet(text, terms, len = 150) {
    const low = text.toLowerCase()
    let at = -1
    for (const t of terms) {
      const i = low.indexOf(t)
      if (i >= 0 && (at < 0 || i < at)) at = i
    }
    const s = Math.max(0, at - 40)
    return (s > 0 ? "…" : "") + text.slice(s, s + len) + (s + len < text.length ? "…" : "")
  }
  function runSearch() {
    const q = input.value.trim().toLowerCase(),
      terms = q.split(/\s+/).filter(Boolean),
      box = $(".results-container"),
      prev = $(".preview-container")
    if (!terms.length) {
      box.innerHTML = '<p class="search-empty">Type to search 113 notes by title and text.</p>'
      prev.innerHTML = ""
      results = []
      layout.classList.remove("display-results")
      return
    }
    results = Object.entries(INDEX)
      .filter(([s]) => s !== "index")
      .map(([slug, d]) => {
        const t = d.title.toLowerCase(),
          body = d.content.toLowerCase()
        if (!terms.every((x) => t.includes(x) || body.includes(x))) return null
        return {
          slug,
          d,
          score: terms.reduce(
            (a, x) => a + (t.includes(x) ? 10 : 0) + (t.startsWith(x) ? 5 : 0),
            0,
          ),
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
    layout.classList.add("display-results")
    sel = 0
    if (!results.length) {
      box.innerHTML = `<p class="search-empty">No notes match “${esc(input.value.trim())}”. Try a shorter word.</p>`
      prev.innerHTML = ""
      return
    }
    box.innerHTML = results
      .map(
        (r, i) =>
          `<a class="result-card${i === 0 ? " focus" : ""}" role="option" id="res-${i}" data-target="${esc(r.slug)}" href="${LIVE + esc(r.slug)}"${isShowcase(r.slug) ? "" : ' target="_blank" rel="noopener"'}><span class="result-folder">${esc(folderOf(r.slug))}</span><h3>${markUp(r.d.title, terms)}</h3><p>${markUp(snippet(r.d.content, terms), terms)}</p></a>`,
      )
      .join("")
    preview(terms)
  }
  function preview(terms) {
    const r = results[sel]
    if (!r) return
    $$(".result-card").forEach((c, i) => c.classList.toggle("focus", i === sel))
    input.setAttribute("aria-activedescendant", "res-" + sel)
    $(".preview-container").innerHTML =
      `<span class="result-folder" style="font:0.7rem var(--codeFont);color:var(--gray)">${esc(folderOf(r.slug))}</span><h1>${esc(r.d.title)}</h1><p>${markUp(snippet(r.d.content, terms, 700), terms)}</p>`
  }
  function openSearch() {
    searchReturn = document.activeElement
    sc.classList.add("active")
    lenis?.stop()
    input.value = ""
    runSearch()
    input.focus()
  }
  function closeSearch() {
    if (!sc.classList.contains("active")) return
    sc.classList.remove("active")
    lenis?.start()
    searchReturn?.focus?.()
  }
  input.setAttribute("role", "combobox")
  input.setAttribute("aria-expanded", "true")
  input.setAttribute("aria-autocomplete", "list")
  $("button.search-button").addEventListener("click", openSearch)
  input.addEventListener("input", runSearch)
  input.addEventListener("keydown", (e) => {
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      sel = Math.min(results.length - 1, sel + 1)
      preview(terms)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      sel = Math.max(0, sel - 1)
      preview(terms)
    } else if (e.key === "Enter" && results[sel]) {
      e.preventDefault()
      const s = results[sel].slug
      closeSearch()
      isShowcase(s) ? go(s) : window.open(LIVE + s, "_blank", "noopener")
    }
  })
  sc.addEventListener("click", (e) => {
    if (e.target === sc) closeSearch()
    if (e.target.closest(".result-card")) closeSearch()
  })
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault()
      sc.classList.contains("active") ? closeSearch() : openSearch()
    } else if (e.key === "Escape") closeSearch()
  })

  // ---------- mermaid (Quartz renders these client-side too) ----------
  async function renderMermaid() {
    const codes = $$(".center code.mermaid")
    if (!codes.length) return
    if (!window.mermaid)
      await new Promise((res, rej) => {
        const sc = document.createElement("script")
        sc.src = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"
        sc.onload = res
        sc.onerror = rej
        document.head.appendChild(sc)
      }).catch(() => null)
    if (!window.mermaid) return
    for (const code of codes) {
      code.dataset.src ??= code.textContent
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        fontFamily: css("--bodyFont"),
        themeVariables: {
          primaryColor: css("--surface-2"),
          primaryTextColor: css("--dark"),
          primaryBorderColor: css("--tertiary"),
          lineColor: css("--gray"),
          edgeLabelBackground: css("--light"),
          tertiaryColor: css("--light"),
          fontSize: "15px",
        },
      })
      const { svg } = await mermaid.render(
        "m" + Math.random().toString(36).slice(2),
        code.dataset.src,
      )
      code.innerHTML = svg
      code.style.background = "none"
    }
  }
  document.addEventListener("themechange", () => renderMermaid())

  // ---------- smooth scroll ----------
  let lenis = null
  if (!RM && window.Lenis)
    lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: -24 },
      lerp: 0.12,
      prevent: (n) =>
        !!n.closest?.(
          ".explorer-content, .search-container, .global-graph-outer, .toc-content, .backlinks, .popover",
        ),
    })

  initPage()
})()
