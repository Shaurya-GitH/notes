---
# Draft: needs the owner's review (facts, team credit, "differently", a demo video). Generic names
# only: never the store's or the assistant's name. Media: quartz/static/shipped/shopping-assistant/
draft: true
layout: case-study
title: Shopping assistant
socialTitle: "Shopping assistant · Shaurya Mehta"
kind: At work
period: Sep – Nov 2026
outcome: A shopping assistant that answers from the store's own data
lead: A voice and text shopping assistant for a US e-commerce store, answering from the store's live data and showing shoppers the proof on the page.
description: A voice and text shopping assistant for a US e-commerce store, rebuilt so it answers beside the page, moves the page to the proof and answers with cards built from store data.
cover:
  src: shopping-assistant/rail-welcome.webp
  alt: The assistant open in a side rail beside a product page, offering three starter questions
gallery:
  - src: shopping-assistant/rail-welcome.webp
    alt: The assistant open in a side rail beside a product page, offering three starter questions
    caption: The assistant answers in a side rail while the page stays usable.
  - src: shopping-assistant/page-action-specs.webp
    alt: The page scrolled to its technical specifications while the rail explains the specs that matter for vlogging
    caption: Asked for the specs that matter for vlogging, it scrolls the page to the specifications and explains them in plain words.
  - src: shopping-assistant/nudge-desktop.webp
    alt: The rail opened by a nudge beside the delivery options, with three reply chips
    caption: A nudge. Four seconds after a shopper scrolls past the buy box without adding to cart, the rail opens with reply chips.
  - src: shopping-assistant/nudge-phone.webp
    alt: On a phone, the assistant open as a sheet over half the screen, with reply chips and the buy button below
    caption: On phones it opens as a half-height sheet, and the buy button stays visible.
  - src: shopping-assistant/cards-delivery-warranty-comparison.webp
    alt: Three answer cards, for delivery options to a ZIP code, a 2-year warranty, and a side-by-side comparison of two products
    caption: Answer cards for delivery, warranty and comparison. Their data comes from the store, not the model.
  - src: shopping-assistant/cards-spec-pick-fit.webp
    alt: Three answer cards, for specs in plain terms, a recommended product with price and stock, and a fit verdict with reasons to choose or avoid it
    caption: Cards for specs in plain words, a recommendation, and whether a product fits the shopper.
tldr:
  part: "Live version: shopper context, instrumentation, nudge timing, a hotfix. Rebuild: page actions, nudges, the side-rail design. The LLM answer judge."
  team: Rebuild with two teammates
  when: Sep – Nov 2026
  stack: Next.js, Echo (voice agents), NestJS, Kotlin/Spring
  result: Live on the store; rebuild on the QA site, not yet in production
problem: A full answer covered the page it was about
decisions:
  - chose: Page actions are a fixed list of page and section names that the website checks before it acts
    rejected: letting the model send selectors or URLs
    because: a known name either works or is reported back to the agent as missing, and a model-written selector can point anywhere
  - chose: Product facts are fetched fresh for every answer; memory keeps only what the shopper said
    rejected: remembering prices, stock or specs from earlier turns
    because: they change between turns, and memory never keeps card or bank details either
  - chose: The judge runs inside the existing analysis step and is retried by its drain job
    rejected: a separate nightly judge job
    because: the drain job already retries with back-off, and the move also stopped analyses being lost silently
results:
  - n: 12 card types
    basis: answer cards built from store data, each loading on its own · QA site, Oct 2026
  - n: 9 nudge types
    basis: at most 1 per page, none after 3 ignored in a visit · QA site, Oct 2026
---

The assistant already ran on the store's live site, answering from its product, variant, warranty and shipping data. But on desktop a full answer opened over the product page, so the shopper lost the page they were asking about. It had one voice mode (record, then send), and it ignored the shopper group the website already computed.

## The rebuild keeps the page in view

With two teammates, I rebuilt it on the QA site:

- **Three ways to talk:** hands-free voice by default, text, and voice notes with a live transcript.
- **Page actions:** it opens product, home, catalogue and cart pages, and scrolls to 9 types of section.
- **Answer cards:** 12 types, such as delivery, warranty, payment, comparison and fit. Their data always comes from the store, never the model.
- **Nudges:** 9 types that open the assistant with reply chips, capped so they don't nag.
- **Replies by shopper group:** 6 groups, recomputed before every message.

I also built the evaluator behind the team's dashboard: for every shopper question, an LLM judge gives a verdict against fresh product data. The rebuild and the judge are on the QA site and staging, not yet in production.
