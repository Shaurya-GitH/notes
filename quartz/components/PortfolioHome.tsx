import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { ContactBand, Ext, Picture, Sun, href, paint } from "./Portfolio"
// @ts-ignore
import stageScript from "./scripts/stage.inline"
// @ts-ignore
import postsScript from "./scripts/posts.inline"
import { concatenateResources } from "../util/resources"

// The home hub (design: build_final10.py, home()): hero, proof strip, recognition, the four branch
// cards, the posts slideshow and contact. Its copy is content/index.md's front matter (`home:`); a
// section whose data is empty does not render. Styles: styles/vangogh/_portfolio.scss.

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
type Post = { network: "linkedin" | "x"; url: string; date?: string; about?: string; fit?: string }
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

// a post's official embed: LinkedIn's collapsed post (fits the slide without scrolling) and X's
// dark tweet frame with Do Not Track on; a URL it cannot read keeps the link card only
const NET = { linkedin: "LinkedIn", x: "X" }
const embedSrc = ({ network, url }: Post) => {
  const id = url.match(network === "x" ? /status\/(\d+)/ : /activity:(\d+)/)?.[1]
  if (!id) return undefined
  return network === "x"
    ? `https://platform.twitter.com/embed/Tweet.html?id=${id}&theme=light&dnt=true`
    : `https://www.linkedin.com/embed/feed/update/urn:li:activity:${id}?collapsed=1`
}

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
              <div class="reel">
                <ul class="slides" tabindex={0} aria-label="Posts (arrow keys move between them)">
                  {posts.map((p) => {
                    const net = NET[p.network]
                    return (
                      <li
                        class="slide"
                        data-embed={embedSrc(p)}
                        data-title={`${net} post: ${p.about ?? p.date ?? ""}`}
                        style={p.fit ? `--fit: ${p.fit}` : undefined}
                      >
                        <a class="card fallback" href={p.url} rel="noopener">
                          <span class="k">
                            {net}
                            {p.date && ` · ${p.date}`}
                          </span>
                          {p.about && <span class="about">{p.about}</span>}
                          <span class="link">
                            Read the post on {net}
                            <span aria-hidden="true"> ↗</span>
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
                <div class="ctl">
                  <button class="step prev" type="button" aria-label="Previous post">
                    <span aria-hidden="true">←</span>
                  </button>
                  <p class="count mono" aria-live="polite"></p>
                  <button class="step next" type="button" aria-label="Next post">
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        <ContactBand fd={fd} allFiles={allFiles} full />
      </div>
    )
  }
  PortfolioHome.afterDOMLoaded = concatenateResources(stageScript, postsScript)
  return PortfolioHome
}) satisfies QuartzComponentConstructor
