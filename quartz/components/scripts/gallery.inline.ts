// A project page's gallery lightbox: a native <dialog> opened with showModal(), so the page behind
// it is inert (focus stays inside) and Escape closes it. Arrow keys and the buttons step through the
// pictures; closing returns focus to the picture that opened it. Also: turning motion off pauses
// any playing demo video (nothing ever autoplays).

document.addEventListener("nav", () => {
  const videos = [...document.querySelectorAll<HTMLVideoElement>(".pf-case video")]
  const still = (e: Event) => {
    if ((e as CustomEvent<{ reduce: boolean }>).detail.reduce) videos.forEach((v) => v.pause())
  }
  document.addEventListener("motionchange", still)
  window.addCleanup(() => document.removeEventListener("motionchange", still))

  const dialog = document.querySelector<HTMLDialogElement>(".pf-case dialog.lightbox")
  const shots = [...document.querySelectorAll<HTMLButtonElement>(".pf-case .gallery .shot")]
  if (!dialog || !shots.length) return
  const img = dialog.querySelector("img")!
  const caption = dialog.querySelector("figcaption")!
  const count = dialog.querySelector(".count")!
  dialog.classList.toggle("single", shots.length < 2)
  let at = 0
  let opener: HTMLElement | null = null

  const show = (n: number) => {
    at = (n + shots.length) % shots.length
    const thumb = shots[at].querySelector("img")!
    img.src = thumb.src
    img.alt = thumb.alt
    caption.textContent = shots[at].parentElement?.querySelector("figcaption")?.textContent ?? ""
    count.textContent = shots.length > 1 ? `${at + 1} of ${shots.length}` : ""
  }
  const open = (e: Event) => {
    opener = e.currentTarget as HTMLElement
    show(Number(opener.dataset.i))
    dialog.showModal()
  }
  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") show(at + 1)
    else if (e.key === "ArrowLeft") show(at - 1)
    else return
    e.preventDefault()
  }
  const click = (e: MouseEvent) => {
    const t = e.target as HTMLElement
    if (t === dialog || t.closest(".close")) dialog.close()
    else if (t.closest(".prev")) show(at - 1)
    else if (t.closest(".next")) show(at + 1)
  }
  const restore = () => opener?.focus()

  shots.forEach((s) => s.addEventListener("click", open))
  dialog.addEventListener("keydown", key)
  dialog.addEventListener("click", click)
  dialog.addEventListener("close", restore)
  window.addCleanup(() => {
    shots.forEach((s) => s.removeEventListener("click", open))
    dialog.removeEventListener("keydown", key)
    dialog.removeEventListener("click", click)
    dialog.removeEventListener("close", restore)
    if (dialog.open) dialog.close()
  })
})
