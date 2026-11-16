---
title: Portfolio redesign end-to-end results (2026-11-16)
draft: true
---

# Portfolio redesign end-to-end results

Plan: [[2026-11-16-portfolio-e2e]]. Branch `portfolio-redesign`, run against `npx quartz build --serve
--port 8090` in Playwright (Chromium) and chrome-devtools Lighthouse. Every fix was followed by
`npx tsc --noEmit`, `npm test` (66/66 at the end) and `npx quartz build`, then the affected cases
re-ran. Screenshots (page × width, before/after, failures) are in the session scratchpad `e2e-shots/`.

## Summary

| Area          | Cases | Pass (final) | Failed first run, fixed |
| ------------- | ----- | ------------ | ----------------------- |
| Render        | 4     | 4            | R2 (SPA 404s)           |
| Nav           | 3     | 3            | N3 (Escape)             |
| Home          | 4     | 4            | –                       |
| Journey       | 6     | 6            | J6 (rAF loop)           |
| Shipped       | 3     | 3            | –                       |
| Motion        | 3     | 3            | M2/M3 (2 defects)       |
| Accessibility | 4     | 4            | A4 (3 contrast spots)   |
| Performance   | 1     | 1            | P1 (home CLS)           |
| Regressions   | 4     | 4            | R3 footer wrap (found)  |

## Results per case

| ID  | Result | Evidence                                                                                                                                                                                                                       |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Pass   | 7 pages × 3 widths, full load and SPA chain: no console errors or warnings from site code (only GoatCounter's "not counting localhost").                                                                                       |
| R2  | Pass   | First run: SPA from a nested note (`/Docker/Introduction` → breadcrumb Home) 404'd 5 painted backgrounds. Fixed in `b2ac377`; re-run: no 4xx or failed requests.                                                               |
| R3  | Pass   | `scrollWidth == clientWidth` and no text, image or link past the viewport at 1440, 834, 390.                                                                                                                                   |
| R4  | Pass   | No "[", "placeholder", "TODO", "lorem" in rendered text. Copy: every fragment of `copy_v10.py` home/journey/shipped found verbatim, except by-design absences (posts, email, media slots, dashed artefact slots, annotations). |
| N1  | Pass   | All nav/footer internal links 200; external GitHub, X, personal site 200; LinkedIn 999 and LeetCode 403 are bot blocks.                                                                                                        |
| N2  | Pass   | "Get in touch" from home, Journey, Shipped, How I work lands on `/#contact` in view. Note pages keep the notes layout (no portfolio nav, by design).                                                                           |
| N3  | Pass   | Mouse and keyboard open/close; focus moves through the sheet and on out (no trap); SPA link closes it. First run: Escape did nothing; fixed in `3008594` (Escape closes, focus back on the button).                            |
| H1  | Pass   | LCP element is the hero `<img>` (eye.webp at 1440, eye-portrait.webp at 390), `fetchpriority=high`, not lazy.                                                                                                                  |
| H2  | Pass   | Proof cards link to keycloak#54078 and loop#64; both award photos load (720 px WebP); branch cards → /journey, /shipped, /how-i-work, /notes.                                                                                  |
| H3  | Pass   | No posts section; no mailto or copy button.                                                                                                                                                                                    |
| H4  | Pass   | Mouse strokes paint the hero twin (5,116 sampled ink pixels); motion off and touch: no brush class, brush note hidden, nothing painted.                                                                                        |
| J1  | Pass   | Frames at 0–90 % of the intro: eye → rings → sky → field → scrim, as designed (`journey-1440-frame-*.png`).                                                                                                                    |
| J2  | Pass   | Four stops with logos (all 200) and 2/7/4/7 bullets, verbatim against `copy_v10.py`.                                                                                                                                           |
| J3  | Pass   | Each rail link lands its stop at top 0–1 px and sets the hash.                                                                                                                                                                 |
| J4  | Pass   | Skip link is 1×1 until Tab, then visible with an outline; Enter moves focus to `#stops`; next Tab is the first rail link.                                                                                                      |
| J5  | Pass   | R1 regression: no rail/panel overlap at 390, 834, 1024, 1100, 1180, 1440, at the stop top and 200/500/800 px into it.                                                                                                          |
| J6  | Pass   | R2 regression: 16 rings and 16 crows after 6 toggles and after SPA away/back. First run: with motion off the stage still requested a frame every frame (120/s); fixed in `2db9ba5`, now 0/s and 0 running animations.          |
| S1  | Pass   | 12 cards; 4 chips are `<button type=button aria-pressed>`; All 12, Open source 2, At work 7, Side projects 3; Space works.                                                                                                     |
| S2  | Pass   | `?filter=at-work` survives reload, SPA away + Back, Forward + Back; unknown filter falls back to All.                                                                                                                          |
| S3  | Pass   | No dashed borders; 5 links (2 PRs, Alfred-OS PR list, 2 repos) all 200.                                                                                                                                                        |
| M1  | Pass   | No saved choice: system reduce → `reduce`, no-preference → `on`.                                                                                                                                                               |
| M2  | Pass   | Choice persists over reload, SPA navigation and note pages. First run: "on" over a system reduce left the sunlit layer still; fixed in `d9e15d6`.                                                                              |
| M3  | Pass   | Off: 0 running CSS animations, 0 rAF callbacks/s, no ink, no Lenis. First run: anchor jumps still glided (Quartz's `scroll-behavior: smooth`); fixed in `a1ff1b5`.                                                             |
| A1  | Pass   | Tab order logical on all four pages at 1440 and 390; every stop has a visible focus ring; focused items scroll into view.                                                                                                      |
| A2  | Pass   | One h1 per page, no skipped levels.                                                                                                                                                                                            |
| A3  | Pass   | Every `<img>` has alt; stage images `alt=""` under `aria-hidden`; no unnamed links or buttons (the two unnamed ones on How I work are Quartz's hidden heading anchors).                                                        |
| A4  | Pass   | Worst-point contrast (text hidden, brightest backdrop pixel under the glyphs). First run failed: phone hero title 1.2:1 and lede 3.0:1 (`e60e7ae`), recommendation label 4.3:1 (`cde7da4`). Final table below.                 |
| P1  | Pass   | Lighthouse mobile, see below. Accessibility 100 everywhere; home CLS was 0.089–0.107, fixed in `eb5ba8b` (0.001).                                                                                                              |
| G1  | Pass   | Note pages keep the explorer (expand, SPA links), breadcrumbs, graph, TOC; mermaid renders on Docker/Introduction.                                                                                                             |
| G2  | Pass   | Cmd/Ctrl+K opens search, "kubernetes" gives 5 results, Escape closes.                                                                                                                                                          |
| G3  | Pass   | Local graph canvas draws; global graph opens and closes on Escape; hover popover shows "Database locks".                                                                                                                       |
| G4  | Pass   | Theme toggle switches dark ↔ light and back; reader mode on hides the right sidebar, off restores it.                                                                                                                          |

Also found and fixed outside the plan's cases: footer links at 834 px wrapped under their "·"
separators (`bb63e51`).

## Contrast over paintings (final, worst point)

| Text                                             | Need      | Worst        |
| ------------------------------------------------ | --------- | ------------ |
| Home hero title, 1440 / 834                      | 3.0       | 10.8         |
| Home hero title, 360–800 (touch)                 | 3.0       | 4.5–10.2     |
| Home hero title, 390 with mouse (note on)        | 3.0       | 4.4          |
| Home hero lede and tag, every width              | 4.5       | 5.0 or more  |
| Contact, Shipped band, Journey title, How I work | 3.0 / 4.5 | 5.3 or more  |
| Journey recommendation band, every line          | 4.5       | 4.97 or more |

## Lighthouse (mobile, final)

Gzip static server on the built `public/` (production-like; the Quartz dev server sends no
compression and scores 12–15 points lower).

| Page    | Perf | A11y | Best practices | LCP (lab) | CLS   | TBT  | LCP (observed) |
| ------- | ---- | ---- | -------------- | --------- | ----- | ---- | -------------- |
| Home    | 79   | 100  | 100            | 5.6 s     | 0.001 | 0 ms | 0.29 s         |
| Journey | 74   | 100  | 100            | 12.5 s    | 0     | 0 ms | 0.30 s         |
| Shipped | 74   | 100  | 100            | 10.4 s    | 0     | 0 ms | 0.32 s         |

Not fixed (not cheap, or outside this branch): lab LCP is dominated by render-blocking Google Fonts
CSS and the site-wide KaTeX CSS (about 1.8 s of the estimate, on every page); Journey's LCP element
is the stage's `#iris` (eye.jpg, 557 KB JPEG, kept as JPEG because the ink twins are pinned to it);
Shipped's LCP is the harbour band, a CSS background discovered late. Lighthouse also flags 430–838
KB of possible image savings (AVIF/resizing).

## Open for the owner

- The phone hero now carries a navy text halo, and its two buttons always stack on phones. Before
  and after: `home-390-hero-before-halo.png`, `home-390-hero-after-halo.png`,
  `home-390-hero-after-halo-brushnote.png`. Desktop is unchanged.
- The recommendation band scrim is 0.85 instead of the design's 0.8.
- Journey repeats the four-link rail in every stop: 16 tab stops and four `nav` landmarks named
  "Journey stops". Works, but noisy for keyboard and screen-reader users; one shared rail would fix
  it (a design change, so not made).
- The Loop card's almond plate crops to mostly pale sky at 834 px.

## Project pages and Shipped changes (2026-11-16, second run)

Commits `7b51fe5..7d986e6` (project pages with media, Shipped reordered, draft pages). Run against
`npx quartz build --serve --port 8123` with headless Chrome only (Playwright scripts and
chrome-devtools Lighthouse). A temporary non-draft fixture page (`content/shipped/e2e-fixture.md`:
every section, a 4-photo gallery from the shopping-assistant photos, an ffmpeg test-pattern mp4 with
poster and WebVTT captions), a bare fixture (no cover, `gallery: []`, a video without poster or
captions, a video with an empty `src`) and a temporary `caseStudy` on the YEAPP card were added for
the run, then deleted and reverted; none was committed. Every fix was followed by `npx tsc
--noEmit`, `npm test` (69/69) and `npx quartz build`. Scripts and screenshots are in the session
scratchpad `e2e-project-shots/`.

| Area                           | Checks  | Pass (final) | Failed first run, fixed |
| ------------------------------ | ------- | ------------ | ----------------------- |
| 1 Shipped, 3 widths            | 27      | 27           | –                       |
| 2 Project page (fixture)       | 59      | 59           | og:image:type (found)   |
| 3 Card → page link             | 30 + 27 | all          | –                       |
| 4 Accessibility and Lighthouse | 16 + 3  | all          | –                       |
| 5 Regressions and scroll perf  | 9 + 1   | all          | –                       |
| 6 Confidentiality sweep        | 1       | 1            | –                       |

| ID  | Result | Evidence                                                                                                                                                                                                                                                                                                                |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PS1 | Pass   | 1440, 834, 390: 13 cards in order (assistant, YEAPP, Echo latency, Echo GLiNER, Keycloak, Loop, checkout, memory leak, MCP server, For Real, 3 side projects); covers on the assistant, Keycloak and Loop cards load with alt text; no broken image, 4xx or console error; no horizontal overflow; no placeholder text. |
| PS2 | Pass   | `?filter=open-source` → 2 cards, chip pressed; At work chip → 8 and `?filter=at-work`; All → 13 and the parameter removed. With every page a draft, no card links to `/shipped/…`.                                                                                                                                      |
| PP1 | Pass   | Fixture at 1440 and 390: crumb, kicker, h1, lead, hero (loads), 5 TL;DR items, problem heading, body, Demo, Gallery, Decisions, Results, differently, Links, contact band. Gallery 2 columns at 1440, 1 at 390; 4 captioned tiles; thumbnails load once scrolled to.                                                    |
| PP2 | Pass   | Lightbox: click and Enter open on the right picture ("1 of 4", "3 of 4"); ArrowRight/ArrowLeft step and wrap; prev/next buttons; Escape, the close button and a backdrop click close it and focus returns to the opening tile. Focus never reaches the page behind (see notes).                                         |
| PP3 | Pass   | Video: `controls`, `preload=none`, no `autoplay`/`loop`, poster 200, captions track 200 (2 cues, showing). Still paused at 0 s after load, also with motion saved off and with reduced motion emulated. Playing, then switching motion off in the footer pauses it.                                                     |
| PP4 | Pass   | SPA: card → page (poster rebased, 200); 3 rounds of play → crumb away → Back: the old video is paused, nothing plays, 1 dialog and 1 video after each return, ArrowRight steps exactly 1 (no duplicate listeners). SPA navigation with the lightbox open leaves no open dialog.                                         |
| PP5 | Pass   | Bare fixture: no hero, no gallery or dialog, 1 video (the empty `src` one is dropped) with no track and no poster, no empty boxes, no broken images, no errors.                                                                                                                                                         |
| PP6 | Pass   | `og:image` is `https://shauryamehta.me/shipped/<slug>-og-image.webp` (served, 200), not `[object Object]`. First run: `og:image:type` was `image/.webp` on every page; fixed in `7bc86bb`. Also found: project pages were titled "… · Notes" in the tab and preview image; fixed in `825c329`.                          |
| PC1 | Pass   | With the fixture published and a card's `caseStudy` pointing at it, that card shows "Case study →" (200) and the page's cover; after deleting the fixture the link and cover are gone and `/shipped/e2e-fixture` is 404.                                                                                                |
| PA1 | Pass   | Keyboard on Shipped and the fixture, 1440 and 390: every stop named, ringed and scrolled into view; alt text present and generic (no client or store names); one h1, no skipped heading levels; caption, basis and kicker contrast ≥ 6.46:1.                                                                            |
| PA2 | Pass   | Lighthouse mobile: Shipped accessibility 100, best practices 100, SEO 100; fixture page accessibility 100, best practices 100, SEO 100.                                                                                                                                                                                 |
| PR1 | Pass   | Home, Journey, How I work, `System-Design/Rate-limiting` at 1440 and 390: one h1, no console errors or 4xx, no overflow. `node scripts/perf/scroll.mjs`: Chrome ran with `--headless=new` (no window); 0 missed vsyncs on home, Shipped and the note; Journey 1 frame of 894 once, 0 on re-run.                         |
| PX1 | Pass   | `grep -ri "porter\|grayporter" public/`: no hits at all (not even "reporter"); no such file names; none in `content/`, the media guide or the photos' metadata. The six assistant photos, checked by eye, show no store or assistant name.                                                                              |

Notes for the owner:

- The lightbox is a native modal `<dialog>`: Tab cycles its three buttons and, once per cycle, the
  browser's own toolbar (as every native modal does); the page behind is never reachable.
- A demo `<video>` has no accessible name of its own (its title is the figure's caption beside
  it). Lighthouse does not flag it; `aria-label={v.title}` would add one if wanted.
