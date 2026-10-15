// exactly one contents entry is "in view": the last heading above the top third of the
// viewport (or the first heading, before any has been passed)
function markInView() {
  const headers = document.querySelectorAll(
    ".center article :is(h1, h2, h3, h4, h5, h6)[id]",
  ) as NodeListOf<HTMLElement>
  let current = headers[0]
  for (const h of headers) if (h.getBoundingClientRect().top < innerHeight * 0.32) current = h
  for (const a of document.querySelectorAll(".toc-content a[data-for]") as NodeListOf<HTMLElement>)
    a.classList.toggle("in-view", !!current && a.dataset.for === current.id)
}

function toggleToc(this: HTMLElement) {
  this.classList.toggle("collapsed")
  this.setAttribute(
    "aria-expanded",
    this.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
  const content = this.nextElementSibling as HTMLElement | undefined
  if (!content) return
  content.classList.toggle("collapsed")
}

function setupToc() {
  for (const toc of document.getElementsByClassName("toc")) {
    const button = toc.querySelector(".toc-header")
    const content = toc.querySelector(".toc-content")
    if (!button || !content) return
    button.addEventListener("click", toggleToc)
    window.addCleanup(() => button.removeEventListener("click", toggleToc))
  }
}

document.addEventListener("nav", () => {
  setupToc()

  // update toc entry highlighting
  let frame = 0
  const onScroll = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(markInView)
  }
  addEventListener("scroll", onScroll, { passive: true })
  window.addCleanup(() => removeEventListener("scroll", onScroll))
  markInView()
})
