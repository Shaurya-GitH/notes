import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { Ext, Sun, href } from "./Portfolio"

// How I work (content/how-i-work.md, front matter `work:`): the proof numbers, the loop every bug and
// feature goes through, the tools I built, the skill stack and what the agents can reach. Every block
// renders only when its data is there. Styles: styles/vangogh/_portfolio.scss (.pf-work).

type Item = { k?: string; title: string; text: string }
type Link = { text: string; href: string }
type Tool = Item & { metric?: string; basis?: string; link?: Link; wide?: boolean }
type Section = { heading?: string; text?: string }
type WorkData = {
  stats?: { n: string; basis: string }[]
  loop?: Section & { starts?: Item[]; steps?: Item[]; again?: string; rails?: Item[] }
  tools?: Section & { items?: Tool[] }
  skills?: Section & { groups?: { title: string; text: string }[] }
  reach?: Section & { items?: Item[] }
  rules?: Section & { items?: Item[] }
}

const Head = ({ s, id }: { s: Section; id: string }) => (
  <>
    <h2 id={id}>{s.heading}</h2>
    {s.text && <p class="lede">{s.text}</p>}
  </>
)

const To = ({ fd, link }: { fd: QuartzComponentProps["fileData"]; link?: Link }) =>
  !link ? null : /^https?:/.test(link.href) ? (
    <Ext to={link.href}>{link.text}</Ext>
  ) : (
    <a class="link" href={href(fd, link.href)}>
      {link.text} <span aria-hidden="true">→</span>
    </a>
  )

export default (() => {
  const HowIWork: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const w = (fileData.frontmatter?.work ?? {}) as WorkData
    return (
      <div class="pf pf-work sunlit">
        <Sun />
        {w.stats && w.stats.length > 0 && (
          <ul class="stats-row">
            {w.stats.map((s) => (
              <li>
                <span class="n">{s.n}</span>
                <span class="basis">{s.basis}</span>
              </li>
            ))}
          </ul>
        )}

        {w.loop?.heading?.trim() && (
          <section class="sec" aria-labelledby="loop-h">
            <Head s={w.loop} id="loop-h" />
            <div class="flow">
              {w.loop.starts && (
                <ul class="starts">
                  {w.loop.starts.map((s) => (
                    <li class="card">
                      <p class="k">{s.k}</p>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              {w.loop.steps && (
                <ol class="steps">
                  {w.loop.steps.map((s, i) => (
                    <li>
                      <span class="i mono">
                        {String(i + 1).padStart(2, "0")}
                        {s.k && <span class="who"> · {s.k}</span>}
                      </span>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </li>
                  ))}
                </ol>
              )}
              {w.loop.again && (
                <p class="again">
                  <span aria-hidden="true">↺</span> {w.loop.again}
                </p>
              )}
              {w.loop.rails && (
                <ul class="rails" aria-label="Under every step">
                  {w.loop.rails.map((r) => (
                    <li>
                      <b>{r.title}</b> <span>{r.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {w.tools?.items && w.tools.heading?.trim() && (
          <section class="sec" aria-labelledby="tools-h">
            <Head s={w.tools} id="tools-h" />
            <ul class="grid g3 tools">
              {w.tools.items.map((t) => (
                <li class={t.wide ? "wide" : undefined}>
                  <article class="card">
                    {t.k && <p class="k">{t.k}</p>}
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                    {t.metric && <p class="metric">{t.metric}</p>}
                    {t.basis && <p class="basis">{t.basis}</p>}
                    <To fd={fileData} link={t.link} />
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {w.skills?.groups && w.skills.heading?.trim() && (
          <section class="sec" aria-labelledby="skills-h">
            <Head s={w.skills} id="skills-h" />
            <ul class="grid g4 skills">
              {w.skills.groups.map((g) => (
                <li>
                  <div class="card">
                    <h3>{g.title}</h3>
                    <p>{g.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {w.reach?.items && w.reach.heading?.trim() && (
          <section class="sec" aria-labelledby="reach-h">
            <Head s={w.reach} id="reach-h" />
            <ul class="reach">
              {w.reach.items.map((r) => (
                <li>
                  <b>{r.title}</b>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {w.rules?.items && w.rules.heading?.trim() && (
          <section class="sec" aria-labelledby="rules-h">
            <Head s={w.rules} id="rules-h" />
            <ol class="rules">
              {w.rules.items.map((r) => (
                <li>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    )
  }
  return HowIWork
}) satisfies QuartzComponentConstructor
