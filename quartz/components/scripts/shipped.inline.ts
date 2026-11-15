// Shipped's filter chips: <button aria-pressed>, with the choice kept in the URL (?filter=at-work)
// so a filtered view can be shared and survives a reload.

document.addEventListener("nav", () => {
  const chips = [...document.querySelectorAll<HTMLButtonElement>(".pf-shipped .chips button")]
  if (!chips.length) return
  const cards = [...document.querySelectorAll<HTMLElement>(".pf-shipped .projects > li")]
  const apply = (f: string) => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === f)))
    cards.forEach((c) => (c.hidden = f !== "all" && c.dataset.kind !== f))
  }
  const asked = new URL(location.href).searchParams.get("filter")
  apply(chips.some((c) => c.dataset.filter === asked) ? asked! : "all")

  const pick = (e: Event) => {
    const f = (e.currentTarget as HTMLButtonElement).dataset.filter ?? "all"
    const url = new URL(location.href)
    if (f === "all") url.searchParams.delete("filter")
    else url.searchParams.set("filter", f)
    history.replaceState(history.state, "", url)
    apply(f)
  }
  chips.forEach((c) => c.addEventListener("click", pick))
  window.addCleanup(() => chips.forEach((c) => c.removeEventListener("click", pick)))
})
