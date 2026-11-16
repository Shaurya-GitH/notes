// The home page's posts slideshow: a native scroll-snap row (swipe, trackpad) that the buttons and
// the arrow keys step through; nothing moves on its own. The official LinkedIn and X embeds are
// third-party frames, so none is requested until the section nears the viewport, and then only for
// the slides in view. Each slide keeps its link card until its embed loads, and for good if the
// embed has not loaded within 8 s (that card is also the page without JavaScript). Every loaded post
// keeps its link below the frame, and LinkedIn needs it: its load event cannot tell a post from an
// error page.

const NEAR = "400px 0px"
const TIMEOUT = 8000

document.addEventListener("nav", () => {
  const reel = document.querySelector<HTMLElement>(".pf-home .reel")
  if (!reel) return
  const track = reel.querySelector<HTMLElement>(".slides")!
  const slides = [...track.children] as HTMLElement[]
  const prev = reel.querySelector<HTMLButtonElement>(".prev")!
  const next = reel.querySelector<HTMLButtonElement>(".next")!
  const count = reel.querySelector<HTMLElement>(".count")!
  const stops: (() => void)[] = []
  let near = false
  let at = 0
  let raf = 0

  const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth)
  // slides wholly in view: the track's width inside its padding, plus one gap, over one step
  const perView = () => {
    const inner = track.clientWidth - 2 * parseFloat(getComputedStyle(track).paddingLeft)
    return Math.min(
      slides.length,
      Math.max(1, Math.round((inner + step() - slides[0].offsetWidth) / step())),
    )
  }

  // X signals a render by message. LinkedIn only signals load, so its link must stay available.
  const embed = (slide: HTMLElement) => {
    const src = slide.dataset.embed
    if (!src || slide.querySelector("iframe") || slide.classList.contains("failed")) return
    const frame = document.createElement("iframe")
    const isX = src.startsWith("https://platform.twitter.com/")
    frame.inert = true
    frame.title = slide.dataset.title ?? ""
    frame.loading = "lazy"
    frame.referrerPolicy = "strict-origin-when-cross-origin"
    frame.allow = "fullscreen"
    let done = false
    const end = (ok: boolean) => {
      if (done) return
      done = true
      clearTimeout(timer)
      removeEventListener("message", onMessage)
      if (!frame.isConnected) return
      if (ok) {
        frame.inert = false
        slide.classList.add(isX ? "embedded" : "loaded")
      } else {
        frame.remove()
        slide.classList.add("failed")
      }
    }
    const timer = window.setTimeout(() => end(false), TIMEOUT)
    const onMessage = (e: MessageEvent) => {
      if (e.source === frame.contentWindow) end(true)
    }
    stops.push(() => end(false))
    if (isX) addEventListener("message", onMessage)
    else frame.addEventListener("load", () => end(true), { once: true })
    frame.addEventListener("error", () => end(false), { once: true })
    frame.src = src
    slide.append(frame)
  }

  const sync = () => {
    raf = 0
    const n = perView()
    at = Math.max(0, Math.min(Math.round(track.scrollLeft / step()), slides.length - n))
    const last = Math.min(at + n, slides.length)
    const text = n > 1 ? `${at + 1}–${last} / ${slides.length}` : `${at + 1} / ${slides.length}`
    if (count.textContent !== text) count.textContent = text
    prev.setAttribute("aria-disabled", String(at <= 0))
    next.setAttribute("aria-disabled", String(last >= slides.length))
    if (near) slides.slice(at, last).forEach(embed)
  }
  const onScroll = () => {
    raf ||= requestAnimationFrame(sync)
  }
  const go = (by: number) => {
    const to = Math.max(0, Math.min(at + by, slides.length - perView()))
    const reduce = document.documentElement.dataset.motion === "reduce"
    track.scrollTo({ left: to * step(), behavior: reduce ? "instant" : "smooth" })
  }
  const onPrev = () => go(-1)
  const onNext = () => go(1)
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    go(e.key === "ArrowLeft" ? -1 : 1)
  }

  // the ink cursor (stage.inline.ts) cannot follow the pointer into an embed's frame, so it hides
  // there; the next move outside brings it back
  const onOver = (e: PointerEvent) => {
    if ((e.target as Element).tagName === "IFRAME")
      document.querySelector(".pf-cursor")?.classList.remove("on")
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      near = true
      io.disconnect()
      sync()
    },
    { rootMargin: NEAR },
  )
  io.observe(reel)

  track.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll)
  track.addEventListener("keydown", onKey)
  track.addEventListener("pointerover", onOver)
  prev.addEventListener("click", onPrev)
  next.addEventListener("click", onNext)
  reel.classList.add("live")
  sync()

  window.addCleanup(() => {
    io.disconnect()
    cancelAnimationFrame(raf)
    stops.forEach((stop) => stop())
    track.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onScroll)
    track.removeEventListener("keydown", onKey)
    track.removeEventListener("pointerover", onOver)
    prev.removeEventListener("click", onPrev)
    next.removeEventListener("click", onNext)
  })
})
