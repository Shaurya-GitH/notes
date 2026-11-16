// The site-wide motion setting, stamped before the page paints: the system's reduced-motion
// setting. Every animation, canvas loop, the ink cursor and smooth scrolling key off
// html[data-motion="reduce"]; a change of the system setting applies at once (motionchange).
const query = matchMedia("(prefers-reduced-motion: reduce)")
const stamp = () => (document.documentElement.dataset.motion = query.matches ? "reduce" : "on")
stamp()
query.addEventListener("change", () => {
  stamp()
  document.dispatchEvent(new CustomEvent("motionchange", { detail: { reduce: query.matches } }))
})
// the footer switch is gone: forget a choice an earlier visit saved
try {
  localStorage.removeItem("motion")
} catch {
  // storage blocked: nothing was saved
}
