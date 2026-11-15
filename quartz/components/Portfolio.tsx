import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, pathToRoot, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { JSX } from "preact"
// @ts-ignore
import motionScript from "./scripts/motion.inline"
// @ts-ignore
import portfolioScript from "./scripts/portfolio.inline"

// The portfolio's shared pieces (design: kb-evidence design/2026-11/portfolio-final-mockups,
// build_final10.py): the top nav, the footer with its motion switch, the contact band and the
// sunlit layer. Styles: styles/vangogh/_portfolio.scss. Copy is the design's, verbatim.

// home, Journey, Shipped, How I work (front matter `layout: portfolio`) and case studies
// (`layout: case-study`); every other page is a note page
export const isPortfolio = (fd: QuartzPluginData) =>
  ["portfolio", "case-study"].includes(String(fd.frontmatter?.layout))

export const isCaseStudy = (fd: QuartzPluginData) => fd.frontmatter?.layout === "case-study"

// a link to another page of the site, relative to this one
export const href = (fd: QuartzPluginData, to: string) => resolveRelative(fd.slug!, to as FullSlug)

const root = (fd: QuartzPluginData) => pathToRoot(fd.slug!)

// the paintings the redesign added (and the eye) also come as WebP; the original plates are JPEG only
const WEBP = new Set([
  "city",
  "market",
  "harbour",
  "studio",
  "sunflowers",
  "eye",
  "eye-portrait",
  "field-portrait",
  "kalam-photo",
  "spot-photo",
])
export const asset = (fd: QuartzPluginData, name: string, ext = "jpg") =>
  `${root(fd)}/static/${WEBP.has(name) || name.startsWith("logo-") ? "portfolio" : "vg"}/${name}.${ext}`

// a painting as a CSS background (the paintings frame content, so they carry no alt text of their own)
export const paint = (fd: QuartzPluginData, name: string, pos = "50% 50%") => {
  const jpg = `url("${asset(fd, name)}")`
  const set = WEBP.has(name)
    ? `;background-image:image-set(url("${asset(fd, name, "webp")}") type("image/webp"), ${jpg} type("image/jpeg"))`
    : ""
  return `background-image:${jpg}${set};background-position:${pos}`
}

// an image with a WebP source when there is one
export const Picture = ({
  fd,
  name,
  alt,
  portrait,
  ...img
}: {
  fd: QuartzPluginData
  name: string
  alt: string
  portrait?: string
} & JSX.HTMLAttributes<HTMLImageElement>) => (
  <picture>
    {portrait && (
      <source media="(max-width: 800px)" srcset={asset(fd, portrait, "webp")} type="image/webp" />
    )}
    {portrait && <source media="(max-width: 800px)" srcset={asset(fd, portrait)} />}
    {WEBP.has(name) && <source srcset={asset(fd, name, "webp")} type="image/webp" />}
    <img src={asset(fd, name)} alt={alt} {...img} />
  </picture>
)

// a link that leaves the site; the arrow is the design's mark for it
export const Ext = ({
  to,
  children,
  class: cls = "link",
}: {
  to?: string
  children: preact.ComponentChildren
  class?: string
}) =>
  to ? (
    <a class={cls} href={to} rel="noopener">
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  ) : null

// the sunlit tier: the note pages' window light, branch shadow and petals, scoped to one section
export const Sun = () => (
  <div class="pf-sun" aria-hidden="true">
    <i></i>
    <i></i>
    <i></i>
    <i></i>
  </div>
)

const PAGES: [string, string][] = [
  ["Journey", "journey"],
  ["Shipped", "shipped"],
  ["How I work", "how-i-work"],
  ["Notes", "notes"],
]

export const PortfolioNav = (() => {
  const PortfolioNav: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
    // case studies belong to Shipped
    const here = isCaseStudy(fileData) ? "shipped" : fileData.slug
    const links = PAGES.map(([name, slug]) => (
      <a href={href(fileData, slug)} aria-current={slug === here ? "page" : undefined}>
        {name}
      </a>
    ))
    return (
      <header class="pf-nav">
        <a class="brand" href={href(fileData, "index")}>
          {cfg.pageTitle}
        </a>
        <nav aria-label="Main">
          <div class="links">{links}</div>
          <a class="btn" href={href(fileData, "index") + "#contact"}>
            Get in touch
          </a>
          <details class="menu">
            <summary aria-label="Menu">
              <span class="burger"></span>
            </summary>
            <div class="sheet">{links}</div>
          </details>
        </nav>
      </header>
    )
  }
  return PortfolioNav
}) satisfies QuartzComponentConstructor

type Contact = { heading?: string; text?: string; email?: string }

// "Hiring, or building an AI agent?": the home page's contact section (with its line) and the
// closing band of Shipped and case studies (heading only). The email actions show only once the
// owner has set `home.contact.email` in content/index.md.
export const ContactBand = ({
  fd,
  allFiles,
  full,
}: {
  fd: QuartzPluginData
  allFiles: QuartzPluginData[]
  full?: boolean
}) => {
  const home = allFiles.find((f) => f.slug === "index")?.frontmatter?.home as
    | { contact?: Contact }
    | undefined
  const c = home?.contact ?? {}
  return (
    <section
      class={full ? "pf-contact" : "pf-contact closing"}
      id={full ? "contact" : undefined}
      style={paint(fd, "sky-alt")}
      aria-labelledby={full ? "contact-h" : undefined}
    >
      <div class="in">
        <h2 id={full ? "contact-h" : undefined}>{c.heading}</h2>
        {full && c.text && <p>{c.text}</p>}
        {c.email && (
          <div class="row">
            <a class="btn" href={`mailto:${c.email}`}>
              Email me
            </a>
            {full && (
              <span class="email">
                <span>{c.email}</span>
                <button type="button" class="cp" data-copy={c.email}>
                  Copy email
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// footer links take their names from the profile hosts, in the design's order
const SOCIAL: [string, string][] = [
  ["github.com", "GitHub"],
  ["linkedin.com", "LinkedIn"],
  ["x.com", "X"],
  ["leetcode.com", "LeetCode"],
]

const PortfolioFooterView = ({ allFiles }: QuartzComponentProps) => {
  const person = allFiles.find((f) => f.slug === "index")?.frontmatter?.person as
    | { sameAs?: string[] }
    | undefined
  const urls = person?.sameAs ?? []
  const links = SOCIAL.flatMap(([host, name]) => {
    const url = urls.find((u) => new URL(u).hostname.replace(/^www\./, "") === host)
    return url ? [[name, url]] : []
  })
  return (
    <footer class="pf-foot">
      <p>Designed and built by Shaurya Mehta with Quartz</p>
      <button type="button" class="toggle" role="switch" aria-checked="true">
        Motion: <span class="on">on</span>
        <span class="off">off</span> <span class="sw" aria-hidden="true"></span>
      </button>
      <ul>
        {links.map(([name, url]) => (
          <li>
            <a href={url} rel="noopener">
              {name}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

// the portfolio footer on portfolio pages, the notes' own footer everywhere else
export const SiteFooter = ((notes: QuartzComponent) => {
  const Notes = notes
  const SiteFooter: QuartzComponent = (props: QuartzComponentProps) =>
    isPortfolio(props.fileData) ? <PortfolioFooterView {...props} /> : <Notes {...props} />
  SiteFooter.css = notes.css
  // the motion setting is stamped before the page paints, on every page
  SiteFooter.beforeDOMLoaded = motionScript
  SiteFooter.afterDOMLoaded = portfolioScript
  return SiteFooter
}) satisfies QuartzComponentConstructor<QuartzComponent>
