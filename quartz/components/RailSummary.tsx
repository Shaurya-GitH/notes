import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { simplifySlug } from "../util/path"

// Phones: the right rail folds behind one line, "Connections · n backlinks · m links out"; the
// button opens the graph and backlinks. Hidden at wider widths (styles/vangogh/_responsive.scss).
const script = `
document.addEventListener("nav", () => {
  const button = document.querySelector(".rail-summary")
  const rail = button?.closest(".sidebar.right")
  if (!button || !rail) return
  const toggle = () => {
    const open = rail.classList.toggle("rail-open")
    button.setAttribute("aria-expanded", String(open))
    if (open) document.dispatchEvent(new CustomEvent("railopen"))
  }
  button.addEventListener("click", toggle)
  window.addCleanup(() => button.removeEventListener("click", toggle))
})
`

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

export default (() => {
  const RailSummary: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const slug = simplifySlug(fileData.slug!)
    const backs = allFiles.filter((f) => f.links?.includes(slug)).length
    const outs = fileData.links?.length ?? 0
    return (
      <button type="button" class="rail-summary" aria-expanded="false">
        <span>
          Connections
          <br />
          <small>
            {plural(backs, "backlink")} · {plural(outs, "link")} out
          </small>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    )
  }
  RailSummary.afterDOMLoaded = script
  return RailSummary
}) satisfies QuartzComponentConstructor
