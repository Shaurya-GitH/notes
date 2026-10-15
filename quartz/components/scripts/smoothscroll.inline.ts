import Lenis from "lenis"

// Lenis smooth scrolling. Note pages use the note-page design's settings; the home page (scroll
// story) uses its own. Panels that scroll themselves keep native scrolling. Off under reduced motion.

const NOTE = {
  lerp: 0.12,
  anchors: { offset: -24 },
  prevent:
    ".explorer-content, .search-container, .global-graph-outer, .toc-content, .backlinks, .popover",
}
const HOME = { lerp: 0.09, anchors: true, prevent: ".sidebar" }

let lenis: Lenis | null = null
let kind = ""

document.addEventListener("nav", () => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  const want = reduce ? "" : document.body.dataset.slug === "index" ? "home" : "note"
  if (want !== kind) {
    lenis?.destroy()
    lenis = null
    kind = want
    if (want) {
      const cfg = want === "home" ? HOME : NOTE
      lenis = new Lenis({
        autoRaf: true,
        lerp: cfg.lerp,
        anchors: cfg.anchors,
        prevent: (node: HTMLElement) => !!node.closest?.(cfg.prevent),
      })
    }
    window.lenis = lenis ?? undefined
  }
  // a new page starts at the top, unless the link pointed at a heading
  if (lenis && !location.hash) lenis.scrollTo(0, { immediate: true })
})
