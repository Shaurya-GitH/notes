import Lenis from "lenis"

// Lenis smooth scrolling. Note pages use the note-page design's settings; the scroll story (Journey)
// and the home page use their own. Panels that scroll themselves keep native scrolling. Off while the
// motion setting is "reduce" (html[data-motion], from the footer switch or the system setting).

const NOTE = {
  lerp: 0.12,
  anchors: { offset: -24 },
  prevent:
    ".explorer-content, .search-container, .global-graph-outer, .toc-content, .backlinks, .popover",
}
const HOME = { lerp: 0.09, anchors: true, prevent: ".sidebar" }
const STORY = ["index", "journey"]

let lenis: Lenis | null = null
let kind = ""

function setup() {
  const reduce = document.documentElement.dataset.motion === "reduce"
  const want = reduce ? "" : STORY.includes(document.body.dataset.slug ?? "") ? "home" : "note"
  if (want === kind) return false
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
  return true
}

document.addEventListener("nav", () => {
  setup()
  // a new page starts at the top, unless the link pointed at a heading
  if (lenis && !location.hash) lenis.scrollTo(0, { immediate: true })
})
document.addEventListener("motionchange", () => setup())
