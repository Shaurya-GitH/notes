---
title: Portfolio redesign end-to-end test plan (2026-11-16)
draft: true
---

# Portfolio redesign end-to-end test plan

Runs the portfolio redesign (branch `portfolio-redesign`) in a real browser against the built site
(`npx quartz build --serve --port 8090`). Every failure is fixed with a minimal commit, the checks
(`npx tsc --noEmit`, `npm test`, `npx quartz build`) re-run, then the affected cases re-run. Results:
[[2026-11-16-portfolio-e2e-results]].

Tools: Playwright MCP (rendering, interaction, SPA navigation, media emulation) and chrome-devtools
MCP (Lighthouse, mobile emulation).

## Matrix

- Pages: `/`, `/journey`, `/shipped`, `/how-i-work`, `/notes`, two note pages (one with images or
  mermaid).
- Widths: 1440×900, 834×1112, 390×844.
- Loads: full page load and SPA navigation (click internal links; Quartz `nav` event).

## Cases

| ID  | Area          | Case                                                                                                     |
| --- | ------------- | -------------------------------------------------------------------------------------------------------- |
| R1  | Render        | No console errors or warnings from site code (full load and SPA)                                         |
| R2  | Render        | No failed requests (images, fonts, scripts)                                                              |
| R3  | Render        | No horizontal overflow at each width                                                                     |
| R4  | Render        | No placeholder text ("[", "placeholder", "TODO", "lorem") in rendered text                               |
| N1  | Nav           | Every nav item and footer link resolves (HTTP 200 / valid external)                                      |
| N2  | Nav           | "Get in touch" reaches the home contact section from every page                                          |
| N3  | Nav           | Phone menu opens/closes with mouse and keyboard, Escape closes, no trap                                  |
| H1  | Home          | Hero `<picture>` is the LCP candidate: not lazy, `fetchpriority=high`; phone serves the portrait plate   |
| H2  | Home          | Proof strip, recognition (both award photos load), branch cards link correctly                           |
| H3  | Home          | Posts section absent; email buttons absent                                                               |
| H4  | Home          | Ink-cursor reveal works with a mouse on the hero; off with motion off and on touch                       |
| J1  | Journey       | Intro sequence plays on scroll (frames sampled)                                                          |
| J2  | Journey       | Four stops render with logos and verbatim bullets (`copy_v10.py`)                                        |
| J3  | Journey       | Rail links jump to stops                                                                                 |
| J4  | Journey       | Skip link appears on Tab and moves focus                                                                 |
| J5  | Journey       | Tablet rail does not overlap panels (R1 regression)                                                      |
| J6  | Journey       | Motion off: still frames, no rAF loops; repeated toggling does not duplicate crows/rings (R2 regression) |
| S1  | Shipped       | 12 cards; chips are buttons with `aria-pressed`; filtering works                                         |
| S2  | Shipped       | `?filter=` survives reload and back/forward                                                              |
| S3  | Shipped       | No dashed artefact placeholders (R3 regression); PR/repo links correct                                   |
| M1  | Motion        | Default follows `prefers-reduced-motion` (both emulated)                                                 |
| M2  | Motion        | Choice persists across reloads and SPA navigation                                                        |
| M3  | Motion        | Off stops sunlit animation, canvas, ink and Lenis                                                        |
| A1  | Accessibility | Keyboard-only pass: focus visible, logical order on each new page                                        |
| A2  | Accessibility | Heading order                                                                                            |
| A3  | Accessibility | Every image has alt (decorative empty); links and buttons have names                                     |
| A4  | Accessibility | Contrast of text over paintings (Lighthouse/axe plus worst-pixel spot checks)                            |
| P1  | Performance   | Lighthouse mobile on home, journey, shipped: LCP, CLS, TBT, scores; investigate a11y < 90 or CLS > 0.1   |
| G1  | Regressions   | Note pages keep the explorer sidebar                                                                     |
| G2  | Regressions   | Search (Cmd/Ctrl+K) works                                                                                |
| G3  | Regressions   | Graph and popovers work                                                                                  |
| G4  | Regressions   | Dark/light toggle and reader mode work                                                                   |

Screenshots: each page × width plus failures, in the session scratchpad `e2e-shots/`.
