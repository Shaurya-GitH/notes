# Van Gogh revamp: implementation plan

Goal: the Quartz site renders 1:1 with the three design artifacts, and every note still works as it does today.

| Artifact                    | Source of truth                                                                       | Live copy                                         |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Home page (scroll story)    | `design/prototype/starry-notes.html` and `img/`                                       | https://claude.ai/artifact/7HzLRKYvQQtkhbmpMoFFTh |
| Note page, explorer, rail   | `design/note-page/src/custom.css`, `proto.js`, `branch.svg` (`build.py` assembles it) | https://claude.ai/artifact/XdrBjmEgP19NyssGu881U3 |
| Decisions and art direction | `design/2026-10-15-van-gogh-research.md`                                              |                                                   |

"1:1" means the same pixels at the same scroll positions, and the same behaviour wherever the prototype changed behaviour (search, popovers, TOC, graph, explorer). The only things not carried over are prototype scaffolding: folder links opening the live site in a new tab, the "Prototype of the home page" note, the prototype footer copy, and `build.py` itself.

Constraints that apply throughout:

- Style through tokens and `quartz/styles/custom.scss`. No React and no Tailwind. Prefer config over forking Quartz files, and keep each fork small and named.
- Use npm, as the repo does. Never run `npx quartz build` while `--serve` is running.
- Don't reformat the vault notes. Nothing is pushed. You commit at the end of each phase.

## How Quartz constrains the build

These facts, checked in the source, shape the plan.

1. **One script bundle and one stylesheet for every page.**
   - Every component's `afterDOMLoaded` script is concatenated into one `postscript.js`, loaded on every page (`componentResources.ts:321-369`).
   - So home-only code must guard itself on `body[data-slug="index"]` and tear itself down on SPA navigation, using `prenav` and `window.addCleanup`.
   - `.inline.ts` files are bundled by esbuild, so they can `import` npm packages. That means Lenis and Anime.js become npm dependencies, not CDN tags.
2. **The generated theme variables are written after `custom.scss`** (`util/theme.ts:143-175`). The nine Quartz colours must therefore be set in `quartz.config.ts`; a dark-mode override in `custom.scss` would lose. Extra tokens (`--surface`, `--star`, `--node`, `--c-*`) have no competitor and can live in `custom.scss`.
3. **Fonts.** The config's font spec can't request the `opsz` axis, and `@import` in `custom.scss` would not be first in the bundle. So:
   - set `fontOrigin: "local"`;
   - keep real Google family names in `typography` (the OG-image generator downloads them by name);
   - add the exact Google Fonts URL through a small plugin's `externalResources` (a CSS `<link>`, as `latex.ts` does for KaTeX).
4. **No per-page layouts.** `layout: index` in `content/index.md` is read by nothing.
   - The home composition is built from components that render on the home page only, wrapped in `ConditionalRender`, plus CSS keyed on `body[data-slug="index"]`.
   - micromorph diffs children by index. So home-only markup goes at the end of each container, or is rendered everywhere and hidden by CSS, to keep sibling indexes stable.
5. **The prototype's CSS assumed it loads last.** Several of its rules lose to stock nested SCSS. Those are the search sheet, the global-graph icon and the global-graph overlay; the note-page inventory lists them. Each port must be checked in the browser, not copied blind.
6. **Stock behaviours the prototype changed:**
   - TOC: one heading in view, not many.
   - Popovers: an excerpt card with folder and title, opening on keyboard focus.
   - Search: folder labels, a hint row, an empty state and full ARIA.
   - Graph: a radial local graph drawn as stars on a 2D canvas, no Pixi.
   - Mermaid: different theme variables.
   - Explorer: the chevron is a button, and the list has one scroll area.

   "1:1" means porting these behaviours. Stock extras the prototype simply lacked stay: Ctrl/Cmd+G, closing the global graph by clicking its backdrop, tag search, hiding popovers on phones, and anchor scrolling.

## Phases

Each phase ends rendered and checked at 1440×900 and 390×844, in both themes for note pages. You commit at each checkpoint. Phase 1 must land first. Phases 2–4 are independent of each other; phase 5 needs phase 1 and the shared Lenis component from phase 4.

### Phase 1: foundation (tokens, fonts, assets, a comparison harness)

| Change     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colours    | `quartz.config.ts` `theme.colors` becomes the prototype's light and dark values for the nine variables (light `#f3ecd9 … #85590c`, dark `#041833 … #6fb3bd`; the table is in the note-page inventory).                                                                                                                                                                                                                                      |
| Fonts      | `typography`: header and title Fraunces, body "Source Serif 4", code "JetBrains Mono"; `fontOrigin: "local"`.                                                                                                                                                                                                                                                                                                                               |
| Fonts link | New `quartz/plugins/transformers/vangogh.ts` (or one added to the existing plugin list) that returns `externalResources: { css: [{ content: "https://fonts.googleapis.com/css2?family=Caveat&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" }] }`, with preconnects through `additionalHead`. |
| Stylesheet | Split `custom.css` into `quartz/styles/vangogh/_tokens.scss`, `_reading.scss`, `_explorer.scss`, `_rail.scss`, `_overlays.scss`, `_ambient.scss`, `_home.scss`, all `@use`d from `custom.scss`. The extra tokens use `:root[saved-theme="light"]` and `:root[saved-theme="dark"]`. Font and motion tokens get a dark-mode copy too: the prototype declared them for light only, a bug that production would show in dark mode.              |
| Art        | Move `design/prototype/img/*` (8 plates) to `quartz/static/vg/` and `branch.svg` to `quartz/static/vg/branch.svg`. CSS uses `url("static/vg/…")`, which resolves from `index.css`. Scripts build paths with `pathToRoot(getFullSlug(window))`.                                                                                                                                                                                              |
| Harness    | A Playwright script (`design/parity/compare.mjs`, kept out of the build) that loads the prototype and the local build at the same viewport, theme and scroll checkpoints, and writes the two screenshots side by side. It covers every phase's checks.                                                                                                                                                                                      |

Checkpoint: a note page shows the new palette and fonts in both themes, the OG images still build, and `npm run check` and `npm test` pass.

### Phase 2: the note page (CSS on Quartz's own markup)

A straight port of these parts of `custom.css`:

- the reading column, the dek paragraph, headings, book-style links, lists, content meta, breadcrumbs, tags;
- the brush-stroke `<hr>`, blockquotes, `.text-highlight` and `::selection`;
- callouts, with the per-type `--c-*` colours mapped onto Quartz's `--color`, `--border` and `--bg`;
- inline and block code (keeping the GitHub Shiki themes, as the prototype does), tables, images, KaTeX sizing and mermaid boxes;
- the left-sidebar title, search button, theme and reader buttons;
- the footer and the responsive rules.

Plus these code changes the prototype needs:

| Change               | Where                                                                                                                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Footer copy          | `Footer.tsx` gains an optional `text` prop. `quartz.layout.ts` passes "Notes by Shaurya Mehta. Built with Quartz.", plus GitHub `https://github.com/Shaurya-GitH` and Home, both `target="_blank" rel="noopener"`.         |
| Page title suffix    | `pageTitleSuffix: " · Notes"` in `quartz.config.ts`.                                                                                                                                                                       |
| KaTeX MathML         | `latex.ts:37` `output: "htmlAndMathml"` (and the option type), so screen readers get the maths. It looks the same.                                                                                                         |
| Clipboard button     | `clipboard.inline.ts`: label "Copy code" then "Copied" for 1.5 s, visible on `:focus-visible`, skips mermaid blocks, falls back to selecting the text. The prototype keeps the copy glyph instead of a green check.        |
| Reader mode          | `readermode.inline.ts` sets `aria-pressed`.                                                                                                                                                                                |
| Sunlit ambient light | `_ambient.scss`: slats on `body::before`, the branch shadow on `body::after` masked by `static/vg/branch.svg`, petals on `#quartz-root::before`. Hidden in reader mode, frozen under reduced motion (prototype behaviour). |

Checkpoint: the TLS, Docker/Introduction and Spring/Introduction notes match the note-page artifact side by side in both themes and at both widths, for the article column only.

### Phase 3: the explorer

| Change                   | Where                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chevron becomes a button | `Explorer.tsx` `template#template-folder`: `button.folder-icon[type=button][aria-expanded][aria-label="Expand {name}"]` wrapping the svg. `explorer.inline.ts` `toggleFolder` finds `.folder-container` by `closest()` (the stock parent lookups break once the svg is wrapped) and keeps `aria-expanded` and `aria-label` in sync. |
| One scroll area          | `_explorer.scss` port (the outer `ul.explorer-ul` scrolls, `align-content: start` keeps closed rows packed, nested lists have no own scroll).                                                                                                                                                                                       |
| No page jump on load     | `explorer.inline.ts:223-233`: keep the `sessionStorage` restore. Replace `activeElement.scrollIntoView({behavior:"smooth"})` with centring inside the list only: `ul.scrollTop += a.top - ul.top - ul.clientHeight / 2`.                                                                                                            |
| Edge fades               | `explorer.inline.ts` toggles `.scrolled` (top fade) and `.gradient-active` (bottom fade) on scroll, `transitionend`, a ResizeObserver and folder toggles. This replaces OverflowList's IntersectionObserver for the explorer only.                                                                                                  |
| Scrollbar                | `_explorer.scss` thin painted thumb with hover and focus-within colours; `.dragging` set on pointerdown in the gutter; a WebKit fallback.                                                                                                                                                                                           |
| Active note              | `aria-current="page"` on the active link (CSS draws the star dot).                                                                                                                                                                                                                                                                  |
| Phone drawer             | `aria-expanded` on the toggle button with "Open explorer" / "Close explorer" labels, and `#quartz-body.lock-scroll` while open (stock styles it but never sets it).                                                                                                                                                                 |

Checkpoint: real wheel input reaches both ends of the list over nested notes on desktop and in the phone drawer. Loading a deep note doesn't move the page. Closed-folder rows are evenly spaced. Keyboard Tab and Enter open folders.

### Phase 4: the right rail and overlays

| Change                      | Where                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backlink folder and context | `Backlinks.tsx`, at build time. The folder comes from `f.relativePath`. The context is the text of the block in `f.htmlAst` that holds `a[data-slug=<this note>]`, with the link text wrapped in `<mark>`, cut at 220 characters, and skipped when the block is only the link. The rule matches `build.py` but reads rendered HTML, so markdown links count too. Emits `span.backlink-folder` and `p.backlink-context`.                      |
| Unwritten links             | `links.ts` (CrawlLinks): when the resolved slug isn't in `ctx.allSlugs`, add class `unwritten` and `data-unwritten`, and keep `href` for no-JS. The client script drops `href` and makes the link focusable, and the popover says "Not written yet".                                                                                                                                                                                         |
| Popovers                    | `popover.inline.ts` rewritten to the prototype's card: folder, title and a 260-character excerpt from `contentIndex.json`. One shared `#link-preview[role=tooltip]`, a 220 ms delay, opens on hover and keyboard focus, closes on Esc and scroll, edge-clamped, flips above. Still hidden on phones.                                                                                                                                         |
| Graph                       | `graph.inline.ts` drops Pixi and tween for a 2D canvas. The local graph uses the prototype's radial layout and star drawing: radii, halos, dashed unwritten rings, outward truncated labels and the legend. The global graph uses the prototype's folder-seeded simulation, pan and zoom, caption, Close button, `role=dialog` and focus restore, keeping Ctrl/Cmd+G and the backdrop click. `Graph.tsx` gains the legend and dialog markup. |
| TOC                         | `toc.inline.ts`: exactly one `in-view` item, the last heading above 32% of the viewport. The collapse button gets `aria-expanded`.                                                                                                                                                                                                                                                                                                           |
| Phone "Connections" summary | A small `RailSummary` component at the top of the right rail, with backlink and outgoing counts. It toggles `.rail-open` and rebuilds the local graph.                                                                                                                                                                                                                                                                                       |
| Search                      | `search.inline.ts` keeps FlexSearch, but renders the prototype's sheet: `result-folder`, title, a 150-character snippet with `<mark>`, the preview pane, the empty state ("Type to search N notes…" with N from the index), the no-match line, and the hint row. ARIA combobox and listbox; ↑ ↓ move the active option. Tag search stays.                                                                                                    |
| Mermaid                     | `mermaid.inline.ts` theme variables match the prototype (`theme: "base"`, body font, `--surface-2` / `--dark` / `--tertiary` / `--gray` / `--light`, 15 px).                                                                                                                                                                                                                                                                                 |
| Lenis on note pages         | New shared `SmoothScroll` component (npm `lenis@1.3.26`). Note pages use `lerp 0.12, anchors {offset:-24}`, with native scrolling inside the explorer, search, graph, TOC, backlinks and popovers. Lenis stops while search and the graph are open, jumps to the top instantly on navigation, and is off under reduced motion. This replaces `html { scroll-behavior: smooth }` from `base.scss` while Lenis runs.                           |

Checkpoint: the full note-page artifact matches side by side, including hover and focus states, search open, graph open, and the phone rail. axe reports no violations, and keyboard paths work through search, the graph dialog and the popovers.

### Phase 5: the home page

Home-only components, all wrapped in `ConditionalRender(slug === "index")`:

| Piece            | Placement and source                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HomeStage`      | The fixed stage: eye, iris, rings svg, sky, field, sky2, flow and strands canvases, crows svg, reveal canvas, scrim and grain. Rendered last in `afterBody` and positioned fixed behind everything.                                                                                                                                                                                                                         |
| `HomeBeats`      | `beforeBody` on index: the intro panel (title, tagline, "Scroll to enter"), the iris quote, and the "Who I am" label beat, all read from `index.md` front matter.                                                                                                                                                                                                                                                           |
| Reading panel    | The index article itself, styled as the prototype's `#about` panel through `body[data-slug="index"] article`.                                                                                                                                                                                                                                                                                                               |
| `HomeSpiral`     | `afterBody`: the wipe, the heading, the helix of nine folder cards (real internal links that go through the SPA), and the mode label. The cards are built at build time from the folder tree with note counts, and the ART mapping lives in the component.                                                                                                                                                                  |
| `InkCursor`      | The star and halo and the WebGL2 fluid ink, the twins on the stage and the cards, and the doves.                                                                                                                                                                                                                                                                                                                            |
| `home.inline.ts` | The prototype IIFE, ported as is: placeIris, rings, the crows timeline (npm `animejs@4.5.0`), flow, strands, stage(), helix(), and the ink sim with every constant kept. It runs only on index. Everything the inventory lists for teardown is cleaned up through `addCleanup`: listeners, the rAF loop, Lenis, the anime timeline, the WebGL context (`WEBGL_lose_context`), `html.brush`, the cursor and the twin images. |
| Home chrome      | On index: no right rail, the left sidebar 300 px with the prototype's look, no theme or reader buttons, and the dark Starry Night palette whatever theme is saved (the home artifact is single-theme). The phone top bar is restyled to match.                                                                                                                                                                              |
| Lenis on home    | The same `SmoothScroll` component with the home options (`lerp 0.09`, `anchors: true`, native scroll inside the sidebar).                                                                                                                                                                                                                                                                                                   |

Checkpoint: side-by-side at scroll checkpoints 0, 0.5, 1, 1.6, 2.7, 4.1 and the spiral at 0%, 50% and 100%, at 1440 and 390, against the home artifact.

Also checked:

- **Ink:** strokes over the eye, the field and the cards.
- **Other conditions:** reduced motion (static grid), touch (no cursor), no WebGL2.
- **SPA:** navigation home → note → home leaves no listeners, no running rAF loop and no live GL context. Check with a heap snapshot and a listener count.

### Phase 6: verification and ship

- The parity harness passes for all three artifacts, plus a manual pass by you.
- axe, keyboard-only and reduced-motion passes on home and two notes.
- Safari check, which needs the WebKit download for Playwright (about 100 MB) or your Safari.
- Bundle size: `postscript.js` before and after. Dropping Pixi should more than pay for Lenis and Anime.js.
- Lighthouse on home and a note.
- Tests (`node:test`, run by `npm test`) for the pure logic:
  - backlink context extraction;
  - unwritten-link detection;
  - the radial layout function;
  - the explorer edge-fade maths;
  - the helix transform.
- `npm run check`, a full `npx quartz build`, and the CI workflow green. Then you merge and push.

## Prototype bugs to fix or keep

| Issue                                                                                                    | Plan                                                             |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| The font and motion tokens were declared for light mode only.                                            | Fix (phase 1).                                                   |
| The home "Scroll to enter" link renders sage, not chrome (`.actions a:last-child`).                      | Keep, since it is what was approved.                             |
| JS uses `< 860` while CSS uses `max-width: 860px`.                                                       | Fix: JS uses `matchMedia("(max-width: 860px)")`.                 |
| The flow-field vortices use viewport fractions, not plate fractions.                                     | Keep, since it is what was approved.                             |
| Twin images download on touch and under reduced motion, where no brush exists.                           | Fix: load them only when the ink sim starts.                     |
| The rAF loop runs forever, even under reduced motion.                                                    | Fix: it stops on cleanup and doesn't start under reduced motion. |
| `design/note-page/src/build.py` expects a `katex.css` that isn't in the repo.                            | Not needed once Quartz renders the page; `build.py` is retired.  |
| The research brief says ambient light turns off under reduced motion, but the prototype only freezes it. | Follow the prototype.                                            |

## Decisions (owner, 2026-10-15)

1. **Home copy:** the reading panel renders all of `content/index.md`, including the Toolkit table and the links. The story beats' text (title, tagline, quote, "Who I am" label) moves into `index.md` front matter, so the page has one source. The panel runs longer than the artifact; everything above it matches 1:1.
2. **Home explorer:** the real folder tree on every page, with note counts added to folder rows. With all folders closed, it looks like the artifact's list.

## Out of scope

Regenerating the plates at 2048 px, cutting the original figure out to alpha, the koboyo hand-drawn icons, constellation colours in the global graph (never prototyped), and a Shiki theme matched to the palette (the prototype kept the GitHub themes).
