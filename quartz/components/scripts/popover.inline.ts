import type { ContentDetails } from "../../plugins/emitters/contentIndex"

// Starry Notes link previews: one shared card with the note's folder, title and opening lines,
// shown on hover (after 220ms) and on keyboard focus. Links to notes that do not exist yet say so.

const EXCERPT = 260
const LINKS = ".center article a.internal:not([role=anchor]), .backlinks a.internal"

document.addEventListener("nav", async () => {
  const index = (await fetchData) as Record<string, ContentDetails>
  let pop = document.getElementById("link-preview")
  if (!pop) {
    pop = document.createElement("div")
    pop.className = "popover"
    pop.id = "link-preview"
    pop.setAttribute("role", "tooltip")
    pop.hidden = true
    pop.innerHTML = '<div class="popover-inner"></div>'
    document.body.appendChild(pop)
  }
  const card = pop
  const inner = card.firstElementChild as HTMLElement
  let timer = 0

  const show = (a: HTMLElement) => {
    if (a.dataset.noPopover === "true") return
    const slug = a.dataset.slug ?? ""
    const d = index[slug]
    const unwritten = a.classList.contains("unwritten")
    if (!d && !unwritten) return // a folder or tag page: nothing to preview
    const folder = (d?.filePath ?? "").split("/").slice(0, -1).join(" / ")
    inner.innerHTML = d
      ? '<div class="popover-folder"></div><h1></h1><p></p>'
      : '<div class="popover-folder">Not written yet</div><h1></h1><p class="unwritten-note">This link points to a note that does not exist yet.</p>'
    if (d) {
      const body = (d.content ?? "").replace(/\s+/g, " ").trim()
      inner.querySelector(".popover-folder")!.textContent = folder
      inner.querySelector("p")!.textContent =
        body.slice(0, EXCERPT) + (body.length > EXCERPT ? "…" : "")
    }
    inner.querySelector("h1")!.textContent = d ? d.title : (a.textContent ?? "")
    const r = a.getBoundingClientRect()
    card.hidden = false
    card.classList.add("active-popover")
    // keep 12px from the viewport edges; open below the link, or above it when there is no room
    const w = inner.offsetWidth,
      x = Math.min(Math.max(12, r.left + scrollX), scrollX + innerWidth - w - 12)
    const below = r.bottom + 10 + inner.offsetHeight < innerHeight
    card.style.left = x + "px"
    card.style.top =
      (below ? r.bottom + scrollY + 10 : r.top + scrollY - inner.offsetHeight - 10) + "px"
  }
  const hide = () => {
    clearTimeout(timer)
    card.hidden = true
    card.classList.remove("active-popover")
  }

  const onOver = (e: PointerEvent) => {
    const a = (e.target as Element).closest?.(LINKS) as HTMLElement | null
    if (!a) return
    clearTimeout(timer)
    timer = window.setTimeout(() => show(a), 220)
    a.addEventListener("pointerleave", hide, { once: true })
  }
  const onFocus = (e: FocusEvent) => {
    const a = (e.target as Element).closest?.(LINKS) as HTMLElement | null
    a ? show(a) : hide()
  }
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide()

  document.addEventListener("pointerover", onOver)
  document.addEventListener("focusin", onFocus)
  document.addEventListener("keydown", onKey)
  addEventListener("scroll", hide, { passive: true })
  window.addCleanup(() => {
    hide()
    document.removeEventListener("pointerover", onOver)
    document.removeEventListener("focusin", onFocus)
    document.removeEventListener("keydown", onKey)
    removeEventListener("scroll", hide)
  })
})
