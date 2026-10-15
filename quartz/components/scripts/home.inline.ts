// @ts-nocheck: a near-verbatim port of the script in design/prototype/starry-notes.html, kept close
// to its source so the motion stays 1:1 with the design; the adapted spots are commented
import { animate, stagger } from "animejs"
import { getFullSlug, pathToRoot } from "../../util/path"

// the home page's scroll story: painted stage, rings, sky, crows, spiral and the ink cursor.
// Runs only on the home page, and returns everything it started to the SPA's cleanup.
// the twins outlive a visit to the home page, so coming back from a note reuses the loaded images
const TWIN = {}
// this script first runs on the page the visitor landed on
const LANDED_HOME = getFullSlug(window) === "index"

function startHome() {
  let alive = true
  let raf = 0
  const offs = []
  const on = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts)
    offs.push(() => el.removeEventListener(type, fn, opts))
  }
  const IMG = pathToRoot(getFullSlug(window)) + "/static/vg/"
  // a section's top in document coordinates (the design measured offsetTop inside <main>)
  const docTop = (el) => el.getBoundingClientRect().top + scrollY

  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches
  const FINE = matchMedia("(pointer: fine)").matches
  const $ = (s) => document.querySelector(s)
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
  const ramp = (v, a, b) => clamp((v - a) / (b - a))
  const ease = (t) => 1 - Math.pow(1 - t, 3)

  // ---------- content ----------
  // the cards are rendered at build time (Home.tsx); their paintings are set here, after the SPA
  // router has moved to this URL, so the relative image paths resolve from the home page
  const cards = [...document.querySelectorAll(".card")]
  for (const c of cards) {
    c.style.backgroundImage = `url(${IMG}${c.dataset.art}.jpg)`
    c.style.backgroundPosition = c.dataset.pos
  }
  const irisEl = $("#iris")
  irisEl.style.backgroundImage = `url(${IMG}eye.jpg)`
  // keep the turning iris copy registered with the painting under it (object-fit: cover math)
  function placeIris() {
    const s = Math.max(innerWidth / 1376, innerHeight / 768),
      rw = 1376 * s,
      rh = 768 * s,
      ox = (innerWidth - rw) * 0.6,
      oy = (innerHeight - rh) * 0.5
    const cx = ox + 0.565 * rw,
      cy = oy + 0.62 * rh,
      d = 0.19 * rw
    eye.style.transformOrigin = cx + "px " + cy + "px"
    const rs = 2.2 * Math.max(innerWidth, innerHeight)
    Object.assign(ringsSvg.style, {
      left: cx - rs / 2 + "px",
      top: cy - rs / 2 + "px",
      width: rs + "px",
      height: rs + "px",
    })
    Object.assign(irisEl.style, {
      left: cx - d / 2 + "px",
      top: cy - d / 2 + "px",
      width: d + "px",
      height: d + "px",
      backgroundSize: rw + "px " + rh + "px",
      backgroundPosition: ox - (cx - d / 2) + "px " + (oy - (cy - d / 2)) + "px",
    })
  }

  // ---------- rings (sleep-well style tunnel, painted) ----------
  const ringsSvg = $("#rings"),
    RING_N = 16,
    ringEls = []
  const ringCols = ["#e8c06a", "#09395b", "#6fb3bd", "#041833", "#dfc489", "#165773"]
  for (let i = 0; i < RING_N; i++) {
    let d = ""
    for (let k = 0; k <= 48; k++) {
      const a = (k / 48) * Math.PI * 2,
        r = 100 + Math.sin(a * 6 + i) * 4 + Math.sin(a * 13 + i * 2) * 2.5
      d += (k ? "L" : "M") + (Math.cos(a) * r).toFixed(1) + " " + (Math.sin(a) * r).toFixed(1)
    }
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path")
    p.setAttribute("d", d + "Z")
    p.setAttribute("fill", "none")
    p.setAttribute("stroke", ringCols[i % ringCols.length])
    p.setAttribute("stroke-width", String(10 + (i % 3) * 4))
    p.setAttribute("stroke-linecap", "round")
    p.setAttribute(
      "stroke-dasharray",
      [38 + ((i * 13) % 50), 9 + ((i * 7) % 14), 70 + ((i * 17) % 60), 12 + ((i * 5) % 10)].join(
        " ",
      ),
    )
    p.setAttribute("stroke-dashoffset", String(i * 23))
    p.setAttribute("vector-effect", "non-scaling-stroke")
    ringsSvg.appendChild(p)
    ringEls.push(p)
  }

  // ---------- crows ----------
  const crowsSvg = $("#crows"),
    CROWS = 16
  for (let i = 0; i < CROWS; i++) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    g.setAttribute("class", "crow")
    const s = 0.7 + ((i * 37) % 10) / 14
    g.innerHTML = `<path d="M-14 0 Q-7 -${8 * s} 0 0 Q7 -${8 * s} 14 0" fill="none" stroke="#08090d" stroke-width="${3.2 * s}" stroke-linecap="round" style="animation-delay:-${(i * 0.13) % 0.5}s"/>`
    crowsSvg.appendChild(g)
  }
  const crowEls = [...crowsSvg.querySelectorAll(".crow")]
  let crowAnim = null
  if (!RM) {
    crowAnim = animate(crowEls, {
      x: [(el, i) => 640 + ((i * 53) % 220), (el, i) => 760 + ((i * 97) % 260)],
      y: [(el, i) => 430 + ((i * 29) % 60), (el, i) => 60 + ((i * 41) % 140)],
      opacity: [0, 1],
      duration: 1000,
      delay: stagger(30),
      ease: "outQuad",
      autoplay: false,
    })
  }

  // ---------- canvases ----------
  const flow = $("#flow"),
    fctx = flow.getContext("2d")
  const strands = $("#strands"),
    sctx = strands.getContext("2d")
  let W = 0,
    H = 0,
    DPR = 1
  function size() {
    DPR = Math.min(devicePixelRatio || 1, 1.5)
    W = innerWidth
    H = innerHeight
    for (const c of [flow, strands, revealC]) {
      c.width = W * DPR
      c.height = H * DPR
      c.getContext("2d").setTransform(DPR, 0, 0, DPR, 0, 0)
    }
  }
  // vortices sit on the sky plate's two spirals and the moon (fractions of the plate)
  const VORT = [
    [0.47, 0.47, 1.0],
    [0.69, 0.6, 0.7],
    [0.89, 0.22, 0.55],
  ]
  const PCOL = [
    "rgba(223,196,137,",
    "rgba(111,179,189,",
    "rgba(130,170,220,",
    "rgba(111,179,189,",
    "rgba(236,227,200,",
    "rgba(90,140,200,",
  ]
  const parts = []
  function seed(p) {
    p.x = Math.random() * W
    p.y = Math.random() * H
    p.life = 40 + Math.random() * 90
    p.c = PCOL[(Math.random() * PCOL.length) | 0]
    p.w = 1.6 + Math.random() * 2.4
    return p
  }
  function field(x, y, t) {
    let vx = 0.9 + 0.25 * Math.sin(y * 0.006 + t * 0.2),
      vy = 0.18 * Math.sin(x * 0.004 + t * 0.15)
    for (const [fx, fy, s] of VORT) {
      const dx = x - fx * W,
        dy = y - fy * H,
        r2 = dx * dx + dy * dy,
        R = Math.min(W, H) * 0.22,
        k = s * 3.2 * Math.exp(-r2 / (R * R))
      vx += (-dy / Math.sqrt(r2 + 1)) * k
      vy += (dx / Math.sqrt(r2 + 1)) * k
    }
    return [vx, vy]
  }
  function drawFlow(t) {
    fctx.globalCompositeOperation = "destination-out"
    fctx.fillStyle = "rgba(0,0,0,0.045)"
    fctx.fillRect(0, 0, W, H)
    fctx.globalCompositeOperation = "source-over"
    fctx.lineCap = "round"
    while (parts.length < Math.round((W * H) / 4200)) parts.push(seed({}))
    for (const p of parts) {
      const [vx, vy] = field(p.x, p.y, t),
        nx = p.x + vx * 2.2,
        ny = p.y + vy * 2.2
      fctx.strokeStyle = p.c + "0.36)"
      fctx.lineWidth = p.w
      fctx.beginPath()
      fctx.moveTo(p.x, p.y)
      fctx.lineTo(nx, ny)
      fctx.stroke()
      p.x = nx
      p.y = ny
      if (--p.life < 0 || p.x > W + 20 || p.y < -20 || p.y > H + 20) seed(p)
    }
  }
  const SC = ["rgba(255,243,196,", "rgba(232,192,106,", "rgba(111,179,189,", "rgba(236,227,200,"]
  function drawStrands(t) {
    sctx.clearRect(0, 0, W, H)
    sctx.globalCompositeOperation = "lighter"
    const N = 56
    for (let i = 0; i < N; i++) {
      const o = (i - N / 2) * 2.2,
        ph = i * 0.11
      sctx.strokeStyle = SC[i % 4] + (0.07 + 0.05 * Math.sin(i * 1.7 + t)) + ")"
      sctx.lineWidth = 0.8 + (i % 3) * 0.5
      sctx.beginPath()
      for (let x = -40; x <= W + 40; x += 18) {
        const u = x / W,
          base = H * (0.7 - 0.22 * u) + o
        const y =
          base +
          Math.sin(u * 5.2 + t * 0.55 + ph) * H * 0.07 +
          Math.sin(u * 11 - t * 0.35 + ph * 2) * H * 0.025 * (1 - u * 0.5)
        x < 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y)
      }
      sctx.stroke()
    }
    sctx.globalCompositeOperation = "source-over"
  }

  // ---------- scroll-driven stage ----------
  const quote = $("p.quote")
  const eye = $("#eye"),
    sky = $("#sky"),
    fieldL = $("#field"),
    sky2 = $("#sky2"),
    scrim = $("#scrim"),
    wipe = $(".wipe")
  const secs = {
    iris: $("#beat-iris"),
    world: $("#beat-world"),
    about: $(".center > article"),
    spiral: $("#spiral"),
  }
  let B = {}
  function measure() {
    const vh = innerHeight
    for (const k in secs) B[k] = docTop(secs[k]) / vh
    B.spiralLen = (secs.spiral.offsetHeight - vh) / vh
  }
  let flowOn = 0,
    strandsOn = 0
  function stage() {
    const v = scrollY / innerHeight
    if (RM) {
      fieldL.style.opacity = 1
      scrim.style.opacity = 0.62
      eye.style.opacity = 0
      flowOn = strandsOn = 0
      return
    }
    // beat 1: zoom into the iris
    const z = ease(ramp(v, 0, B.iris + 0.15))
    eye.style.transform = `scale(${1 + 7 * z})`
    eye.style.opacity = 1 - ramp(v, B.iris - 0.2, B.iris + 0.2)
    // tunnel rings bloom out of the iris
    const rv = ramp(v, 0.45, B.iris + 0.45),
      rOp = Math.sin(rv * Math.PI)
    ringsSvg.style.opacity = rOp * 0.7
    if (rOp > 0.01)
      ringEls.forEach((p, i) => {
        const f = (i / RING_N + rv * 1.6) % 1,
          s = 0.05 * Math.pow(60, f)
        p.setAttribute(
          "transform",
          `scale(${s.toFixed(3)}) rotate(${(i * 11 + rv * 90).toFixed(1)})`,
        )
        p.setAttribute("stroke-opacity", (f < 0.12 ? f / 0.12 : 1).toFixed(2))
      })
    // beat 2: the sky
    const skyIn = ramp(v, B.iris - 0.2, B.iris + 0.25),
      skyOut = ramp(v, B.world - 0.3, B.world + 0.3)
    quote.style.opacity = ramp(v, B.iris - 0.3, B.iris + 0.1).toFixed(3)
    sky.style.opacity = skyIn * (1 - skyOut)
    sky.style.transform = `scale(${1.35 - 0.35 * ease(ramp(v, B.iris - 0.2, B.world))})`
    // beat 3: her world
    const fIn = skyOut,
      fOut = ramp(v, B.spiral - 0.6, B.spiral)
    fieldL.style.opacity = fIn * (1 - fOut)
    fieldL.style.transform = `scale(${1.18 - 0.18 * ease(ramp(v, B.world - 0.3, B.about))})`
    // beat 5: back to the sky for the spiral
    sky2.style.opacity = fOut
    scrim.style.opacity = 0.74 * ramp(v, B.about - 0.5, B.about) * (1 - 0.25 * fOut)
    flowOn = Math.max(sky.style.opacity * 1, fOut) * (1 - 0.35 * ramp(v, B.about - 0.5, B.about))
    strandsOn = Math.sin(ramp(v, B.iris - 0.1, B.world + 0.1) * Math.PI)
    $("#flow").style.opacity = flowOn
    $("#strands").style.opacity = strandsOn
    if (crowAnim) crowAnim.seek(ramp(v, B.world - 0.2, B.about + 0.1) * crowAnim.duration)
    // spiral: wipe in, then turn the helix
    const sp = ramp(v, B.spiral, B.spiral + B.spiralLen)
    const wp = ease(ramp(v, B.spiral - 0.6, B.spiral + 0.2))
    wipe.style.clipPath = `circle(${(wp * 150).toFixed(1)}% at 60% 55%)`
    // under the spiral's dark wash the stage's ink only reads as smudges; there it lives on the cards
    $("#reveal").style.opacity = (1 - wp).toFixed(3)
    helix(sp)
  }
  // each card is projected on its own and stacked by depth, not placed in one shared 3D space:
  // in a shared space neighbours closer than a card's width cut through each other as they turn
  function helix(sp) {
    if (RM) return
    const narrow = innerWidth < 860,
      R = narrow ? Math.min(200, innerWidth * 0.3) : 380,
      STEP = narrow ? 44 : 40,
      RISE = narrow ? 46 : 64,
      P = 1400
    const rot = sp * (cards.length - 1) * STEP
    cards.forEach((c, i) => {
      const th = i * STEP - rot,
        rad = (th * Math.PI) / 180,
        zz = R * Math.cos(rad) - R,
        k = P / (P - zz),
        x = R * Math.sin(rad) * k,
        // the old rotateX tilt: cards further back sit higher
        y = ((i - sp * (cards.length - 1)) * RISE + zz * 0.22) * k
      const front = (Math.cos(rad) + 1) / 2
      c.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) perspective(${P}px) translateZ(${zz.toFixed(1)}px) rotateY(${(th * 0.8).toFixed(1)}deg)`
      // dim with an opaque wash, so a card never shows through the one in front; fade out only at the back
      c.style.setProperty("--dim", ((1 - front) * 0.72).toFixed(3))
      c.style.opacity = ramp(front, 0.45, 0.72).toFixed(3)
      c.style.zIndex = Math.round(front * 100)
      c.tabIndex = front > 0.55 ? 0 : -1
      // only the front card takes clicks; the ones behind it are mostly covered (WCAG 2.5.8)
      c.style.pointerEvents = front > 0.9 ? "" : "none"
    })
  }
  // keyboard: focusing a card scrolls the spiral to it
  cards.forEach((c, i) =>
    on(c, "focus", () => {
      if (RM) return
      const top =
        docTop(secs.spiral) + (i / (cards.length - 1)) * (secs.spiral.offsetHeight - innerHeight)
      window.lenis ? window.lenis.scrollTo(top, { duration: 0.6 }) : scrollTo({ top })
    }),
  )

  // ---------- cursor: ink that opens a window onto the inverted universe ----------
  // After Buttermax: the cursor pours ink into a small fluid simulation, and wherever the ink lies
  // the same scene shows in an inverted universe (ember sky, black moon, white-haired twin, doves
  // for crows). The ink curls, drips and thins from its tail on its own once the cursor stops.
  const revealC = $("#reveal"),
    rctx = revealC.getContext("2d"),
    cur = $("#cursor"),
    halo = cur.querySelector(".halo")

  // stable fluids on the GPU, after Pavel Dobryakov's WebGL Fluid Simulation (MIT)
  function makeInk() {
    const c = document.createElement("canvas")
    const gl = c.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      antialias: false,
      depth: false,
    })
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null
    const VS = `#version 300 es
      in vec2 p; uniform vec2 tx; out vec2 uv, vL, vR, vT, vB;
      void main() {
        uv = p * .5 + .5;
        vL = uv - vec2(tx.x, 0.); vR = uv + vec2(tx.x, 0.);
        vT = uv + vec2(0., tx.y); vB = uv - vec2(0., tx.y);
        gl_Position = vec4(p, 0., 1.);
      }`
    const HEAD = `#version 300 es
      precision highp float; in vec2 uv, vL, vR, vT, vB; out vec4 o;`
    const FS = {
      splat: `uniform sampler2D T; uniform vec2 pt; uniform vec3 col; uniform float r, aspect;
        void main() { vec2 d = uv - pt; d.x *= aspect; o = vec4(texture(T, uv).xyz + col * exp(-dot(d, d) / r), 1.); }`,
      advect: `uniform sampler2D V, S; uniform vec2 tx; uniform float dt, diss;
        void main() { vec2 c = uv - dt * texture(V, uv).xy * tx; o = texture(S, c) / (1. + diss * dt); }`,
      div: `uniform sampler2D V;
        void main() { o = vec4(.5 * (texture(V, vR).x - texture(V, vL).x + texture(V, vT).y - texture(V, vB).y), 0., 0., 1.); }`,
      curl: `uniform sampler2D V;
        void main() { o = vec4(.5 * (texture(V, vR).y - texture(V, vL).y - texture(V, vT).x + texture(V, vB).x), 0., 0., 1.); }`,
      vort: `uniform sampler2D V, C; uniform float curl, dt;
        void main() {
          float L = texture(C, vL).x, R = texture(C, vR).x, T = texture(C, vT).x, B = texture(C, vB).x;
          vec2 f = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          f = f / (length(f) + 1e-4) * curl * texture(C, uv).x; f.y *= -1.;
          o = vec4(texture(V, uv).xy + f * dt, 0., 1.);
        }`,
      pres: `uniform sampler2D P, D;
        void main() { o = vec4((texture(P, vL).x + texture(P, vR).x + texture(P, vT).x + texture(P, vB).x - texture(D, uv).x) * .25, 0., 0., 1.); }`,
      grad: `uniform sampler2D P, V;
        void main() { o = vec4(texture(V, uv).xy - vec2(texture(P, vR).x - texture(P, vL).x, texture(P, vT).x - texture(P, vB).x), 0., 1.); }`,
      fade: `uniform sampler2D T; uniform float k; void main() { o = k * texture(T, uv); }`,
      // a hard threshold gives the ink its crisp, liquid edge
      show: `uniform sampler2D T; void main() { o = vec4(1., 1., 1., smoothstep(.12, .2, texture(T, uv).x)); }`,
    }
    const shader = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const vs = shader(gl.VERTEX_SHADER, VS)
    const P = {}
    for (const k in FS) {
      const pr = gl.createProgram()
      gl.attachShader(pr, vs)
      gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, HEAD + FS[k]))
      gl.bindAttribLocation(pr, 0, "p")
      gl.linkProgram(pr)
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null
      P[k] = { pr, u: {} }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const fbo = (w, h) => {
      const t = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, t)
      for (const [k, v] of [
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ])
        gl.texParameteri(gl.TEXTURE_2D, k, v)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
      const f = gl.createFramebuffer()
      gl.bindFramebuffer(gl.FRAMEBUFFER, f)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      return { t, f, w, h }
    }
    const pair = (w, h) => {
      const p = { read: fbo(w, h), write: fbo(w, h) }
      p.swap = () => ([p.read, p.write] = [p.write, p.read])
      return p
    }
    let vel, dye, pres, divF, curlF, tx
    const res = (n) => (W > H ? [Math.round((n * W) / H), n] : [n, Math.round((n * H) / W)])
    function resize() {
      c.width = W
      c.height = H
      const [sw, sh] = res(128),
        [dw, dh] = res(512)
      vel = pair(sw, sh)
      pres = pair(sw, sh)
      divF = fbo(sw, sh)
      curlF = fbo(sw, sh)
      dye = pair(dw, dh)
      tx = [1 / sw, 1 / sh]
    }
    function run(name, target, uni) {
      const p = P[name]
      gl.useProgram(p.pr)
      let unit = 0
      for (const k in uni) {
        const loc = p.u[k] ?? (p.u[k] = gl.getUniformLocation(p.pr, k)),
          v = uni[k]
        if (v && v.t) {
          gl.activeTexture(gl.TEXTURE0 + unit)
          gl.bindTexture(gl.TEXTURE_2D, v.t)
          gl.uniform1i(loc, unit++)
        } else if (Array.isArray(v)) gl[`uniform${v.length}f`](loc, ...v)
        else gl.uniform1f(loc, v)
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.f : null)
      gl.viewport(0, 0, target ? target.w : c.width, target ? target.h : c.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    const ink = {
      canvas: c,
      resize,
      // x, y and this frame's move in CSS pixels; r is the blob size in units of screen height squared
      splat(x, y, dx, dy, r) {
        const pt = [x / W, 1 - y / H],
          aspect = W / H
        run("splat", vel.write, {
          tx,
          T: vel.read,
          pt,
          col: [(dx / W) * 5000, (-dy / H) * 5000, 0],
          r,
          aspect,
        })
        vel.swap()
        run("splat", dye.write, { tx, T: dye.read, pt, col: [0.3, 0, 0], r, aspect })
        dye.swap()
      },
      step(dt) {
        run("curl", curlF, { tx, V: vel.read })
        run("vort", vel.write, { tx, V: vel.read, C: curlF, curl: 22, dt })
        vel.swap()
        run("div", divF, { tx, V: vel.read })
        run("fade", pres.write, { tx, T: pres.read, k: 0.8 })
        pres.swap()
        for (let i = 0; i < 20; i++) {
          run("pres", pres.write, { tx, P: pres.read, D: divF })
          pres.swap()
        }
        run("grad", vel.write, { tx, P: pres.read, V: vel.read })
        vel.swap()
        run("advect", vel.write, { tx, V: vel.read, S: vel.read, dt, diss: 1.2 })
        vel.swap()
        run("advect", dye.write, { tx, V: vel.read, S: dye.read, dt, diss: 2.4 })
        dye.swap()
        run("show", null, { tx, T: dye.read })
      },
    }
    return ink
  }

  // ---------- the twins ----------
  // they load after the page's own art, so they never hold up the first screen; start on the window's
  // load or the first pointer move, whichever comes first (inside the artifact frame the load event
  // can fire before this script runs)
  for (const n of ["eye", "sky", "field", "almond"])
    TWIN[n] ||= Object.assign(new Image(), { later: `${IMG}${n}-alt.jpg` })
  const startTwins = () => Object.values(TWIN).forEach((i) => i.src || (i.src = i.later))
  // only where the ink runs; a landing on home waits for its first screen to paint, arriving from a
  // note starts them at once, and a return visit finds them loaded
  const twinTimer =
    FINE && !RM && !TWIN.eye.src ? setTimeout(startTwins, LANDED_HOME ? 1200 : 0) : 0
  // the eye twin was generated from text, so `fit` pins its iris (ax, ay) onto the original's (bx, by)
  const FIT = { eye: [0.534, 0.605, 0.565, 0.62, 1.08] }
  // object-fit: cover (and background-size: cover) at a given position, in the target's own pixels
  function drawCover(ctx, name, w, h, px, py) {
    const img = TWIN[name]
    if (!img.complete || !img.naturalWidth) return
    const k = Math.max(w / img.naturalWidth, h / img.naturalHeight),
      iw = img.naturalWidth * k,
      ih = img.naturalHeight * k,
      x = (w - iw) * px,
      y = (h - ih) * py,
      f = FIT[name]
    if (!f) return ctx.drawImage(img, x, y, iw, ih)
    ctx.save()
    ctx.translate(x + f[2] * iw, y + f[3] * ih)
    ctx.scale(f[4], f[4])
    ctx.drawImage(img, -f[0] * iw, -f[1] * ih, iw, ih)
    ctx.restore()
  }
  const STAGE = [
    [eye, "eye", 0.6, 0.5],
    [sky, "sky", 0.5, 0.5],
    [fieldL, "field", 0.5, 0.5],
    [sky2, "sky", 0.5, 0.5],
  ]
  // apply an element's computed transform about its transform-origin, as the browser does
  function applyCss(ctx, el) {
    const cs = getComputedStyle(el)
    if (cs.transform === "none") return
    const [ox, oy] = cs.transformOrigin.split(" ").map(parseFloat),
      m = new DOMMatrix(cs.transform)
    ctx.translate(ox, oy)
    ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f)
    ctx.translate(-ox, -oy)
  }
  // the inverted stage, composited exactly like the real one: same layers, opacities, zoom and drift;
  // false while a showing layer's twin is still loading, so the ink never opens onto a bare fill
  function drawStage() {
    for (const [el, name] of STAGE)
      if (+el.style.opacity >= 0.01 && !TWIN[name].naturalWidth) return false
    rctx.globalCompositeOperation = "source-over"
    rctx.fillStyle = "#041833"
    rctx.fillRect(0, 0, W, H)
    for (const [el, name, px, py] of STAGE) {
      const op = +el.style.opacity || 0
      if (op < 0.01) continue
      rctx.save()
      rctx.globalAlpha = op
      applyCss(rctx, el)
      applyCss(rctx, el.querySelector("img"))
      drawCover(rctx, name, W, H, px, py)
      rctx.restore()
    }
    drawDoves()
    return true
  }
  // inside the ink every crow is a white dove, flying the same path
  function drawDoves() {
    const f = Math.sin(clock * 12)
    for (const g of crowEls) {
      const op = +getComputedStyle(g).opacity
      if (op < 0.05) continue
      const r = g.getBoundingClientRect()
      if (!r.width) continue
      const sc = r.width / 26
      rctx.save()
      rctx.globalAlpha = op
      rctx.translate(r.left + r.width / 2, r.top + r.height / 2)
      rctx.scale(sc, sc)
      rctx.fillStyle = "#f6f1e6"
      rctx.strokeStyle = "rgba(4,24,51,0.55)"
      rctx.lineWidth = 0.8
      for (const d of [-1, 1]) {
        rctx.beginPath()
        rctx.moveTo(0, 0)
        rctx.quadraticCurveTo(d * 7, -9 * f - 2, d * 15, -6 * f - 1)
        rctx.quadraticCurveTo(d * 8, -1, 0, 1.5)
        rctx.fill()
        rctx.stroke()
      }
      rctx.beginPath()
      rctx.ellipse(1, 1.5, 6, 2.4, 0, 0, Math.PI * 2)
      rctx.fill()
      rctx.beginPath()
      rctx.arc(6.5, 0.6, 1.9, 0, Math.PI * 2)
      rctx.fill()
      rctx.restore()
    }
  }
  // each spiral card carries its own twin canvas inside it, so the browser's 3D transform and the
  // card's depth dimming apply to it too; three corner pins give the card's on-screen placement
  const cardTwins = cards.map((card, i) => {
    const cv = document.createElement("canvas")
    cv.className = "twin"
    card.prepend(cv)
    const pins = ["tl", "tr", "bl"].map((k) => {
      const p = document.createElement("i")
      p.className = "pin " + k
      card.append(p)
      return p
    })
    const [px, py] = card.dataset.pos.split(" ").map((v) => parseFloat(v) / 100)
    return { card, cv, ctx: cv.getContext("2d"), pins, name: card.dataset.art, px, py }
  })
  function drawCards() {
    const r = secs.spiral.getBoundingClientRect()
    const onScreen = r.bottom > 0 && r.top < H
    for (const t of cardTwins) {
      const w = t.card.offsetWidth,
        h = t.card.offsetHeight,
        d = Math.min(devicePixelRatio || 1, 1.5)
      if (!onScreen || +t.card.style.opacity < 0.05) {
        if (t.drawn) t.ctx.clearRect(0, 0, t.cv.width, t.cv.height)
        t.drawn = false
        continue
      }
      if (t.cv.width !== Math.round(w * d)) {
        t.cv.width = Math.round(w * d)
        t.cv.height = Math.round(h * d)
      }
      const [a, b, c] = t.pins.map((p) => p.getBoundingClientRect())
      // card pixels -> screen pixels (an affine fit to three corners; close enough at these angles)
      const m = new DOMMatrix([
        (b.left - a.left) / w,
        (b.top - a.top) / w,
        (c.left - a.left) / h,
        (c.top - a.top) / h,
        a.left,
        a.top,
      ])
      const x = t.ctx
      x.setTransform(d, 0, 0, d, 0, 0)
      x.globalCompositeOperation = "copy"
      drawCover(x, t.name, w, h, t.px, t.py)
      x.globalCompositeOperation = "destination-in"
      x.setTransform(new DOMMatrix().scale(d).multiply(m.inverse()))
      x.drawImage(ink.canvas, 0, 0, W, H)
      t.drawn = true
    }
  }

  // ---------- pointer ----------
  const ink = FINE && !RM ? makeInk() : null
  const ptr = { x: 0, y: 0, px: 0, py: 0, hx: 0, hy: 0, seen: false }
  let clock = 0,
    wet = Infinity // seconds since ink last went down; the sim idles once it has all dried
  const CLICKABLE = "a, button, [role=button], summary, label, input, select, textarea"
  function hover() {
    const el = ptr.seen && document.elementFromPoint(ptr.x, ptr.y),
      link = el && el.closest(CLICKABLE)
    cur.classList.toggle("link", !!link)
    // the spiral cards are links too, but they are paintings: ink pours over them
    ptr.clean = !!link && !link.classList.contains("card")
  }
  if (ink) {
    document.documentElement.classList.add("brush")
    const note = document.createElement("p")
    note.className = "margin"
    note.id = "brush-note"
    note.textContent = $(".home-stage").dataset.brush ?? ""
    if (note.textContent) secs.about.appendChild(note)
    on(
      window,
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return
        ptr.x = e.clientX
        ptr.y = e.clientY
        if (!ptr.seen) {
          ptr.seen = true
          ptr.px = ptr.hx = ptr.x
          ptr.py = ptr.hy = ptr.y
        }
        cur.classList.add("on")
        hover()
      },
      { passive: true },
    )
    on(document, "pointerleave", () => cur.classList.remove("on"))
    on(window, "scroll", hover, { passive: true })
  } else cur.remove()
  function brushStep(dt) {
    if (!ink || !ptr.seen) return
    if (ink.canvas.width !== W || ink.canvas.height !== H) ink.resize()
    const k = 1 - Math.pow(0.000001, dt)
    ptr.hx += (ptr.x - ptr.hx) * k
    ptr.hy += (ptr.y - ptr.hy) * k
    cur.style.transform = `translate3d(${ptr.x}px, ${ptr.y}px, 0)`
    halo.style.transform = `translate3d(${(ptr.hx - ptr.x).toFixed(1)}px, ${(ptr.hy - ptr.y).toFixed(1)}px, 0)`
    const dx = ptr.x - ptr.px,
      dy = ptr.y - ptr.py,
      moved = Math.hypot(dx, dy)
    // faster moves pour a fatter blob; links stay clean so the halo reads, and a jump this big in one
    // frame is the pointer re-entering, not a stroke
    if (moved > 0.5 && moved < 220 && !ptr.clean) {
      ink.splat(ptr.x, ptr.y, dx, dy, 0.0014 * (1 + Math.min(moved / dt / 1500, 1.8)))
      wet = 0
    }
    ptr.px = ptr.x
    ptr.py = ptr.y
    clock += dt
    wet += dt
    if (wet > 4) return // dry: nothing left to draw
    ink.step(dt)
    if (drawStage()) {
      rctx.globalCompositeOperation = "destination-in"
      rctx.drawImage(ink.canvas, 0, 0, W, H)
      rctx.globalCompositeOperation = "source-over"
    } else rctx.clearRect(0, 0, W, H)
    drawCards()
    if (wet > 3.9) {
      rctx.clearRect(0, 0, W, H)
      for (const t of cardTwins) t.ctx.clearRect(0, 0, t.cv.width, t.cv.height)
    }
  }

  // ---------- loop ----------
  // smooth scrolling is the shared SmoothScroll instance (window.lenis)
  size()
  measure()
  placeIris()
  stage()
  on(window, "resize", () => {
    size()
    measure()
    placeIris()
    stage()
  })
  on(window, "scroll", stage, { passive: true })
  if (document.fonts)
    document.fonts.ready.then(() => {
      if (!alive) return
      measure()
      stage()
    })
  let last = performance.now()
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = now / 1000
    if (!RM && !document.hidden) {
      if (flowOn > 0.02) drawFlow(t)
      else if (parts.length) fctx.clearRect(0, 0, W, H)
      if (strandsOn > 0.02) drawStrands(t)
      brushStep(dt)
    }
    if (alive) raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return () => {
    alive = false
    cancelAnimationFrame(raf)
    clearTimeout(twinTimer)
    offs.forEach((f) => f())
    crowAnim?.revert?.()
    ink?.canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext()
    document.documentElement.classList.remove("brush")
  }
}

document.addEventListener("nav", () => {
  if (getFullSlug(window) !== "index" || !document.querySelector(".home-stage")) return
  window.addCleanup(startHome())
})
