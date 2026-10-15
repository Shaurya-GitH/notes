import { QuartzTransformerPlugin } from "../types"

// Quartz's font spec only knows `ital` and `wght`; the Starry Notes design also needs the `opsz`
// axes of Fraunces and Source Serif 4 and the Caveat hand for the home page's margin notes
const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Caveat&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap"

export const VanGoghFonts: QuartzTransformerPlugin = () => ({
  name: "VanGoghFonts",
  externalResources() {
    return { css: [{ content: FONTS_URL }] }
  },
})
