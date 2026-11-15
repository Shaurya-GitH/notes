import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzComponent, QuartzComponentProps } from "./quartz/components/types"
import { isPortfolio } from "./quartz/components/Portfolio"

// Portfolio pages (front matter `layout: portfolio` or `case-study`: home, Journey, Shipped, How I
// work, case studies) get the top nav and footer and no sidebars; note pages keep theirs.
type When = (page: QuartzComponentProps) => boolean
const portfolio: When = (page) => isPortfolio(page.fileData)
const only = (condition: When) => (component: QuartzComponent) =>
  Component.ConditionalRender({ component, condition })
const onPortfolio = only(portfolio)
const onSlug = (slug: string) => only((page) => page.fileData.slug === slug)
// the old home page's scroll story (replaced by the home hub next)
const onHome = onSlug("index")
const offPortfolio = only((page) => !portfolio(page) && page.fileData.slug !== "index")
const offPortfolioSides = only((page) => !portfolio(page))

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.SmoothScroll(),
    onHome(Component.HomeSpiral()),
    onHome(Component.HomeStage()),
    onSlug("notes")(Component.NotesIndex()),
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
    onHome(Component.HomeBeats()),
    offPortfolio(Component.Breadcrumbs()),
    offPortfolio(Component.ArticleTitle()),
    offPortfolio(Component.ContentMeta()),
    offPortfolio(Component.TagList()),
  ],
  left: [
    offPortfolioSides(Component.PageTitle()),
    offPortfolioSides(Component.MobileOnly(Component.Spacer())),
    offPortfolioSides(
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
    offPortfolioSides(Component.Explorer()),
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
    Component.Explorer(),
  ],
  right: [],
}
