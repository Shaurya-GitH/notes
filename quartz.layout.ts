import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzComponent, QuartzComponentProps } from "./quartz/components/types"
import { isCaseStudy, isPortfolio } from "./quartz/components/Portfolio"

// Portfolio pages (front matter `layout: portfolio` or `case-study`: home, Journey, Shipped, How I
// work, case studies) get the top nav and footer and no sidebars; note pages keep theirs.
type When = (page: QuartzComponentProps) => boolean
const portfolio: When = (page) => isPortfolio(page.fileData)
const only = (condition: When) => (component: QuartzComponent) =>
  Component.ConditionalRender({ component, condition })
const onPortfolio = only(portfolio)
const offPortfolio = only((page) => !portfolio(page))
const onSlug = (slug: string) => only((page) => page.fileData.slug === slug)
const onCaseStudy = only((page) => isCaseStudy(page.fileData))

// the notes' explorer lists notes only: the portfolio pages (and case studies, kept in shipped/)
// live in the top nav. Serialised into the page, so it must not use anything from this file.
const explorer = () =>
  Component.Explorer({
    filterFn: (node) =>
      !["tags", "journey", "shipped", "how-i-work", "notes"].includes(node.slugSegment),
  })

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.SmoothScroll(),
    onSlug("notes")(Component.NotesIndex()),
    onCaseStudy(Component.CaseStudyRest()),
    onSlug("how-i-work")(Component.Closing()),
  ],
  footer: Component.SiteFooter(
    Component.Footer({
      text: "Designed and Developed by Shaurya Mehta. Built with Quartz.",
      links: {
        GitHub: "https://github.com/Shaurya-GitH",
        Home: "https://shauryamehta.me/",
      },
    }),
  ),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    onPortfolio(Component.PortfolioNav()),
    onSlug("index")(Component.PortfolioHome()),
    onSlug("journey")(Component.Journey()),
    onSlug("shipped")(Component.Shipped()),
    onCaseStudy(Component.CaseStudyHead()),
    onSlug("how-i-work")(Component.PageHead()),
    offPortfolio(Component.Breadcrumbs()),
    offPortfolio(Component.ArticleTitle()),
    offPortfolio(Component.ContentMeta()),
    offPortfolio(Component.TagList()),
  ],
  left: [
    offPortfolio(Component.PageTitle()),
    offPortfolio(Component.MobileOnly(Component.Spacer())),
    offPortfolio(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
          { Component: Component.Darkmode() },
          { Component: Component.ReaderMode() },
        ],
      }),
    ),
    offPortfolio(explorer()),
  ],
  right: [
    offPortfolio(Component.RailSummary()),
    offPortfolio(Component.Graph()),
    offPortfolio(Component.DesktopOnly(Component.TableOfContents())),
    offPortfolio(Component.Backlinks()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    explorer(),
  ],
  right: [],
}
