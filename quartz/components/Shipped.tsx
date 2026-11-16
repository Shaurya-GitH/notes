import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { ContactBand, Ext, Sun, href, paint, shippedMedia } from "./Portfolio"
import type { Picture } from "./CaseStudy"
// @ts-ignore
import shippedScript from "./scripts/shipped.inline"
// @ts-ignore
import stageScript from "./scripts/stage.inline"

// The Shipped page (design: build_final10.py, shipped()): the harbour band, filter chips and one card
// per project, each a painted frame around the artefact it will show. Copy is content/shipped.md's
// front matter. A card shows a real photo inside its painted frame when it has a `cover`, or when
// its project page (`caseStudy`) is built and has one; without either it keeps the painting.
// Styles: styles/vangogh/_portfolio.scss; filters: scripts/shipped.inline.ts.

type Project = {
  kind: string
  art: string
  title: string
  text: string
  metric: string
  basis: string
  link?: { text: string; href?: string }
  caseStudy?: string
  cover?: Picture
}
type ShippedData = { headline?: string; text?: string; filters?: string[]; projects?: Project[] }

// the filter in the URL (?filter=open-source)
export const filterId = (kind: string) => kind.toLowerCase().replaceAll(" ", "-")

// plates that have a red/violet twin take the ink (D11)
const TWINS = new Set(["eye", "sky", "field", "almond"])

export default (() => {
  const Shipped: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const fd = fileData
    const d = (fd.frontmatter?.shipped ?? {}) as ShippedData
    // drafts never build, so a draft project page is not found here and its card stays as it was
    const page = (slug?: string) => (slug ? allFiles.find((f) => f.slug === slug) : undefined)
    return (
      <div class="pf pf-shipped">
        <section class="band" style={paint(fd, "harbour")} aria-labelledby="shipped-h">
          <div class="scrim"></div>
          <div class="copy">
            <h1 id="shipped-h">{d.headline}</h1>
            <p>{d.text}</p>
          </div>
        </section>
        <div class="sunlit">
          <Sun />
          <div class="chips" role="group" aria-label="Filter projects">
            {["All", ...(d.filters ?? [])].map((f) => (
              <button type="button" data-filter={filterId(f)} aria-pressed={f === "All"}>
                {f}
              </button>
            ))}
          </div>
          <ul class="grid g3 projects">
            {(d.projects ?? []).map((p) => {
              const study = page(p.caseStudy)
              const cover = p.cover ?? (study?.frontmatter?.cover as Picture | undefined)
              return (
                <li data-kind={filterId(p.kind)}>
                  <article class="card proj">
                    <div
                      class={cover ? "art framed" : "art"}
                      style={paint(fd, p.art)}
                      data-twin={TWINS.has(p.art) ? p.art : undefined}
                    >
                      {cover && (
                        <img
                          src={shippedMedia(fd, cover.src)}
                          alt={cover.alt}
                          width={800}
                          height={500}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                    <div class="body">
                      <p class="k">{p.kind}</p>
                      <h2>{p.title}</h2>
                      <p>{p.text}</p>
                      <p class="metric">{p.metric}</p>
                      <p class="basis">{p.basis}</p>
                      {study ? (
                        <a class="link" href={href(fd, study.slug!)}>
                          Case study <span aria-hidden="true">→</span>
                        </a>
                      ) : (
                        <Ext to={p.link?.href}>{p.link?.text}</Ext>
                      )}
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>
        <ContactBand fd={fd} allFiles={allFiles} />
      </div>
    )
  }
  Shipped.afterDOMLoaded = [shippedScript, stageScript]
  return Shipped
}) satisfies QuartzComponentConstructor
