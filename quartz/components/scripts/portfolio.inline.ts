// The portfolio footer's motion switch and the contact band's copy-email button.

document.addEventListener("nav", () => {
  const html = document.documentElement
  const toggle = document.querySelector<HTMLButtonElement>(".pf-foot .toggle")
  const sync = () => toggle?.setAttribute("aria-checked", String(html.dataset.motion !== "reduce"))
  sync()
  const flip = () => {
    const reduce = html.dataset.motion !== "reduce"
    html.dataset.motion = reduce ? "reduce" : "on"
    try {
      localStorage.setItem("motion", reduce ? "reduce" : "on")
    } catch {
      // not saved; the switch still holds for this page view
    }
    sync()
    document.dispatchEvent(new CustomEvent("motionchange", { detail: { reduce } }))
  }
  toggle?.addEventListener("click", flip)

  const copy = document.querySelector<HTMLButtonElement>(".pf-contact .cp")
  const copyEmail = async () => {
    if (!copy) return
    try {
      await navigator.clipboard.writeText(copy.dataset.copy ?? "")
      copy.textContent = "Copied"
      setTimeout(() => (copy.textContent = "Copy email"), 2000)
    } catch {
      // clipboard refused: the address stays visible beside the button to copy by hand
    }
  }
  copy?.addEventListener("click", copyEmail)

  window.addCleanup(() => {
    toggle?.removeEventListener("click", flip)
    copy?.removeEventListener("click", copyEmail)
  })
})
