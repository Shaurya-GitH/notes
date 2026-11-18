import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

// The 404 page is one drawing: a starry night in plain black outlines on white paper — sky, moon,
// stars, hills, village, an easel — as if drawn with one black brush in a paint app. The only colour
// is on the easel's canvas, where the same night is painted the way Van Gogh saw it; it thins out
// to bare canvas toward the corner he has not reached. Styles: styles/vangogh/_notfound.scss.
// Plates: scripts/notfound-plates.mjs (PATCH below repeats its numbers; FACE is its canvas face
// taken out to the middle of the black edge).
//
// Every animation runs *from* the unfinished state (keyframes with a `from` only), so turning them
// off (html[data-motion="reduce"], prefers-reduced-motion) leaves the finished picture.
//
// 404.html is served for any missing path, so every URL here must be absolute, as Head.tsx does.

// the drawing is 1376 × 768; the canvas face on its easel, and the patch of colour laid over it
const FACE = "138,286 502,296 535,552 165,573"
const PATCH = { x: 130, y: 278, width: 412, height: 302 }

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  // If baseUrl contains a pathname after the domain, use this as the home link
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname
  const vg = `${baseDir.replace(/\/$/, "")}/static/vg`

  return (
    <article class="nf popover-hint">
      <div class="nf-scene">
        <svg
          viewBox="0 0 1376 768"
          preserveAspectRatio="xMidYMax slice"
          role="presentation"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {/* where the colour is: solid from the moon's corner, thinning toward the far one */}
            <linearGradient
              id="nf-laid"
              gradientUnits="userSpaceOnUse"
              x1="469"
              y1="250"
              x2="150"
              y2="520"
            >
              <stop offset="0" stop-color="#fff" />
              <stop offset="0.66" stop-color="#fff" />
              <stop offset="0.98" stop-color="#000" />
            </linearGradient>
            <linearGradient
              id="nf-wash"
              gradientUnits="userSpaceOnUse"
              x1="469"
              y1="250"
              x2="150"
              y2="520"
            >
              <stop offset="0" stop-color="#fff" />
              <stop offset="0.82" stop-color="#fff" />
              <stop offset="1.12" stop-color="#000" />
            </linearGradient>
            <mask id="nf-colour" maskUnits="userSpaceOnUse" x="0" y="0" width="1376" height="768">
              <polygon points={FACE} fill="url(#nf-laid)" />
            </mask>
            <mask id="nf-seep" maskUnits="userSpaceOnUse" x="0" y="0" width="1376" height="768">
              <polygon points={FACE} fill="url(#nf-wash)" />
            </mask>
          </defs>

          {/* the world: black outlines on white paper */}
          <image href={`${vg}/easel-lines-ink.webp`} x="0" y="0" width="1376" height="768" />

          {/* the canvas: the same night in his colours, as far as he has got */}
          <g class="nf-colour">
            <image
              class="nf-seep"
              href={`${vg}/easel-lines-canvas.webp`}
              mask="url(#nf-seep)"
              {...PATCH}
            />
            <image href={`${vg}/easel-lines-canvas.webp`} mask="url(#nf-colour)" {...PATCH} />
          </g>
        </svg>
      </div>

      <div class="nf-copy">
        <h1 class="nf-code">
          <span class="nf-sr">404</span>
          <svg viewBox="0 0 448 182" aria-hidden="true" focusable="false">
            <path d="M92 12L18 120H130M98 62V170" pathLength={1} style="--d:0.9s" />
            <path
              d="M224 12C266 12 276 58 276 91 276 124 266 170 224 170 182 170 172 124 172 91 172 58 182 12 224 12Z"
              pathLength={1}
              style="--d:1.1s"
            />
            <path d="M392 12L318 120H430M398 62V170" pathLength={1} style="--d:1.3s" />
          </svg>
        </h1>
        <p class="nf-lede">{i18n(cfg.locale).pages.error.notFound}</p>
        <a class="nf-back" href={baseDir}>
          {i18n(cfg.locale).pages.error.home} <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
