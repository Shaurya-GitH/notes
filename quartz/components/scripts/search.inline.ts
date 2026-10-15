import type { ContentDetails } from "../../plugins/emitters/contentIndex"
import { FullSlug, getFullSlug, resolveRelative } from "../../util/path"
import { Hit, rank, snippet } from "./searchRank"

// Starry Notes search: one sheet with results on the left and a preview on the right. Every word
// must appear in the title or text; title hits rank first. "#tag" words match tags instead.

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]!)
const markUp = (text: string, terms: string[]) => {
  let h = esc(text)
  for (const t of terms.filter((t) => !t.startsWith("#")))
    h = h.replace(
      new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"),
      "<mark>$1</mark>",
    )
  return h
}
const folderOf = (d: ContentDetails) => (d.filePath ?? "").split("/").slice(0, -1).join(" / ")

document.addEventListener("nav", async () => {
  const container = document.querySelector(".search-container") as HTMLElement | null
  const input = document.querySelector("input.search-bar") as HTMLInputElement | null
  const layout = document.querySelector(".search-layout") as HTMLElement | null
  const space = document.querySelector(".search-space") as HTMLElement | null
  if (!container || !input || !layout || !space) return
  // collapse whitespace once, so snippets are cut from the same text the design used
  const raw = (await fetchData) as Record<string, ContentDetails>
  const index = Object.fromEntries(
    Object.entries(raw).map(([k, d]) => [
      k,
      { ...d, content: (d.content ?? "").replace(/\s+/g, " ").trim() },
    ]),
  ) as Record<string, ContentDetails>
  const current = getFullSlug(window)

  layout.innerHTML =
    '<div class="results-container" role="listbox" aria-label="Results"></div><div class="preview-container" aria-live="polite"></div>'
  space.querySelector(".search-hint")?.remove()
  const hint = document.createElement("div")
  hint.className = "search-hint"
  hint.innerHTML = "<span>↑ ↓ to move</span><span>Enter to open</span><span>Esc to close</span>"
  space.appendChild(hint)
  input.setAttribute("role", "combobox")
  input.setAttribute("aria-expanded", "true")
  input.setAttribute("aria-autocomplete", "list")

  const box = layout.querySelector(".results-container") as HTMLElement
  const prev = layout.querySelector(".preview-container") as HTMLElement
  let results: Hit[] = [],
    sel = 0,
    returnTo: Element | null = null
  const termsOf = () => input.value.trim().toLowerCase().split(/\s+/).filter(Boolean)

  function preview(terms: string[]) {
    const r = results[sel]
    if (!r) return
    box.querySelectorAll(".result-card").forEach((c, i) => c.classList.toggle("focus", i === sel))
    input!.setAttribute("aria-activedescendant", "res-" + sel)
    prev.innerHTML = `<span class="result-folder" style="font:0.7rem var(--codeFont);color:var(--gray)">${esc(folderOf(r.d))}</span><h1>${esc(r.d.title)}</h1><p>${markUp(snippet(r.d.content ?? "", terms, 700), terms)}</p>`
  }
  function run() {
    const terms = termsOf()
    if (!terms.length) {
      box.innerHTML = `<p class="search-empty">Type to search ${Object.keys(index).length} notes by title and text.</p>`
      prev.innerHTML = ""
      results = []
      layout!.classList.remove("display-results")
      return
    }
    results = rank(index, terms)
    layout!.classList.add("display-results")
    sel = 0
    if (!results.length) {
      box.innerHTML = `<p class="search-empty">No notes match “${esc(input!.value.trim())}”. Try a shorter word.</p>`
      prev.innerHTML = ""
      return
    }
    box.innerHTML = results
      .map(
        (r, i) =>
          `<a class="result-card${i === 0 ? " focus" : ""}" role="option" id="res-${i}" data-slug="${esc(r.slug)}" href="${esc(resolveRelative(current, r.slug as FullSlug))}"><span class="result-folder">${esc(folderOf(r.d))}</span><h3>${markUp(r.d.title, terms)}</h3><p>${markUp(snippet(r.d.content ?? "", terms), terms)}</p></a>`,
      )
      .join("")
    preview(terms)
  }
  function open(prefill = "") {
    returnTo = document.activeElement
    container!.classList.add("active")
    window.lenis?.stop()
    input!.value = prefill
    run()
    input!.focus()
  }
  function close() {
    if (!container!.classList.contains("active")) return
    container!.classList.remove("active")
    window.lenis?.start()
    ;(returnTo as HTMLElement | null)?.focus?.()
  }

  const onInputKey = (e: KeyboardEvent) => {
    const terms = termsOf()
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
      const slug = results[sel].slug as FullSlug
      close()
      window.spaNavigate(new URL(resolveRelative(current, slug), location.toString()))
    }
  }
  const onSheetClick = (e: MouseEvent) => {
    const t = e.target as Element
    if (t === container || t.closest(".result-card")) close()
  }
  const onDocKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault()
      if (container!.classList.contains("active")) close()
      else open(e.shiftKey ? "#" : "")
    } else if (e.key === "Escape") close()
  }
  const onButton = () => open()
  const button = document.querySelector("button.search-button")

  button?.addEventListener("click", onButton)
  input.addEventListener("input", run)
  input.addEventListener("keydown", onInputKey)
  container.addEventListener("click", onSheetClick)
  document.addEventListener("keydown", onDocKey)
  window.addCleanup(() => {
    close()
    button?.removeEventListener("click", onButton)
    input.removeEventListener("input", run)
    input.removeEventListener("keydown", onInputKey)
    container.removeEventListener("click", onSheetClick)
    document.removeEventListener("keydown", onDocKey)
  })
})
