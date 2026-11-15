// The site-wide motion setting (WCAG 2.2.2), stamped before the page paints: the visitor's own
// choice from the footer switch, else the system's reduced-motion setting. Every animation, canvas
// loop, the ink cursor and smooth scrolling key off html[data-motion="reduce"].
let saved: string | null = null
try {
  saved = localStorage.getItem("motion")
} catch {
  // storage blocked (private window, sandboxed frame): fall back to the system setting
}
const reduce = saved ? saved === "reduce" : matchMedia("(prefers-reduced-motion: reduce)").matches
document.documentElement.dataset.motion = reduce ? "reduce" : "on"
