import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { ContactBand, Ext, Picture, Sun, href, paint } from "./Portfolio"
// @ts-ignore
import stageScript from "./scripts/stage.inline"

// The home hub (design: build_final10.py, home()): hero, proof strip, recognition, the four branch
// cards, posts and contact. Its copy is content/index.md's front matter (`home:`); a section whose
// data is empty does not render. Styles: styles/vangogh/_portfolio.scss.

type Link = { href?: string }
type Proof = Link & { initials: string; label: string; title: string; why: string; meta: string }
type Award = Link & {
  initials: string
  issuer: string
  title: string
  cite: string
  text: string
  photo: string
  alt: string
}
type Branch = { title: string; text: string; go: string; to: string; art: string }
type Post = Link & { network: string; date: string; text: string; art: string }
export type HomeData = {
  headline?: string
  lede?: string
  role?: string
  chip?: Link & { before: string; strong: string; after: string }
  brush?: string
  proof?: Proof[]
  recommendation?: Link & { quote: string; name: string; role: string; photo?: string }
  awards?: { heading: string; lede: string; list?: Award[] }
  branches?: { heading: string; list?: Branch[] }
  posts?: { heading: string; lede: string; all: string; allHref?: string; list?: Post[] }
}

// `code` spans in front matter text
const code = (text: string) =>
  text.split("`").map((part, i) => (i % 2 ? <span class="mono">{part}</span> : part))

// plates that have a red/violet twin take the ink (D11); the others are left as they are
const TWINS = new Set(["eye", "sky", "field", "almond"])

export const Recommendation = ({
  r,
  photoSrc,
}: {
  r: NonNullable<HomeData["recommendation"]>
  photoSrc?: string
}) => (
  <div class="person">
    {photoSrc && <img class="pphoto" src={photoSrc} alt={r.name} width={44} height={44} />}
    <div>
      <b>{r.name}</b>
      <span>{r.role}</span>
    </div>
  </div>
)

export default (() => {
  const PortfolioHome: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const fd = fileData
    const h = (fd.frontmatter?.home ?? {}) as HomeData
    const rec = h.recommendation
    const posts = h.posts?.list ?? []
    return (
      <div class="pf pf-home">
        <section class="hero" aria-labelledby="hero-h">
          <div class="hero-art" data-twin="eye" data-pos="50% 50%">
            <Picture
              fd={fd}
              name="eye"
              portrait="eye-portrait"
              alt="A Van Gogh-style painting of a woman's eye, its iris swirling like a starry night"
              fetchpriority="high"
              decoding="async"
              width={1376}
              height={768}
            />
          </div>
          <div class="scrim"></div>
          <div class="copy">
            <h1 id="hero-h">{h.headline}</h1>
            <p class="tag lede">{h.lede}</p>
            <p class="tag">{h.role}</p>
            {h.chip && (
              <a class="chip" href={h.chip.href} rel="noopener">
                <span aria-hidden="true">◆&nbsp;&nbsp;</span>
                {h.chip.before} <b>{h.chip.strong}</b>
                {h.chip.after}
              </a>
            )}
            <div class="row">
              <a class="btn" href="#contact">
                Get in touch
              </a>
              <a class="btn ghost" href={href(fd, "shipped")}>
                See what I've shipped <span aria-hidden="true">→</span>
              </a>
            </div>
            {h.brush && (
              <p class="brush-note" hidden>
                {h.brush}
              </p>
            )}
          </div>
        </section>

        <section class="proof" aria-label="Proof">
          <div class="proofbar">
            {(h.proof ?? []).map((p) => (
              <article class="card">
                <div class="repo">
                  <div class="logo" aria-hidden="true">
                    {p.initials}
                  </div>
                  <div class="k">{p.label}</div>
                </div>
                <h2>
                  <Ext to={p.href} class="link title">
                    {p.title}
                  </Ext>
                </h2>
                <p class="why">{code(p.why)}</p>
                <p class="mono">{p.meta}</p>
              </article>
            ))}
            {rec && (
              <figure class="card rec">
                <div class="k">Recommendation</div>
                <blockquote class="quote">“{rec.quote}”</blockquote>
                <figcaption>
                  <Recommendation r={rec} photoSrc={rec.photo} />
                </figcaption>
                <Ext to={rec.href}>Read it on LinkedIn</Ext>
              </figure>
            )}
          </div>
        </section>

        <div class="sunlit">
          <Sun />
          {h.awards && (
            <section aria-labelledby="awards-h">
              <div class="sec first">
                <h2 id="awards-h">{h.awards.heading}</h2>
                <p class="lede">{h.awards.lede}</p>
              </div>
              <div class="awards">
                {(h.awards.list ?? []).map((a) => (
                  <article class="card award">
                    <div class="frame" style={paint(fd, "sunflowers")}>
                      <Picture fd={fd} name={a.photo} alt={a.alt} loading="lazy" />
                    </div>
                    <div class="body">
                      <div class="issuer">
                        <div class="logo" aria-hidden="true">
                          {a.initials}
                        </div>
                        <span class="k">{a.issuer}</span>
                      </div>
                      <h3>{a.title}</h3>
                      <p class="cite">{a.cite}</p>
                      <p class="desc">{a.text}</p>
                      <Ext to={a.href}>View on LinkedIn</Ext>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {h.branches && (
            <section aria-labelledby="branches-h">
              <div class="sec">
                <h2 id="branches-h">{h.branches.heading}</h2>
              </div>
              <ul class="grid g4 branches">
                {(h.branches.list ?? []).map((b) => (
                  <li>
                    <a class="card branch painted" href={href(fd, b.to)}>
                      <div
                        class="art"
                        style={paint(fd, b.art)}
                        data-twin={TWINS.has(b.art) ? b.art : undefined}
                        data-pos="50% 50%"
                      ></div>
                      <div class="body">
                        <h3>{b.title}</h3>
                        <p>{b.text}</p>
                        <span class="go">
                          {b.go} <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {posts.length > 0 && h.posts && (
            <section aria-labelledby="posts-h">
              <div class="sec">
                <h2 id="posts-h">{h.posts.heading}</h2>
                <p class="lede">
                  {h.posts.lede} <Ext to={h.posts.allHref}>{h.posts.all}</Ext>
                </p>
              </div>
              <div class="grid g3">
                {posts.map((p, i) => (
                  <article class={i ? "card post extra" : "card post"}>
                    <div class="src">
                      <span class="net">{p.network}</span>
                      <span class="mono">{p.date}</span>
                    </div>
                    <p>{p.text}</p>
                    <div class="thumb" style={paint(fd, p.art)}></div>
                    <Ext to={p.href}>View on {p.network}</Ext>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <ContactBand fd={fd} allFiles={allFiles} full />
      </div>
    )
  }
  PortfolioHome.afterDOMLoaded = stageScript
  return PortfolioHome
}) satisfies QuartzComponentConstructor
