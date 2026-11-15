// @ts-nocheck: a near-verbatim port of the script in design/prototype/starry-notes.html, kept close
// to its source so the motion stays 1:1 with the design; the adapted spots are commented
import { animate, stagger } from "animejs"
import { getFullSlug, pathToRoot } from "../../util/path"

// The Journey's scroll story (painted stage, rings, sky, crows) and the ink cursor that paints any
// plate with a twin (the stage, and every element marked data-twin: the home hero, painted cards,
// Journey stops). Runs on any page that has either, and returns everything it started to the SPA's
// cleanup. Motion "reduce" (html[data-motion]) keeps the stage still and turns the ink off.
// the twins outlive a visit to a page, so coming back reuses the loaded images
const TWIN = {}
// this script first runs on the page the visitor landed on
const LANDED = getFullSlug(window)

function startPage() {
  const stageEl = document.querySelector(".pf-stage")
  const targets = [...document.querySelectorAll("[data-twin]")]
  if (!stageEl && !targets.length) return null
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

  const RM = document.documentElement.dataset.motion === "reduce"
  const FINE = matchMedia("(pointer: fine)").matches
  const $ = (s) => document.querySelector(s)
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
  const ramp = (v, a, b) => clamp((v - a) / (b - a))
  const ease = (t) => 1 - Math.pow(1 - t, 3)

  // ---------- the stage (Journey only) ----------
  const irisEl = $("#iris")
  if (irisEl) irisEl.style.backgroundImage = `url(${IMG}eye.jpg)`
  // keep the turning iris copy registered with the painting under it (object-fit: cover math)
  function placeIris() {
    if (!stageEl) return
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
    RING_N = stageEl ? 16 : 0,
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
    CROWS = stageEl ? 16 : 0
  for (let i = 0; i < CROWS; i++) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    g.setAttribute("class", "crow")
    const s = 0.7 + ((i * 37) % 10) / 14
    g.innerHTML = `<path d="M-14 0 Q-7 -${8 * s} 0 0 Q7 -${8 * s} 14 0" fill="none" stroke="#08090d" stroke-width="${3.2 * s}" stroke-linecap="round" style="animation-delay:-${(i * 0.13) % 0.5}s"/>`
    crowsSvg.appendChild(g)
  }
  const crowEls = crowsSvg ? [...crowsSvg.querySelectorAll(".crow")] : []
  let crowAnim = null
  if (!RM && crowEls.length) {
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
    fctx = flow?.getContext("2d")
  const strands = $("#strands"),
    sctx = strands?.getContext("2d")
  let W = 0,
    H = 0,
    DPR = 1
  function size() {
    DPR = Math.min(devicePixelRatio || 1, 1.5)
    W = innerWidth
    H = innerHeight
    for (const c of [flow, strands, revealC]) {
      if (!c) continue
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
  const eye = $("#eye"),
    sky = $("#sky"),
    fieldL = $("#field"),
    scrim = $("#scrim")
  const secs = {
    iris: $("#beat-iris"),
    world: $("#beat-world"),
    stops: $("#stops"),
  }
  let B = {}
  function measure() {
    if (!stageEl) return
    const vh = innerHeight
    for (const k in secs) B[k] = docTop(secs[k]) / vh
  }
  let flowOn = 0,
    strandsOn = 0
  function stage() {
    if (!stageEl) return
    const v = scrollY / innerHeight
    // reduced motion: the last frame, still (the transition beats are hidden by CSS)
    if (RM) {
      fieldL.style.opacity = 1
      fieldL.style.transform = ""
      sky.style.opacity = 0
      scrim.style.opacity = 0
      eye.style.opacity = 0
      ringsSvg.style.opacity = 0
      flow.style.opacity = strands.style.opacity = 0
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
    sky.style.opacity = skyIn * (1 - skyOut)
    sky.style.transform = `scale(${1.35 - 0.35 * ease(ramp(v, B.iris - 0.2, B.world))})`
    // beat 3: her world, where the Journey's title sits; the stops then slide over the stage
    fieldL.style.opacity = skyOut
    fieldL.style.transform = `scale(${1.18 - 0.18 * ease(ramp(v, B.world - 0.3, B.stops))})`
    scrim.style.opacity = 0.74 * ramp(v, B.stops - 0.5, B.stops)
    flowOn = sky.style.opacity * (1 - 0.35 * ramp(v, B.stops - 0.5, B.stops))
    strandsOn = Math.sin(ramp(v, B.iris - 0.1, B.world + 0.1) * Math.PI)
    flow.style.opacity = flowOn
    strands.style.opacity = strandsOn
    if (crowAnim) crowAnim.seek(ramp(v, B.world - 0.2, B.stops + 0.1) * crowAnim.duration)
  }
  // ---------- cursor: ink that opens a window onto the inverted universe ----------
  // After Buttermax: the cursor pours ink into a small fluid simulation, and wherever the ink lies
  // the same scene shows in an inverted universe (ember sky, black moon, white-haired twin, doves
  // for crows). The ink curls, drips and thins from its tail on its own once the cursor stops.
  const revealC = $("#reveal"),
    rctx = revealC?.getContext("2d")
  // the cursor: a star with a dashed halo (the markup is decoration, so it is made here)
  const cur = document.createElement("div")
  cur.className = "pf-cursor"
  cur.setAttribute("aria-hidden", "true")
  cur.innerHTML = '<div class="halo"><i></i></div><div class="core"></div>'
  const halo = cur.querySelector(".halo")

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
  const names = new Set(targets.map((t) => t.dataset.twin))
  if (stageEl) ["eye", "sky", "field"].forEach((n) => names.add(n))
  for (const n of names) TWIN[n] ||= Object.assign(new Image(), { later: `${IMG}${n}-alt.jpg` })
  const startTwins = () => names.forEach((n) => TWIN[n].src || (TWIN[n].src = TWIN[n].later))
  // only where the ink runs; a landing waits for its first screen to paint, arriving from another
  // page starts them at once, and a return visit finds them loaded
  const twinTimer =
    FINE && !RM ? setTimeout(startTwins, LANDED === getFullSlug(window) ? 1200 : 0) : 0
  // the eye twin was generated from text, so `fit` pins its iris (ax, ay) onto the original's (bx, by)
  const FIT = { eye: [0.534, 0.605, 0.565, 0.62, 1.08] }
  // object-fit: cover (and background-size: cover) at a given position, in the target's own pixels
  // (sw: the plate's background-size as a fraction of the element's width, when it is not cover)
  function drawCover(ctx, name, w, h, px, py, sw = 0) {
    const img = TWIN[name]
    if (!img.complete || !img.naturalWidth) return
    const k = sw
        ? (sw * w) / img.naturalWidth
        : Math.max(w / img.naturalWidth, h / img.naturalHeight),
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
  const STAGE = stageEl
    ? [
        [eye, "eye", 0.6, 0.5],
        [sky, "sky", 0.5, 0.5],
        [fieldL, "field", 0.5, 0.5],
      ]
    : []
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
  // a layer showing its portrait crop (phones) has no twin to match it
  const portrait = (el) => el.querySelector("img")?.currentSrc.includes("portrait")
  function drawStage() {
    if (!stageEl) return false
    for (const [el, name] of STAGE)
      if (+el.style.opacity >= 0.01 && (!TWIN[name].naturalWidth || portrait(el))) return false
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
  // every data-twin element carries its own twin canvas, laid over its plate and under its content;
  // the twin is drawn as the element's plate is (cover, at data-pos), and the ink masks it in place
  const elTwins = targets.map((el) => {
    const cv = document.createElement("canvas")
    cv.className = "twin"
    cv.setAttribute("aria-hidden", "true")
    el.append(cv)
    const [px, py] = (el.dataset.pos ?? "50% 50%").split(" ").map((v) => parseFloat(v) / 100)
    const sw = el.dataset.size ? parseFloat(el.dataset.size) / 100 : 0
    return { el, cv, ctx: cv.getContext("2d"), name: el.dataset.twin, px, py, sw }
  })
  function drawTargets() {
    const d = Math.min(devicePixelRatio || 1, 1.5)
    for (const t of elTwins) {
      const r = t.el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > H || !r.width || portrait(t.el)) {
        if (t.drawn) t.ctx.clearRect(0, 0, t.cv.width, t.cv.height)
        t.drawn = false
        continue
      }
      if (t.cv.width !== Math.round(r.width * d) || t.cv.height !== Math.round(r.height * d)) {
        t.cv.width = Math.round(r.width * d)
        t.cv.height = Math.round(r.height * d)
      }
      const x = t.ctx
      x.setTransform(d, 0, 0, d, 0, 0)
      x.globalCompositeOperation = "copy"
      drawCover(x, t.name, r.width, r.height, t.px, t.py, t.sw)
      x.globalCompositeOperation = "destination-in"
      x.drawImage(ink.canvas, -r.left, -r.top, W, H)
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
    // painted cards are links too, but they are paintings: ink pours over them
    ptr.clean = !!link && !link.classList.contains("painted")
  }
  // the brush note ("paint to find it") shows only where the ink runs
  const note = $(".brush-note")
  if (ink) {
    document.documentElement.classList.add("brush")
    document.body.append(cur)
    if (note) note.hidden = false
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
  }
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
    } else rctx?.clearRect(0, 0, W, H)
    drawTargets()
    if (wet > 3.9) {
      rctx?.clearRect(0, 0, W, H)
      for (const t of elTwins) t.ctx.clearRect(0, 0, t.cv.width, t.cv.height)
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
      else if (parts.length) fctx?.clearRect(0, 0, W, H)
      if (strandsOn > 0.02) drawStrands(t)
      brushStep(dt)
    }
    if (alive) raf = requestAnimationFrame(frame)
  }
  // with motion off nothing draws per frame (scroll still places the stage), so no loop runs
  if (!RM) raf = requestAnimationFrame(frame)

  return () => {
    alive = false
    cancelAnimationFrame(raf)
    clearTimeout(twinTimer)
    offs.forEach((f) => f())
    crowAnim?.revert?.()
    ringsSvg?.replaceChildren()
    crowsSvg?.replaceChildren()
    ink?.canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext()
    document.documentElement.classList.remove("brush")
    cur.remove()
    for (const t of elTwins) t.cv.remove()
    if (note) note.hidden = true
  }
}

// the footer's motion switch restarts the page's motion in its new mode
let stop = null
const run = () => {
  stop?.()
  stop = startPage()
}
document.addEventListener("nav", () => {
  run()
  window.addCleanup(() => {
    stop?.()
    stop = null
  })
})
document.addEventListener("motionchange", run)
