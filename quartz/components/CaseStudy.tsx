import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { ContactBand, Ext, Sun, href } from "./Portfolio"
import { pathToRoot } from "../util/path"

// The case-study layout (design: build_final10.py, detail()), for any page with front matter
// `layout: case-study`; the template is content/shipped/case-study-template.md. The head (crumb,
// outcome title, lead, TL;DR) renders before the page's markdown, which is the problem section; the
// decisions, diagram, results, regrets, links and closing band render after it.
// Styles: styles/vangogh/_portfolio.scss.

type CaseStudyData = {
  title?: string
  kind?: string
  period?: string
  outcome?: string
  lead?: string
  tldr?: { part?: string; team?: string; when?: string; stack?: string; result?: string }
  problem?: string
  decisions?: { chose: string; rejected: string; because: string }[]
  diagram?: { src: string; alt: string; text: string }
  results?: { n: string; basis: string }[]
  differently?: string
  links?: { text: string; href: string }[]
}

const TLDR: [keyof NonNullable<CaseStudyData["tldr"]>, string][] = [
  ["part", "My part"],
  ["team", "Team"],
  ["when", "When"],
  ["stack", "Stack"],
  ["result", "Result"],
]

export const CaseStudyHead = (() => {
  const CaseStudyHead: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const c = (fileData.frontmatter ?? {}) as CaseStudyData
    return (
      <div class="pf pf-case sunlit">
        <Sun />
        <p class="crumb mono">
          <a href={href(fileData, "shipped")}>Shipped</a> / {c.title}
        </p>
        <div class="head">
          <p class="k">
            Case study · {c.kind} · {c.period}
          </p>
          <h1>{c.outcome}</h1>
          <p class="lead">{c.lead}</p>
        </div>
        {c.tldr && (
          <dl class="tldr">
            {TLDR.map(([key, label]) => (
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
              <img src={src(c.diagram.src)} alt={c.diagram.alt} loading="lazy" />
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
  return CaseStudyRest
}) satisfies QuartzComponentConstructor
