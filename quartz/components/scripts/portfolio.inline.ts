// The contact band's copy-email button, the skip link and
// the phone menu's Escape.

document.addEventListener("nav", () => {
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

  // the skip link moves focus too, so the next Tab continues from the target (smooth scrolling
  // takes over the jump itself)
  const skip = document.querySelector<HTMLAnchorElement>(".pf-skip")
  const skipTo = () =>
    skip?.hash && document.querySelector<HTMLElement>(skip.hash)?.focus({ preventScroll: true })
  skip?.addEventListener("click", skipTo)

  // the phone menu is a <details>: Escape closes it and returns focus to its button
  const menu = document.querySelector<HTMLDetailsElement>(".pf-nav details.menu")
  const escape = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !menu?.open) return
    menu.open = false
    menu.querySelector("summary")?.focus()
  }
  document.addEventListener("keydown", escape)

  window.addCleanup(() => {
    document.removeEventListener("keydown", escape)
    copy?.removeEventListener("click", copyEmail)
    skip?.removeEventListener("click", skipTo)
  })
})
