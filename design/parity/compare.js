// Parity harness: screenshots a design artifact and the Quartz build at the same viewport, theme and
// scroll position, for side-by-side review. Run through the Playwright MCP tool:
//   browser_run_code_unsafe({ filename: "design/parity/compare.js" })
// Servers it expects (start them first; never run `npx quartz build` while --serve is running):
//   PROTO  python3 -m http.server 8765 -d design/prototype            (home artifact)
//   READER python3 -m http.server 8766 -d <note-page build.py output> (note-page artifact)
//   BUILD  npx quartz build --serve                                    (http://localhost:8080)
// Screenshots land in design/parity/out/ as <shot>-proto.png and <shot>-build.png.
async (page) => {
  const OUT = "design/parity/out/"
  const PROTO = "http://localhost:8765/starry-notes.html"
  const READER = "http://localhost:8766/test.html" // build.py output wrapped in a doctype, as the artifact viewer serves it
  const BUILD = "http://localhost:8080/"
  const DESKTOP = [1440, 900],
    PHONE = [390, 844]
  // scroll is a fraction of the page height, or a CSS selector to scroll to the top of
  const SHOTS = [
    {
      name: "note-tls-light-desktop",
      proto: READER,
      build: BUILD + "Security/TLS",
      size: DESKTOP,
      theme: "light",
    },
    {
      name: "note-tls-dark-desktop",
      proto: READER,
      build: BUILD + "Security/TLS",
      size: DESKTOP,
      theme: "dark",
    },
    {
      name: "note-tls-light-phone",
      proto: READER,
      build: BUILD + "Security/TLS",
      size: PHONE,
      theme: "light",
    },
    {
      name: "note-tls-dark-phone",
      proto: READER,
      build: BUILD + "Security/TLS",
      size: PHONE,
      theme: "dark",
    },
  ]
  const browser = page.context().browser()
  // reduced motion: no Lenis in the design and still ambient light, so shots are deterministic
  // a fresh context per shot: no state leaks between pages, and the theme is set before first paint
  const shoot = async (url, s, side) => {
    const ctx = await browser.newContext({ viewport: { width: s.size[0], height: s.size[1] }, reducedMotion: "reduce" })
    await ctx.addInitScript((t) => localStorage.setItem("theme", t), s.theme)
    const p = await ctx.newPage()
    try {
      await p.goto(url, { waitUntil: "commit", timeout: 60000 })
      await p.waitForFunction(() => document.readyState !== "loading", null, { timeout: 60000 }) // not "complete": analytics can hang the load event
      await p.evaluate(() => document.fonts && document.fonts.ready)
      if (s.scroll != null)
        await p.evaluate((y) => {
          const top = typeof y === "string" ? document.querySelector(y).offsetTop : y * document.documentElement.scrollHeight
          scrollTo({ top, behavior: "instant" })
        }, s.scroll)
      await p.waitForTimeout(s.settle ?? 1200)
      await p.screenshot({ path: `${OUT}${s.name}-${side}.png` })
    } finally {
      await ctx.close()
    }
  }
  const only = globalThis.PARITY_ONLY // set to a name prefix to run a subset
  const done = []
  for (const s of SHOTS) {
    if (only && !s.name.startsWith(only)) continue
    await shoot(s.proto, s, "proto")
    await shoot(s.build, s, "build")
    done.push(s.name)
  }
  return done
}
