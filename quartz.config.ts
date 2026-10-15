import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Notes",
    pageTitleSuffix: " · Notes",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "shaurya-gith.github.io/notes",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      // fonts load through Plugin.VanGoghFonts (the opsz axes cannot be expressed here); these names
      // are still real Google families because CustomOgImages downloads them by name
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "Fraunces",
        body: "Source Serif 4",
        code: "JetBrains Mono",
      },
      // Starry Notes palette: light is "Almond Blossom" paper, dark is "The Starry Night"
      colors: {
        lightMode: {
          light: "#f3ecd9",
          lightgray: "#d8cdb0",
          gray: "#5d6b4f",
          darkgray: "#2a3448",
          dark: "#1b2a41",
          secondary: "#1f4e8c",
          tertiary: "#85590c",
          highlight: "rgba(31, 78, 140, 0.08)",
          textHighlight: "rgba(232, 192, 106, 0.5)",
        },
        darkMode: {
          light: "#041833",
          lightgray: "#165773",
          gray: "#8a9f85",
          darkgray: "#d6cfb6",
          dark: "#ece3c8",
          secondary: "#e8c06a",
          tertiary: "#6fb3bd",
          highlight: "rgba(111, 179, 189, 0.12)",
          textHighlight: "rgba(232, 192, 106, 0.3)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.VanGoghFonts(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
