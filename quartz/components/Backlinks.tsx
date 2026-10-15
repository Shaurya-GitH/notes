import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/backlinks.scss"
import { resolveRelative, simplifySlug } from "../util/path"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import OverflowListFactory from "./OverflowList"
import { backlinkContext } from "../util/backlinkContext"

interface BacklinksOptions {
  hideWhenEmpty: boolean
}

const defaultOptions: BacklinksOptions = {
  hideWhenEmpty: true,
}

export default ((opts?: Partial<BacklinksOptions>) => {
  const options: BacklinksOptions = { ...defaultOptions, ...opts }
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory()

  const Backlinks: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const slug = simplifySlug(fileData.slug!)
    const backlinkFiles = allFiles.filter((file) => file.links?.includes(slug))
    if (options.hideWhenEmpty && backlinkFiles.length == 0) {
      return null
    }
    return (
      <div class={classNames(displayClass, "backlinks")}>
        <h3>{i18n(cfg.locale).components.backlinks.title}</h3>
        <OverflowList>
          {backlinkFiles.length > 0 ? (
            backlinkFiles.map((f) => {
              // folder of the linking note, and the sentence it links here with
              const folder = (f.relativePath ?? "").split("/").slice(0, -1).join(" / ")
              const ctx = backlinkContext(f.htmlAst, fileData.slug!)
              return (
                <li>
                  <a
                    href={resolveRelative(fileData.slug!, f.slug!)}
                    class="internal"
                    data-slug={f.slug}
                  >
                    <span class="backlink-folder">{folder}</span>
                    {f.frontmatter?.title}
                  </a>
                  {ctx && (
                    <p class="backlink-context">
                      {ctx.before}
                      {ctx.mark && <mark>{ctx.mark}</mark>}
                      {ctx.after}
                    </p>
                  )}
                </li>
              )
            })
          ) : (
            <li>{i18n(cfg.locale).components.backlinks.noBacklinksFound}</li>
          )}
        </OverflowList>
      </div>
    )
  }

  Backlinks.css = style
  Backlinks.afterDOMLoaded = overflowListAfterDOMLoaded

  return Backlinks
}) satisfies QuartzComponentConstructor
