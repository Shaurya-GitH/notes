import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
  // replaces the "Created with Quartz" line
  text?: string
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        {opts?.text ? (
          <p>{opts.text}</p>
        ) : (
          <p>
            {i18n(cfg.locale).components.footer.createdWith}{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> © {year}
          </p>
        )}
        <ul>
          {Object.entries(links).map(([text, link]) =>
            link.includes(cfg.baseUrl ?? "") ? (
              <li>
                <a href={link}>{text}</a>
              </li>
            ) : (
              <li>
                <a href={link} target="_blank" rel="noopener">
                  {text}
                </a>
              </li>
            ),
          )}
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
