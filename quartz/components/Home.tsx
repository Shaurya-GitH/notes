import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, pathToRoot, resolveRelative } from "../util/path"
// @ts-ignore
import homeScript from "./scripts/home.inline"

// The home page's scroll story (design/prototype/starry-notes.html), as three home-only pieces:
// the beats above the note, the spiral of folders below it, and the painted stage behind both.
// Their styles are styles/vangogh/_home.scss; the motion is scripts/home.inline.ts.

type HomeCopy = { headline?: string; tagline?: string; quote?: string; label?: string }

export const HomeBeats = (() => {
  const HomeBeats: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const fm = fileData.frontmatter
    const home = (fm?.home ?? {}) as HomeCopy
    return (
      <div class="home-beats">
        <a class="skip" href="#who-i-am">
          Skip intro
        </a>
        <section class="beat" id="beat-eye" aria-label="Introduction">
          <div class="panel intro">
            <div class="tag">{fm?.title}</div>
            <h1>{home.headline}</h1>
            <p>{home.tagline}</p>
            <div class="actions">
              <a href="#beat-iris">Scroll to enter</a>
            </div>
          </div>
        </section>
        <section class="beat" id="beat-iris" aria-label="Philosophy">
          <div class="sticky">
            <p class="quote">“{home.quote}”</p>
          </div>
        </section>
        <section class="beat" id="beat-world" aria-label="Who I am">
          <div class="sticky">
            <div class="panel label">
              <div class="tag" style="color: var(--chrome)">
                Who I am
              </div>
              <h2>{home.label}</h2>
            </div>
          </div>
        </section>
      </div>
    )
  }
  return HomeBeats
}) satisfies QuartzComponentConstructor

// which painting each folder's card shows, and where the crop sits (from the design)
const ART: Record<string, [string, string]> = {
  "Artificial intelligence": ["eye", "60% 60%"],
  "CI CD": ["sky", "30% 40%"],
  "Code Design": ["field", "40% 60%"],
  Docker: ["sky", "85% 20%"],
  Kubernetes: ["field", "75% 30%"],
  Networks: ["eye", "20% 30%"],
  Security: ["sky", "55% 70%"],
  Spring: ["almond", "85% 25%"],
  "System Design": ["field", "15% 70%"],
}
const FALLBACK: [string, string][] = [
  ["sky", "50% 50%"],
  ["field", "50% 60%"],
  ["eye", "50% 50%"],
]
const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"]

export const HomeSpiral = (() => {
  const HomeSpiral: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    // top-level folders and how many notes each holds
    const folders = new Map<string, { slug: string; count: number }>()
    for (const f of allFiles) {
      const parts = (f.relativePath ?? "").split("/")
      if (parts.length < 2 || !f.slug) continue
      const name = parts[0]
      const entry = folders.get(name) ?? { slug: f.slug.split("/")[0], count: 0 }
      entry.count++
      folders.set(name, entry)
    }
    const list = [...folders.entries()].sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    )
    const n = list.length
    return (
      <section class="beat" id="spiral" aria-labelledby="spiral-h">
        <div class="sticky">
          <div class="wipe"></div>
          <div class="spiral-head">
            <div class="tag" style="color: var(--chrome)">
              The notes
            </div>
            <h2 id="spiral-h">{WORDS[n] ?? n} folders, one spiral.</h2>
            <p>
              Scroll turns the spiral. The explorer on the left is the list view of the same thing.
            </p>
          </div>
          <div class="helix">
            <ul id="cards">
              {list.map(([name, { slug, count }], i) => {
                const [art, pos] = ART[name] ?? FALLBACK[i % FALLBACK.length]
                return (
                  <li>
                    <a
                      class="card"
                      href={resolveRelative(fileData.slug!, (slug + "/index") as FullSlug)}
                      data-art={art}
                      data-pos={pos}
                    >
                      <span>
                        <strong>{name}</strong>
                        <em>{count} notes</em>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
          <div class="mode">spiral · list in explorer</div>
        </div>
      </section>
    )
  }
  return HomeSpiral
}) satisfies QuartzComponentConstructor

export const HomeStage = (() => {
  const HomeStage: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const img = (n: string) => `${pathToRoot(fileData.slug!)}/static/vg/${n}.jpg`
    return (
      <div class="home-stage">
        <div class="stage" aria-hidden="true">
          <div class="layer" id="eye">
            <img src={img("eye")} alt="" />
            <div id="iris"></div>
          </div>
          <svg id="rings" viewBox="-500 -500 1000 1000" preserveAspectRatio="none"></svg>
          <div class="layer" id="sky">
            <img src={img("sky")} alt="" />
          </div>
          <div class="layer" id="field">
            <img src={img("field")} alt="" />
          </div>
          <div class="layer" id="sky2">
            <img src={img("sky")} alt="" />
          </div>
          <canvas class="paint" id="flow"></canvas>
          <canvas class="paint" id="strands"></canvas>
          <svg id="crows" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice"></svg>
          <canvas class="paint" id="reveal"></canvas>
          <div class="layer" id="scrim"></div>
          <div class="grain"></div>
        </div>
        <div class="cursor" id="cursor" aria-hidden="true">
          <div class="halo">
            <i></i>
          </div>
          <div class="core"></div>
        </div>
      </div>
    )
  }
  HomeStage.afterDOMLoaded = homeScript
  return HomeStage
}) satisfies QuartzComponentConstructor
