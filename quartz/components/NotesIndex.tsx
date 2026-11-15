import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

// The Notes page (content/notes.md, the nav's "Notes"): one link per top-level folder of notes.
// Folders are read from the content, so a new folder shows up on its own.
export default (() => {
  const NotesIndex: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const folders = new Map<string, string>()
    for (const f of allFiles) {
      const parts = (f.relativePath ?? "").split("/")
      if (parts.length > 1 && f.slug) folders.set(parts[0], f.slug.split("/")[0])
    }
    const list = [...folders.entries()].sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    )
    return (
      <ul class="notes-index">
        {list.map(([name, slug]) => (
          <li>
            <a
              class="internal"
              href={resolveRelative(fileData.slug!, (slug + "/index") as FullSlug)}
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    )
  }
  return NotesIndex
}) satisfies QuartzComponentConstructor
