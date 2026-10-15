# Van Gogh portfolio revamp: research brief

Date: 2026-10-15. Status: research only, nothing built. Feeds the design spec.

## 1. Constraints this has to live inside

- **Functionality stays identical.** Search, explorer, graph, popovers, SPA navigation, TOC, backlinks, dark mode, reader mode, callouts, mermaid. All of them find their DOM by class name, so the revamp restyles; it never renames classes or moves components between layout slots.
- **Navigation is the priority.** The home page keeps the left explorer. The scroll story must not hide or replace it.
- **Quartz stays Quartz.** Preact rendered at build time, no React, no Tailwind (owner's standing rule). Styling goes through `quartz.config.ts` theme, `quartz/styles/custom.scss`, and new Quartz components only where markup is genuinely new (the hero, the cursor creature).
- **TPH design system for structure.** Spacing, type scale, radius, focus ring, durations from TPH tokens. The TPH token file is **not in the repo today**; it must be vendored (from `@tph/ui`'s `ds-tokens.css`, or the skill's `foundation.css`). The Van Gogh palette is an app-level override of TPH's colour roles, which the skill allows ("the app's tokens outrank this skill's").
- **Package manager stays npm.** The repo is standardised on npm (`package-lock.json`, `npm ci` in `deploy.yml`); the TPH rule says match it rather than convert.

## 2. The wallpaper: palette source

`~/Downloads/MountainLion_Starry_Mac.jpg` (6016×3384). A Starry-Night-style vortex: a cream moon at the centre, chrome-yellow and peach strokes spiralling out through teal into deep Prussian and night blue. Every stroke is short, directional, and follows the swirl.

k-means over the pixels:

| Share | Hex       | Role it suggests                      |
| ----- | --------- | ------------------------------------- |
| 19.4% | `#062645` | night ground                          |
| 17.7% | `#09395b` | Prussian, raised surface              |
| 14.3% | `#165773` | deep teal                             |
| 13.8% | `#041833` | deepest night, page background (dark) |
| 10.6% | `#8a9f85` | sage, muted text                      |
| 10.4% | `#3c7f88` | teal stroke, borders                  |
| 8.5%  | `#dfc489` | chrome-yellow cream, accent           |
| 5.4%  | `#030d20` | shadow / ink                          |

### Candidate palettes (proposals, contrast measured, WCAG 2.x)

**Dark, "Starry Night"** (the default; it is the wallpaper)

| Pair                                  | Ratio | AA text |
| ------------------------------------- | ----- | ------- |
| cream `#ece3c8` on night `#041833`    | 13.85 | pass    |
| chrome-yellow link `#e8c06a` on night | 10.29 | pass    |
| teal link `#6fb3bd` on night          | 7.48  | pass    |
| sage muted `#8a9f85` on night         | 6.23  | pass    |
| cream on Prussian panel `#09395b`     | 9.38  | pass    |

**Light, "Almond Blossom / Wheatfield"** (canvas cream ground, ultramarine ink)

| Pair                                 | Ratio | AA text                                 |
| ------------------------------------ | ----- | --------------------------------------- |
| ink `#1b2a41` on canvas `#f3ecd9`    | 12.25 | pass                                    |
| ultramarine link `#1f4e8c` on canvas | 7.05  | pass                                    |
| olive muted `#5d6b4f` on canvas      | 4.84  | pass                                    |
| ochre `#9a6a12` on canvas            | 4.01  | **fail**: use `#85590c` (5.19) for text |
| chrome yellow `#e8c06a` on canvas    | 1.46  | **fail**: decoration only, never text   |

These map onto Quartz's nine theme variables (`--light`, `--lightgray`, `--gray`, `--darkgray`, `--dark`, `--secondary`, `--tertiary`, `--highlight`, `--textHighlight`). The graph reads those variables at runtime, so it rethemes for free.

## 3. Reference teardown

### estherwong.fun (the eye and the crows)

What it actually is, measured in the page:

- **A pre-rendered video, not live art.** The intro is 150 WebP frames (`frames/frame_0001.webp` to `0150`, 50 to 120 KB each, about 11 MB) painted onto a 2D `<canvas>` and scrubbed by scroll. Pages 2 and 3 are an H.264 video (2.9 MB mobile cut) played continuously. Pages 4 and 5 are static.
- **Stack:** GSAP 3.12.5 from cdnjs plus a 77 KB inline script. **No Lenis**: it hijacks the wheel itself and snaps section by section (`startSectionScroll`, `lockBodyScroll`).
- **Gated entry:** a loader ("100% READY", "Enter world") that also starts background audio.
- **Cursor:** a canvas trail, 15 points, lerp 0.2.
- **Story:** a hooded figure among white doves over dark water, then a close-up of two eyes with dappled light, the right iris holding an "Other projects" portal.

Borrow: the **framing idea** (open on an extreme close-up of an eye, pull back to reveal the world) and the **iris as a portal**.
Do not borrow: the 11 MB frame sequence, wheel hijacking with section snapping, the entry gate, or audio. Each fights navigation, weight, or access.

### aengel.io (the strings)

- **Stack:** Next.js (Turbopack), **Three.js r184 on WebGL2**, **Lenis 1.3.26**, GSAP 3.14.2, Draco-compressed `.glb` models, KTX2 textures. A full 3D scene.
- **The strings** come from `spectralCurves.json` (3.7 KB): five 3D control-point curves. Many thin glowing tubes are swept along them with additive blending, which gives the violet-to-white bundle in the screenshot.
- **2D equivalent:** the screenshot is a flat composition. The same look is about 40 to 80 bezier strands sharing a few control curves, each offset by a slow sine or noise phase, stroked with a gradient, composited with `globalCompositeOperation = "lighter"` on a Canvas 2D. Zero dependencies.
- **Van Gogh translation:** the strands _are_ the sky's brushstrokes. Use the wallpaper's teal, cream and chrome-yellow instead of violet, and let them flow around the moon. This makes the aengel effect and the Starry Night swirl one element, not two.

### Reactive cursor (Buttermax, Awwwards element) — replaces the spider

Decided 2026-10-15: the owner replaced the spider with a reactive cursor after [Buttermax's](https://www.awwwards.com/inspiration/reactive-cursor-1). The spider notes below are kept as history.

- **What it shows (measured on buttermax.net, 2026-10-15):** the cursor pours ink into a fluid simulation. The ink is a fat, smooth blob with crisp edges and no outline. It keeps flowing after the cursor stops, curling into spirals and drips, then thins from its tail and is gone in about a second. Inside the ink the page shows a different layer.
- **Van Gogh translation (owner, 2026-10-15):** wherever the ink lies, the same scene shows in an _inverted universe_. The owner asked for it to behave exactly like Buttermax's ink: no border, no click effect, and no Brush toggle or "Skip intro" link.
- **The inverted universe:** the night-blue sky turns ember, crimson and oxblood. The yellow moon becomes a black eclipse with a pale violet corona, and the stars become lilac rings with dark cores. The gold wheat turns ash-violet and the dark cypress bone-white. The girl's twin has warm medium-dark brown skin, white hair in a braid, an oxblood coat, a black scarf and an ash-violet skirt. The crows are white doves, both in the painting and as the live SVG flock, which is redrawn as doves inside the ink. The almond blossom twin is the original's colours inverted.
- **Art:** twin plates are in `design/prototype/img/*-alt.jpg`. They come from Figma AI (gemini-3.1-flash-image, 1376×768): eye (node 15:2), sky (16:2), and a field with no figure (19:2, also saved as `design/art/03b-field-alt-empty.jpg`). The field twin is a bake: the white-haired twin from `design/art/04b-figure-plain-alt.jpg` (node 18:2) is keyed off her grey ground and placed at 1:1 over the original girl's head and shoulders, offset (185, 190) on the 1376×768 plate, so the two girls stand in the same place. The eye twin is pinned to the original by its iris centre. All of these were generated from text, because Weave image editing needs the owner's Figma account linked to Weave.
- **Ink:** a stable-fluids simulation in raw WebGL2, after Pavel Dobryakov's WebGL Fluid Simulation (MIT). Velocity runs at 128 px and dye at 512 px on the short side, with 20 pressure iterations, curl 22, dye dissipation 2.4 and velocity dissipation 1.2. The mask is a smoothstep threshold of the dye (0.12 to 0.2), which gives the crisp liquid edge. Faster moves pour a larger blob. Without WebGL2 there is no ink, only the star pointer.
- **Registration:** the stage twins are composited exactly as the stage is, with the same layers, opacities, scroll zoom and drift. Each spiral card carries its own twin canvas inside it, so the card's 3D transform and depth wash apply to it too. The ink is mapped onto the card through an affine fit to three corner pins. On the spiral beat the stage ink fades out under the dark wash, so ink shows only on the paintings.
- **The pointer:** a chrome-yellow star with a lagging dashed halo, after the swirls around his stars. Over anything clickable the halo opens and no ink pours, so link text stays clean; the spiral cards are the exception. Clicking does nothing extra.
- **Placement:** the stage ink is a canvas inside the fixed stage, under the scrim and under all content, so text is never painted over.
- **Limits:** home page only; never on note pages. It is off for touch pointers and reduced motion. The twins start loading on the first pointer move or the window's load, whichever comes first. The keyboard-only skip link (shown only on Tab focus) stays for accessibility.

### The mechanical spider (superseded) (X post, video by GitHub user cyohei997)

- **What it shows:** a line-drawn spider crawling over a Wikipedia article. Its legs latch onto individual words, which highlight as it grips them. It is a visual pun on "web crawler".
- **Source:** the post credits "cyohei997 on github", but that account returns 404, so no code was found. The technique is standard procedural animation:
  1. The body eases toward the cursor (lerp), never snaps.
  2. Each leg keeps a planted foot. When the foot drifts past a threshold from its rest spot (offset in the travel direction), it steps along a short arc to a new spot.
  3. Each leg is a two-bone chain; the knee comes from the law of cosines, with a fixed bend side.
  4. Diagonal leg pairs alternate, so it never lifts too many legs at once.
  5. **The word-gripping twist:** step targets snap to nearby word boxes, found by `Range.getClientRects()` over text nodes near the foot. The gripped word gets a highlight class.
- **Rendering:** one SVG with eight `<path>` legs updated each frame is fine at this count. Canvas only if it grows.
- **Theme fit:** a brush-drawn spider (thick tapered strokes, chrome-yellow on night) that grips words in the notes. "Crawler" also fits a backend engineer's notes.
- **Prior art:** a D3 SVG spider with two-bone IK and a round-robin gait ([Roman Jahandideh](https://romanjahandideh.artstation.com/projects/Nq9K1P)); a canvas spider that anchors to nearby dots, with cursor and idle modes ([Framer ArachneSpider](https://www.framer.com/marketplace/components/arachnespider/)); diagonal-pair gait and step sensors ([80.lv, Godot spider](https://80.lv/articles/ik-driven-procedural-spider-locomotion-in-godot-4-5)).

## 4. Van Gogh art direction

### Hallmarks to design with

- **Directional impasto.** Short, thick, parallel strokes that follow form and flow. The single most recognisable trait, and the one the wallpaper shows.
- **Complementary blue and yellow** (ultramarine, Prussian, cobalt against chrome yellow and ochre), with orange-red and green accents.
- **Dark contour lines** around forms (from Japanese prints and cloisonnism).
- **Haloed stars and moons:** concentric rings of strokes.
- **Recurring motifs:** cypresses (flame-like verticals), wheat fields, crows, sunflowers, almond blossom on turquoise, olive trees, irises, café lamplight, night over water.
- **Japonisme:** flat colour fields, bold cropping, and blossom branches (_Almond Blossom_, _La Mousmé_).

### The character: a woman painted in his style

The brief: a girl, not Van Gogh himself. His own portraits of women are the best style reference for her face, colour and brushwork:

| Painting                                           | Year    | Where                               | Useful for                                                          |
| -------------------------------------------------- | ------- | ----------------------------------- | ------------------------------------------------------------------- |
| _La Mousmé_                                        | 1888    | National Gallery of Art, Washington | a young woman, oleander sprig, Japonisme; the closest to "the girl" |
| _L'Arlésienne_ (Madame Ginoux)                     | 1888    | Met and Musée d'Orsay versions      | strong contour, flat yellow ground                                  |
| _Madame Roulin Rocking the Cradle_ (_La Berceuse_) | 1889    | Art Institute of Chicago, **CC0**   | wallpaper-like floral ground, green and red complements             |
| _Marguerite Gachet at the Piano_                   | 1890    | Kunstmuseum Basel                   | elongated brushwork, quiet mood                                     |
| _Peasant Woman Digging in Front of Her Cottage_    | c. 1885 | AIC, **CC0**                        | earlier, darker Nuenen palette                                      |

### Paintings to build the story from

| Painting                                 | Beat it supplies                              | Image source and licence                                                                                                            |
| ---------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| _The Starry Night_ (1889, MoMA)          | the swirling sky, the moon, the cypress       | [Commons](https://commons.wikimedia.org/wiki/File:Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg), public domain                  |
| _Wheatfield with Crows_ (1890)           | the crows, the parallel to estherwong's birds | [Commons](https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_Wheatfield_with_crows_-_Google_Art_Project.jpg), public domain |
| _Starry Night Over the Rhône_ (1888)     | reflected light on water                      | [Commons](https://commons.wikimedia.org/wiki/File:Starry_Night_Over_the_Rhone.jpg), public domain                                   |
| _Almond Blossom_ (1890)                  | the light theme, the calm close               | [Commons](https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_Almond_blossom_-_Google_Art_Project.jpg), public domain        |
| _Sunflowers_ (1889, VGM F458)            | the warm accent                               | [Commons](https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg), public domain                      |
| _Cypresses_ (1889), _The Bedroom_ (1889) | silhouettes, an interior                      | AIC, CC0                                                                                                                            |

Licensing: Van Gogh died in 1890, so the paintings are public domain. Commons marks the files above "Public domain", and the Art Institute of Chicago publishes its Van Gogh images under CC0 (checked with its API). Museum photographs can carry their own terms, so check each file page before shipping. The Getty, the Met (Open Access) and the Nationalmuseum Sweden also publish open Van Gogh images.

### Getting the artwork itself

The girl has to exist as layered art (sky, field, figure, eye, crows on separate planes). **Decided 2026-10-15: all art is AI-generated or sourced from the web (public domain); no commissions.** Workflow: generate the designs first, then implement. The two sources:

1. **Generated painted stills, in layers.** Fastest, and fully original. Needs several passes to keep her face consistent across beats. TPH lists generated illustrations as an anti-pattern for client POCs; that rule targets fake evidence in demos, not art in a personal portfolio, but say "illustration" honestly if asked.

   Image models return flat pictures, not layers. Generate each plane separately (sky alone, figure on a plain ground, crows alone), then cut the figure out to alpha before animating.

2. **Built from a real Van Gogh portrait of a woman** (_La Mousmé_, _La Berceuse_): cropped, separated into layers, extended. Authentic paint and legally clean, but she is his sitter, not "your" girl.

Procedural pieces need no artwork: the sky strokes, the strings, the crows (simple V-shaped strokes), star halos, and the spider.

## 5. The story, moderated

About 3 to 4 screen heights of scroll, home page only. Scroll position drives each beat (scrubbed, reversible), never a timer, never snapping.

1. **The eye.** An extreme close-up of her eye in impasto strokes. Her iris is the wallpaper's vortex, slowly turning. Three or four crows from _Wheatfield with Crows_ drift across. Your name and one line sit in a solid panel.
2. **Through the iris.** As you scroll, the view scales into the iris swirl until it becomes the whole sky: the aengel-style strands, recoloured as Starry Night strokes, flowing round the moon.
3. **Her world.** The view pulls back: she stands in a wheat field under that sky, a cypress at one side, the crows lifting off.
4. **Settle.** The scene dims to a quiet backdrop and the home content (who you are, projects, notes) reads over it. The explorer is visible the whole time.

Reduced motion: the final composed frame of beat 3 as a still, with no scrub, no Lenis and no spider. All content is reachable without playing anything. A "Skip intro" link is the first focusable element.

## 6. Technology decision

### Libraries (current npm versions, 2026-10-15; sizes measured from the published dists, gzip -9)

| Library              | Version | Size (min / gz)                                         | Verdict                                                                                                                                                                                          |
| -------------------- | ------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lenis**            | 1.3.26  | 33 KB / 8 KB                                            | **Use.** Smooth scroll site-wide, and the scroll clock for the story. Same version aengel.io ships.                                                                                              |
| **Anime.js**         | 4.5.0   | 119 KB / 41 KB (full bundle; v4 tree-shakes per module) | **Use as the one animation library.** Strongest SVG kit: `createDrawable` for stroke drawing, `morphTo` for the eyelid, `onScroll` to sync timelines to scroll, `stagger` for crows and strands. |
| **Motion** (vanilla) | 14.2.0  | 154 KB / 51 KB (full dist; tree-shakes)                 | **Skip** unless a gap shows up. Its `scroll()` and `inView` overlap Anime.js's `onScroll`, and two animation libraries is one too many.                                                          |
| GSAP + ScrollTrigger | 3.15.0  | 73 + 45 KB / 28 + 18 KB                                 | Skip. What both references use, but not on the owner's list; Lenis plus Anime.js covers it.                                                                                                      |
| **Three.js**         | 0.186.1 | about 760 KB / 194 KB (core + module)                   | **Not needed.** See below.                                                                                                                                                                       |

Note that Motion 14.2.0 was published on 2026-10-13; pin a release at least two weeks old when installing.

### Is Three.js required? No.

- **Nothing in the brief is 3D.** The strings are a flat composition (Canvas 2D, additive blending). The eye and the pull-back are layered 2D planes moved by scale and translate (2.5D). The sky is strokes. The spider is eight SVG paths.
- **Weight.** Quartz bundles every client script into one `postscript.js` that every page loads. Today it is 877 KB (272 KB gzip), mostly the graph's pixi.js and d3. Three.js would add about 70% to every notes page, for a hero only the home page shows.
- **Usable if ever wanted:** yes, as a dynamically imported module or a separate static file loaded only on the home page. Raw WebGL (one fragment shader, no library) is the cheaper escape hatch if a flowing-paint shader is ever wanted.

### SVG and Canvas split

- **SVG:** the spider, crows, star halos, the eyelid, the cypress silhouette, and any line that gets drawn on. Animate `transform`, `opacity`, `stroke-dashoffset` and the `d` attribute.
- **Canvas 2D:** the sky strands (dozens of strokes redrawn every frame, too many for SVG).
- **Painted layers:** AVIF or WebP images with alpha for the girl and the field. Budget: hero total ≤ 1.5 MB, against estherwong's 11 MB.
- **Brush texture:** an SVG `feTurbulence` plus `feDisplacementMap` filter roughens edges into hand-painted ones ([Dan Wilson's CodePen](https://codepen.io/danwilson/pen/wNMMYv/), [the Codrops filter series](https://tympanus.net/codrops/?p=37751)). Render it once, or on small elements. Animating turbulence over a full-viewport area is CPU-bound and drops frames.

## 7. Quartz integration risks (verified in this repo)

| Risk                                                                           | Where                                                                                               | Handling                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every `.inline.ts` is bundled **separately**, with its own copy of its imports | `quartz/cli/handlers.js:269`                                                                        | One home-art script imports Lenis and Anime.js. Two scripts importing the same library would ship it twice.                                                                   |
| All component scripts ship on **every page**                                   | `componentResources.ts` builds one `postscript.js`                                                  | Hero code returns early when its root element is absent. Keep the shared cost small (Lenis + Anime.js ≈ 50 KB gzip).                                                          |
| `html { scroll-behavior: smooth }` fights Lenis                                | `quartz/styles/base.scss:8`                                                                         | Override with Lenis's own CSS (`html.lenis { height: auto }`, `.lenis-smooth { scroll-behavior: auto !important }`).                                                          |
| SPA navigation resets scroll with `window.scrollTo` and `scrollIntoView`       | `spa.inline.ts:111-113`                                                                             | Create Lenis once (survives micromorph), call `lenis.resize()` on `nav`, rebuild scroll timelines on `nav`, and clean up through `window.addCleanup`.                         |
| Inner scrollers would be hijacked                                              | explorer, search results, popovers, TOC, backlinks, mobile explorer, and the graph (wheel zooms it) | Lenis `prevent: (node) => node.closest(".explorer, .search, .popover, .toc, .backlinks, .graph")`. No markup change. All six root classes confirmed in the components.        |
| Anchor links and the TOC                                                       | `toc.inline.ts`, hash links                                                                         | Lenis `anchors: true`. Check that the TOC's active-heading tracking still fires.                                                                                              |
| Hero placement in the three-column grid                                        | `renderPage.tsx` puts `beforeBody` in the centre column                                             | Paint the sky as a `position: fixed` backdrop behind the whole page on the home page; the eye scene pins in the centre column; sidebars stay on top. No fork of `renderPage`. |
| Graph colours                                                                  | `graph.inline.ts:179` reads CSS variables                                                           | Keep the nine theme variables filled.                                                                                                                                         |
| Stale frontmatter                                                              | `content/index.md` has `layout: index`                                                              | Unused by Quartz; harmless. Owner's content, so left alone.                                                                                                                   |

## 8. Where this departs from TPH rules (flagged once)

TPH's `motion.md` is written for business UI and forbids parallax, reveal-on-scroll, cinematic transitions, and motion on imagery. The owner explicitly wants a scroll story, smooth scroll and a cursor creature. Proposed split:

- **Home hero and cursor creature:** a deliberate deviation, noted in code comments. Bounded: home only, scrubbed by scroll (never timed), off under reduced motion, never gating content.
- **Every notes page:** TPH stillness. Only Lenis's smooth scroll plus colour and focus transitions on token durations. No reveals, no parallax.
- **Everything else stays TPH:** AA contrast, a 2px focus ring, one `h1`, no colour-only meaning, no em dashes in UI copy.

## 9. Gallery and tool sites: what was useful

| Site                                                                                                    | Finding                                                                                                                    |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [land-book.com](https://land-book.com/)                                                                 | Searching "illustration portfolio" returns mostly paid Framer templates; nothing painterly. Low value for this direction.  |
| [inspora.design](https://www.inspora.design/)                                                           | Has Illustration and Motion categories; worth browsing by hand. Candidate posts: `portfolio-hero`, `new-personal-website`. |
| [landdding.com](https://landdding.com/)                                                                 | About 2.5k pages over 40 categories, including Art and Portfolio. Nothing tagged painterly.                                |
| [collectui.com](https://collectui.com/)                                                                 | Daily UI shots by component category; useful later for 404, search and sidebar details, not for art direction.             |
| [libraries.dev](https://libraries.dev/)                                                                 | React-only effect packages (border beam, gooey, orbs). Not usable under the no-React rule.                                 |
| [aicss.dev](https://aicss.dev/)                                                                         | Copy-paste UI for AI agent chats (thinking states, streaming text). Not relevant to a portfolio.                           |
| [animejs.com](https://animejs.com/), [motion.dev](https://motion.dev/), [lenis.dev](https://lenis.dev/) | Covered in section 6.                                                                                                      |

Also found: the [Van Gogh Museum site redesign](https://artdependence.com/articles/the-van-gogh-museum-has-dramatically-redesigned-its-website/) is built on his favourite palette but keeps its layout minimal so the art carries it, which is the right instinct here too. Vrellis's _Starry Night Interactive_ iPad app ([App Store](https://apps.apple.com/app/id511943282)) shows brushstrokes that flow under a finger, close to the strands-as-sky idea.

## 10. Decisions for the owner

1. ~~Artwork source for the girl~~ Decided: AI-generated or web-sourced, no commissions. Designs are generated before implementation.
2. **Themes:** dark Starry Night as default, with an Almond Blossom light mode; or dark only.
3. ~~Spider scope~~ Decided: no spider. A reactive brush cursor on the home page only, with a toggle (section 3).
4. **Typography:** candidates on Google Fonts: Fraunces or Cormorant Garamond for display, Source Serif 4 or Literata for body, JetBrains Mono for code, and optionally Caveat for "letters to Theo" asides.

## 11. More references added during design (2026-10-15)

| Site                                                          | What it is, measured in the page                                                                                                                                                                                                          | What we take                                                                                                                                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [pacomepertant.com](https://www.pacomepertant.com/)           | Nuxt, Three.js, Lenis, GSAP. Project cards on a 3D helix of curved WebGL planes; the wheel turns the helix, and a "spiral / list" toggle gives the same projects as a list.                                                               | Beat 5: the nine note folders as painted cards on a helix. Built with CSS 3D transforms (flat cards, real links), no WebGL. The explorer is the list view.                                    |
| [sleep-well-creatives.com](https://sleep-well-creatives.com/) | Webflow, GSAP, Three.js. Hard-edged colour wipes between sections, a hypnotic zigzag tunnel you scroll into, paper grain everywhere.                                                                                                      | The iris-to-sky transition becomes a tunnel of painted, dashed SVG rings; the spiral section opens with a scroll-driven `clip-path` circle wipe; a static SVG noise layer gives canvas grain. |
| [sunlit.place](https://www.sunlit.place/)                     | Plain React, no canvas or WebGL. About 25 blurred "shutter" slats with gradient and noise, tilted in 3D like window blinds; blurred leaf shadows falling on CSS keyframes; a sun/moon toggle.                                             | The ambient background for **notes pages**: almond-blossom shadows and window light drifting over the cream page in light mode, moonlight in dark. CSS only, and calm enough for reading.     |
| [koboyo.com/icons](https://koboyo.com/icons)                  | 261,740 hand-drawn SVG icons; styles include Original, Ink brush, Block print. Licence: free for personal and commercial use, may be recoloured and modified, attribution never required; may not be redistributed as an icon collection. | Ink-brush icons for search, dark mode, reader mode, explorer chevrons, callouts and copy buttons. Commit only the handful used, never a bulk copy.                                            |

**Animated sky (owner request).** Wherever the Starry Night sky is the background, it moves: short brushstrokes are carried along a vortex flow field centred on the painting's two spirals and its moon (Canvas 2D, about one stroke per 4,200 px², trails fading over roughly 20 frames), and the plate itself breathes with a slow scale. Under reduced motion it is a still painting.

## 12. Design artefacts

- **Figma file:** [Van Gogh Portfolio — Design](https://www.figma.com/design/syviTyjlyWzf6TqfAMFxCJ). Pages hold the art plates, the art direction board (palette, type, motifs), a five-beat storyboard with annotations, dark and light note-page mockups, and a 390 px phone frame.
- **Prototype:** `design/prototype/starry-notes.html` with `img/` (also published as a private artifact). Lenis 1.3.26 and Anime.js 4.5.0 from jsDelivr; everything else is drawn live.
- **Art plates:** generated with Figma AI (Gemini 3.1 Flash Image), 1376 × 768 (figure 896 × 1200). `design/art/04-figure-plain.jpg` is the girl on a plain ground, for cutting out to alpha.

**Known limits to resolve before production:**

1. Plates are 1376 px wide; full-bleed on large screens wants about 2560 px. Regenerate at 2048 px (the tool's maximum) or upscale.
2. Figma's Starter plan allows one variable mode, so the Dark/Light palettes are documented on the board rather than as switchable variables. The code is the token source.
3. Figma MCP on a Starter plan with a View seat allows about 20 read calls a month. About 12 were used building this file.
4. The sky plate has a strip of hills along its bottom edge despite the sky-only prompt; it reads as a horizon and was kept.

## 13. Note pages and explorer (designed 2026-10-15)

Prototype: published privately as an artifact; rebuild it locally with `npx quartz build -o <dir>` then `python3 -I design/note-page/src/build.py <dir> content <out>`. It is assembled by `design/note-page/src/build.py` from a **real Quartz build** of three notes (Security/TLS, Docker/Introduction, Spring/Introduction), so it uses Quartz's own markup and class names. `src/custom.css` is the draft of `quartz/styles/custom.scss`; `src/proto.js` only imitates Quartz's client scripts so the prototype can be clicked.

**Reading surface.** The article sits at about 66 characters per line in Source Serif 4 at 18 px with a 1.72 line height. Headings are in Fraunces. Links are underlined like a book, not boxed. Callouts take Van Gogh hues per type and always carry an icon and label. A horizontal rule is a single dry brush stroke. Highlights look like a marker swipe. Tables, code, maths and mermaid diagrams are restyled to the palette.

**Ambient light, after sunlit.place.** Window-slat light, a slowly swaying almond-branch shadow (a 7 KB procedural SVG used as a mask) and drifting petal shadows. All CSS on pseudo-elements, so no markup changes. It is moonlight in dark mode, and turns off in reader mode and under reduced motion.

**Explorer.** One scroll area with a thin painted scrollbar: quiet sage or sand at rest, darker on hover (4.8:1 against the page), star colour while dragged; soft fades at the top and bottom edges appear only when there is more in that direction (Safari gets the same thumb through `::-webkit-scrollbar`). Folders expand on Quartz's own grid-rows transition; the chevron rotates on the same duration and curve. The current note gets a painted star and a filled row, and its folder title is tinted even when closed (CSS `:has`). Open state is remembered (Quartz's `fileTree` storage). On phones it is Quartz's slide-in drawer.

**Right rail.** The local graph is radial: this note in the centre, links out on the right, backlinks on the left, notes not yet written as dashed rings, labels pointing outward. The full graph groups folders into constellations, labels hub notes, and pans and zooms. The table of contents marks the section in view. Backlinks show the folder and the sentence that links here. On phones the rail collapses to one "Connections" line (TPH: secondary panels on mobile are summaries).

**What stays stock Quartz (styling only):** theme tokens, typography, links, callouts, code, tables, maths, mermaid, TOC, popovers, search, graph colours, footer (a `quartz.layout.ts` link change), ambient light.

**Small code changes this design needs, each optional and listed by value:**

| Change                                       | File                                                 | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Explorer scrolling (required)**            | `custom.scss` and `explorer.inline.ts`               | Stock Quartz gives every list in the explorer `overscroll-behavior: contain`, including each open folder's inner list, which is `overflow: hidden` for the open/close animation. Those inner lists swallow the wheel, so the explorer only scrolls while the pointer is over a top-level folder name. Measured on the live site and in the prototype with real wheel input: over a note inside an open folder the list stalled after one tick. Fix: the outer list is the only scroll area, sized by flexbox rather than a percentage `max-height` (which Safari often cannot resolve), and inner lists pass the wheel through. Also replace `activeElement.scrollIntoView()` with setting the list's own `scrollTop`, because `scrollIntoView` scrolls the window too and made the page jump about 786 px on a first visit. |
| Chevron becomes a `<button aria-expanded>`   | `Explorer.tsx` template, `explorer.inline.ts` toggle | Today the chevron is a bare SVG, so keyboard users cannot open folders. Clicks behave exactly as before.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| KaTeX `output: "htmlAndMathml"`              | `quartz/plugins/transformers/latex.ts` line 37       | Quartz hardcodes `output: "html"` with `aria-hidden`, so screen readers get nothing for any formula.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Backlink folder and context sentence         | `Backlinks.tsx`                                      | Shows how each note relates, not just its title. Needs the source sentence at build time.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Mark links to notes not written yet          | small client script or a link transformer            | `[[transport layer]]` currently 404s. Dashed, muted, "Not written yet" on hover.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Radial local graph and constellation colours | `graph.inline.ts`                                    | Quartz's force graph is kept; only the layout and colours change. Optional.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Shiki theme closer to the palette            | `quartz.config.ts`                                   | Code still uses GitHub light and dark highlighting. One-line config change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

**Content notes (not design):** TLS's two `$$` formulas inside a list render inline on one line, which is how Quartz parses indented display maths. Many notes have no links yet; the full graph shows them as a loose outer ring.
