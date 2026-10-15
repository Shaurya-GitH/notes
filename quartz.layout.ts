import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { QuartzComponent } from "./quartz/components/types"

const isHome = (page: { fileData: { slug?: string } }) => page.fileData.slug === "index"
const notHome = (page: { fileData: { slug?: string } }) => !isHome(page)
// home-only and note-only versions of a component
const onHome = (component: QuartzComponent) =>
  Component.ConditionalRender({ component, condition: isHome })
const offHome = (component: QuartzComponent) =>
  Component.ConditionalRender({ component, condition: notHome })

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  // the home page's spiral and painted stage (Home.tsx) render after its note
  afterBody: [
    Component.SmoothScroll(),
    onHome(Component.HomeSpiral()),
    onHome(Component.HomeStage()),
  ],
  footer: Component.Footer({
    text: "Designed and Developed by Shaurya Mehta. Built with Quartz.",
    links: {
      GitHub: "https://github.com/Shaurya-GitH",
      Home: "https://shaurya-gith.github.io/notes/",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    // the home page opens with its scroll story instead of a title block
    onHome(Component.HomeBeats()),
    offHome(Component.Breadcrumbs()),
    offHome(Component.ArticleTitle()),
    offHome(Component.ContentMeta()),
    offHome(Component.TagList()),
  ],
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
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    offHome(Component.RailSummary()),
    offHome(Component.Graph()),
    offHome(Component.DesktopOnly(Component.TableOfContents())),
    offHome(Component.Backlinks()),
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
