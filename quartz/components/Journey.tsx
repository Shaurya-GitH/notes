import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { pathToRoot } from "../util/path"
import { Ext, Picture, Sun, asset, href, paint } from "./Portfolio"
import { HomeData, Recommendation } from "./PortfolioHome"
// @ts-ignore
import stageScript from "./scripts/stage.inline"

// The Journey page (design: build_final10.py, journey()). The eye → iris → sky → field scroll story
// (once the home page's, design/prototype/starry-notes.html) is its intro and ends on the page's
// title; then the four stops, the recommendation band and the Shipped band. Copy is
// content/journey.md's front matter. Styles: styles/vangogh/_journey.scss; motion:
// scripts/stage.inline.ts.

type Stop = {
  id: string
  rail: string
  company: string
  logo: string
  art: string
  dates: string
  aka?: string
  role: string
  items: { lead: string; text: string }[]
}
type JourneyData = {
  headline?: string
  tagline?: string
  stops?: Stop[]
  quote?: { label: string; text: string; link: string }
  next?: { heading: string; text: string; link: string }
}

// company marks: the wordmarks that need a ground sit on a tile, as in the design
const LOGOS: Record<string, { file: string; alt: string; tile?: boolean }> = {
  taction: { file: "logo-taction.jpg", alt: "Taction logo", tile: true },
  sbs: { file: "logo-sbs.svg", alt: "SBS logo" },
  forreal: { file: "logo-forreal.png", alt: "For Real logo", tile: true },
  tph: { file: "logo-tph.svg", alt: "The Product Highway logo" },
}
const Logo = ({ fd, name }: { fd: QuartzPluginData; name: string }) => {
  const l = LOGOS[name]
  const [file, ext] = l.file.split(".")
  return (
    <span
      class={`clogo ${name}${l.tile ? " tile" : ""}`}
      role="img"
      aria-label={l.alt}
      style={`background-image:url("${asset(fd, file, ext)}")`}
    ></span>
  )
}

// plates that have a red/violet twin take the ink (D11); the new plates have none yet
const TWINS = new Set(["eye", "sky", "field", "almond"])

export default (() => {
  const Journey: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const fd = fileData
    const j = (fd.frontmatter?.journey ?? {}) as JourneyData
    const stops = j.stops ?? []
    const rec = (allFiles.find((f) => f.slug === "index")?.frontmatter?.home as HomeData)
      ?.recommendation
    // the stage plates are the original JPEGs, which the ink's twins are pinned to
    const img = (n: string) => `${pathToRoot(fd.slug!)}/static/vg/${n}.jpg`
    return (
      <div class="pf pf-journey">
        {/* the scroll story: two beats of pure motion, then the title over the field */}
        <section class="beat transit" id="beat-eye" aria-hidden="true">
          <p class="mono cue">Scroll ↓</p>
        </section>
        <section class="beat transit" id="beat-iris" aria-hidden="true"></section>
        <section class="beat" id="beat-world" aria-labelledby="journey-h">
          <div class="sticky">
            <div class="copy">
              <h1 id="journey-h">{j.headline}</h1>
              <p class="tag">{j.tagline}</p>
              <div class="row logos">
                {stops.map((s) => (
                  <Logo fd={fd} name={s.logo} />
                ))}
              </div>
              <p class="mono">Scroll ↓</p>
            </div>
          </div>
        </section>

        <div id="stops" tabindex={-1}>
          {stops.map((s, i) => (
            <section class={`stop ${s.art}`} id={s.id} aria-labelledby={`${s.id}-h`}>
              <div
                class="art"
                style={paint(fd, s.art, "50% 50%")}
                data-twin={TWINS.has(s.art) ? s.art : undefined}
                data-pos="50% 50%"
              ></div>
              <div class="scrim"></div>
              <nav class="rail" aria-label="Journey stops">
                <ol>
                  {stops.map((t) => (
                    <li>
                      <a href={`#${t.id}`} aria-current={t.id === s.id ? "step" : undefined}>
                        {t.rail}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <article class="panel">
                <div class="row head">
                  <p class="k">
                    Stop {i + 1} · {s.dates}
                  </p>
                  <Logo fd={fd} name={s.logo} />
                </div>
                <h2 id={`${s.id}-h`}>{s.company}</h2>
                {s.aka && <p class="mono aka">{s.aka}</p>}
                <p class="role">{s.role}</p>
                <ul>
                  {s.items.map((it) => (
                    <li>
                      <b>{it.lead}</b> {it.text}
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          ))}
        </div>

        {j.quote && rec && (
          <figure class="bigq">
            <div
              class="art"
              style={paint(fd, "almond", "92% 8%")}
              data-twin="almond"
              data-pos="92% 8%"
              data-size="240%"
            ></div>
            <div class="scrim"></div>
            <div class="in">
              <p class="k">{j.quote.label}</p>
              <blockquote class="quote">“{j.quote.text}”</blockquote>
              <figcaption>
                <Recommendation r={rec} photoSrc={rec.photo} />
              </figcaption>
              <Ext to={rec.href}>{j.quote.link}</Ext>
            </div>
          </figure>
        )}

        {j.next && (
          <section class="sunlit next" aria-labelledby="next-h">
            <Sun />
            <div class="sec">
              <h2 id="next-h">{j.next.heading}</h2>
              <p class="lede">
                {j.next.text}{" "}
                <a class="link" href={href(fd, "shipped")}>
                  {j.next.link} <span aria-hidden="true">→</span>
                </a>
              </p>
            </div>
          </section>
        )}

        {/* the painted stage behind the story; decoration, so hidden from assistive technology */}
        <div class="pf-stage" aria-hidden="true">
          <div class="layer" id="eye">
            <img src={img("eye")} alt="" />
            <div id="iris"></div>
          </div>
          <svg id="rings" viewBox="-500 -500 1000 1000" preserveAspectRatio="none"></svg>
          <div class="layer" id="sky">
            <img src={img("sky")} alt="" />
          </div>
          <div class="layer" id="field">
            <Picture fd={fd} name="field" portrait="field-portrait" alt="" />
          </div>
          <canvas class="paint" id="flow"></canvas>
          <canvas class="paint" id="strands"></canvas>
          <svg id="crows" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice"></svg>
          <canvas class="paint" id="reveal"></canvas>
          <div class="layer" id="scrim"></div>
          <div class="grain"></div>
        </div>
      </div>
    )
  }
  Journey.afterDOMLoaded = stageScript
  return Journey
}) satisfies QuartzComponentConstructor
