import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/smoothscroll.inline"

// renders nothing; ships the Lenis smooth-scroll script (scripts/smoothscroll.inline.ts)
export default (() => {
  const SmoothScroll: QuartzComponent = () => null
  SmoothScroll.afterDOMLoaded = script
  return SmoothScroll
}) satisfies QuartzComponentConstructor
