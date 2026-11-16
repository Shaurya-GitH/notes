import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { ContactBand, Ext, Sun, href, shippedMedia } from "./Portfolio"
import { pathToRoot } from "../util/path"
// @ts-ignore
import galleryScript from "./scripts/gallery.inline"

// The case-study layout (design: build_final10.py, detail()), for any page with front matter
// `layout: case-study`; the template is content/shipped/case-study-template.md. The head (crumb,
// outcome title, lead, TL;DR) renders before the page's markdown, which is the problem section; the
// demo videos, gallery, decisions, diagram, results, regrets, links and closing band render after
// it. Every field is optional: only what the front matter has renders. Media paths are under
// quartz/static/shipped/ (docs/adding-project-media.md). Styles: styles/vangogh/_portfolio.scss;
// lightbox: scripts/gallery.inline.ts.

export type Picture = { src: string; alt: string; caption?: string }
type Video = { src: string; poster?: string; captions?: string; title: string; duration?: string }

type CaseStudyData = {
  title?: string
  cover?: Picture
  gallery?: Picture[]
  video?: Video[]
  kind?: string
  period?: string
  outcome?: string
  lead?: string
  tldr?: { part?: string; team?: string; when?: string; stack?: string; result?: string }
  problem?: string
  decisions?: { chose: string; rejected: string; because: string }[]
  diagram?: { src: string; alt: string; text: string; width?: number; height?: number }
  results?: { n: string; basis: string }[]
  differently?: string
  links?: { text: string; href: string }[]
  mediaFirst?: boolean
  galleryTitle?: string
}

const TLDR: [keyof NonNullable<CaseStudyData["tldr"]>, string][] = [
  ["part", "My part"],
  ["team", "Team"],
  ["when", "When"],
  ["stack", "Stack"],
  ["result", "Result"],
]

// the demo videos and the gallery: after the write-up, or straight after the title when the page
// sets `mediaFirst: true` (show it, then explain it)
const Media = ({
  fileData,
  c,
}: {
  fileData: QuartzComponentProps["fileData"]
  c: CaseStudyData
}) => {
  const videos = (c.video ?? []).filter(
    (v) => typeof v?.src === "string" && v.src.trim().length > 0,
  )
  const gallery = (c.gallery ?? []).filter(
    (g) => typeof g?.src === "string" && g.src.trim().length > 0,
  )
  return (
    <>
      {videos.length > 0 && (
        <section aria-labelledby="demo-h">
          <h2 id="demo-h">Demo</h2>
          {videos.map((v) => (
            // never autoplays or loops; turning motion off pauses it (gallery.inline.ts)
            <figure class="video">
              <video
                controls
                preload="none"
                playsinline
                aria-label={v.title}
                poster={v.poster && shippedMedia(fileData, v.poster)}
                width={1920}
                height={1080}
              >
                <source src={shippedMedia(fileData, v.src)} type="video/mp4" />
                {v.captions && (
                  <track
                    kind="captions"
                    src={shippedMedia(fileData, v.captions)}
                    srclang="en"
                    label="English"
                    default
                  />
                )}
              </video>
              <figcaption>
                {v.title}
                {v.duration && <span class="mono"> · {v.duration}</span>}
              </figcaption>
            </figure>
          ))}
        </section>
      )}
      {gallery.length > 0 && (
        <section aria-labelledby="gallery-h">
          <h2 id="gallery-h">{c.galleryTitle ?? "Gallery"}</h2>
          <ul class="gallery">
            {gallery.map((g, i) => (
              <li>
                <figure>
                  <button type="button" class="shot" data-i={i} aria-haspopup="dialog">
                    <img
                      src={shippedMedia(fileData, g.src)}
                      alt={g.alt}
                      width={1200}
                      height={800}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                  {g.caption && <figcaption>{g.caption}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
          <dialog class="lightbox" aria-label="Gallery">
            <button type="button" class="close" aria-label="Close">
              ✕
            </button>
            <figure>
              <img alt="" />
              <figcaption></figcaption>
            </figure>
            <p class="count mono" aria-live="polite"></p>
            <button type="button" class="prev" aria-label="Previous image">
              ←
            </button>
            <button type="button" class="next" aria-label="Next image">
              →
            </button>
          </dialog>
        </section>
      )}
    </>
  )
}

export const CaseStudyHead = (() => {
  const CaseStudyHead: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const c = (fileData.frontmatter ?? {}) as CaseStudyData
    const tldr = TLDR.filter(([key]) => c.tldr?.[key])
    return (
      <div class="pf pf-case sunlit">
        <Sun />
        <p class="crumb mono">
          <a href={href(fileData, "shipped")}>Shipped</a> / {c.title}
        </p>
        <div class="head">
          <p class="k">{["Case study", c.kind, c.period].filter(Boolean).join(" · ")}</p>
          <h1>{c.outcome ?? c.title}</h1>
          {c.lead && <p class="lead">{c.lead}</p>}
        </div>
        {c.mediaFirst && (
          <div class="article">
            <Media fileData={fileData} c={c} />
          </div>
        )}
        {typeof c.cover?.src === "string" && c.cover.src.trim().length > 0 && (
          <figure class="hero-media">
            <img
              src={shippedMedia(fileData, c.cover.src)}
              alt={c.cover.alt}
              width={1600}
              height={900}
            />
          </figure>
        )}
        {tldr.length > 0 && (
          <dl class="tldr">
            {tldr.map(([key, label]) => (
              <div>
                <dt class="k">{label}</dt>
                <dd>{c.tldr?.[key]}</dd>
              </div>
            ))}
          </dl>
        )}
        {c.problem && <h2 class="problem">{c.problem}</h2>}
      </div>
    )
  }
  return CaseStudyHead
}) satisfies QuartzComponentConstructor

export const CaseStudyRest = (() => {
  const CaseStudyRest: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const c = (fileData.frontmatter ?? {}) as CaseStudyData
    // the diagram: a URL, or a path from the site root (static/portfolio/...)
    const src = (s: string) => (/^https?:/.test(s) ? s : `${pathToRoot(fileData.slug!)}/${s}`)
    return (
      <div class="pf pf-case">
        <div class="article">
          {!c.mediaFirst && <Media fileData={fileData} c={c} />}
          {c.decisions && c.decisions.length > 0 && (
            <section aria-labelledby="decisions-h">
              <h2 id="decisions-h">Decisions</h2>
              {c.decisions.map((d) => (
                <div class="dec">
                  <b>{d.chose}</b>
                  <p class="rej">
                    Rejected: {d.rejected}, because {d.because}.
                  </p>
                </div>
              ))}
            </section>
          )}
          {c.diagram && (
            <figure class="side">
              <figcaption>{c.diagram.text}</figcaption>
              <img
                src={src(c.diagram.src)}
                alt={c.diagram.alt}
                width={c.diagram.width}
                height={c.diagram.height}
                loading="lazy"
              />
            </figure>
          )}
          {c.results && c.results.length > 0 && (
            <section aria-labelledby="results-h">
              <h2 id="results-h">Results</h2>
              <ul class="stats">
                {c.results.map((r) => (
                  <li class="stat">
                    <span class="n">{r.n}</span>
                    <span class="mono">{r.basis}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {c.differently && (
            <section aria-labelledby="differently-h">
              <h2 id="differently-h">What I'd do differently</h2>
              <p>{c.differently}</p>
            </section>
          )}
          {c.links && c.links.length > 0 && (
            <section aria-labelledby="links-h">
              <h2 id="links-h">Links</h2>
              <p class="links">
                {c.links.map((l) =>
                  /^https?:/.test(l.href) ? (
                    <Ext to={l.href}>{l.text}</Ext>
                  ) : (
                    <a class="link" href={href(fileData, l.href)}>
                      {l.text}
                    </a>
                  ),
                )}
              </p>
            </section>
          )}
        </div>
        <ContactBand fd={fileData} allFiles={allFiles} />
      </div>
    )
  }
  CaseStudyRest.afterDOMLoaded = galleryScript
  return CaseStudyRest
}) satisfies QuartzComponentConstructor
