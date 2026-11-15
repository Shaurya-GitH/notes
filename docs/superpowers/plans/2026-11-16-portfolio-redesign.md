---
title: Portfolio redesign build plan (2026-11-16)
draft: true
---

# Portfolio redesign build plan

Builds the approved portfolio mockup into this Quartz fork. Design source: `build_final10.py` and
`copy_v10.py` (kb-evidence `design/2026-11/portfolio-final-mockups/`); decisions D1–D20 and the
reference pages in the owner's memory store (`design/decisions`, `design/portfolio/redesign`,
`design/reference/*`). Copy is ported verbatim from `copy_v10.py`; placeholders never render.

## Scope

Four portfolio pages (home, Journey, Shipped, How I work) plus a reusable case-study layout. Every
other page (the notes, folder and tag pages, 404) keeps its current layout, sidebar and explorer.

## Pages and data model

| Page       | File                               | Data                                                                                                                                              |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home hub   | `content/index.md`                 | frontmatter `home:` (hero, proof cards, recommendation, awards, branches, `posts`, `contact`) and `person.sameAs` (footer links)                  |
| Journey    | `content/journey.md`               | frontmatter `journey:` (hero, `stops[]`, quote, next band)                                                                                        |
| Shipped    | `content/shipped.md`               | frontmatter `shipped:` (band, `filters[]`, `projects[]`)                                                                                          |
| How I work | `content/how-i-work.md`            | markdown body; `layout: portfolio`                                                                                                                |
| Case study | any page with `layout: case-study` | frontmatter `tldr`, `kind`, `date`, `lead`, `decisions[]`, `diagram`, `results[]`, `differently`, `links[]`; markdown body is the problem section |
| Notes      | `content/notes.md`                 | landing page for the nav's Notes link: the note folders, generated                                                                                |

A page is a portfolio page when its slug is `index`, or its frontmatter `layout` is `portfolio` or
`case-study` (`isPortfolio` in `quartz/components/Portfolio.tsx`).

Rules that come from the data, not from the template:

- `home.posts` empty or missing: the posts section does not render at all.
- `home.contact.email` empty: no "Email me" or copy button (the heading and line still render).
- Recommender photo: an empty circle until a `photo` is set.
- A Shipped card renders its link only when it has an `href`; "Case study →" only when a case study
  page exists.
- Journey media slots are omitted (no media yet).

## Components and files

- `quartz/components/Portfolio.tsx`: `isPortfolio`, `PortfolioNav`, `PortfolioFooter` (with the
  motion toggle), `ContactBand`, `Sunlit`, shared helpers (static image paths, `<picture>`).
- `quartz/components/PortfolioHome.tsx`, `Journey.tsx`, `Shipped.tsx`, `CaseStudy.tsx`,
  `PortfolioPage.tsx` (How I work header), `NotesIndex.tsx`.
- `quartz/components/scripts/motion.inline.ts` (before DOM: stamps `html[data-motion]`) and
  `portfolio.inline.ts` (toggle, copy email); `shipped.inline.ts` (filter chips);
  `stage.inline.ts` (the former `home.inline.ts`: Journey stage plus the ink reveal).
- Styles: `quartz/styles/vangogh/_portfolio.scss` (tokens, nav, footer, home, Shipped, case study,
  sunlit tier) and `_journey.scss` (the former `_home.scss` stage and story, minus the spiral).
- `quartz.layout.ts`: sidebars, breadcrumbs and title block render only off portfolio pages; the
  footer switches per page.
- Assets: `quartz/static/portfolio/` (paintings as JPG + WebP, award photos, logos).

## Behaviour

- Motion toggle: default from `prefers-reduced-motion`, stored in `localStorage` (try/catch),
  stamps `html[data-motion="reduce"|"on"]`. Reduce stops the sunlit loops, the canvas loops,
  crows, iris turn and the ink cursor, and Lenis (smooth scroll counts as motion).
- Sunlit tier: the note pages' ambient layer, scoped inside `.sunlit` sections (absolute, not
  fixed); petals animate by `transform`. Note pages keep their page-wide layer unchanged.
- Home hero: static `<picture>` (eye, portrait crop under 800 px), `fetchpriority="high"`, not lazy.
  The ink reveal paints its red/violet twin over the hero and over cards whose plate has a twin.
- Journey: the eye → iris → sky → field sequence (Lenis as is, D8) ends on the hero copy, then four
  stops with the progress rail (anchor links), the recommendation band and the Shipped band. A
  keyboard-only skip link jumps to the stops. Reduced motion shows the field still and skips the
  transition beats.
- Shipped: chips are `<button aria-pressed>`, `?filter=` in the URL, cards hidden by filter.

## Risks

- SPA navigation re-runs scripts on `nav`; every script returns its cleanup through
  `window.addCleanup`.
- The stage script is a near-verbatim port; moving it to Journey must not regress its timing.
- Global component CSS: portfolio rules are scoped under `body:has(.pf-nav)` so note pages cannot
  change.
- Painting plates are 1376 px wide (the 2560 px request stays open).

## Test plan

- `npx tsc --noEmit`, `npx prettier --check` on touched files (BASE already fails on 62 content files
  and `.github/workflows/deploy.yml`), `npm test`, `npx quartz build`.
- Serve on :8090; Playwright full-page screenshots of home, Journey, Shipped at 1440×900 and
  390×844 compared with the mockup; one note page with its sidebar; no console errors; filter chips,
  motion toggle and skip link driven by keyboard.
