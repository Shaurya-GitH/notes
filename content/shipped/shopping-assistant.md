---
layout: case-study
title: Shopping assistant
socialTitle: "Shopping assistant · Shaurya Mehta"
kind: At work
period: Sep – Nov 2026
outcome: A shopping assistant that answers beside the page, not over it
lead: A voice and text shopping assistant for a US e-commerce camera store. With two teammates at The Product Highway, I rebuilt it so it answers in a side rail, scrolls the page to the proof, and fills its answer cards from the store's own data.
description: A voice and text shopping assistant for a US camera store, rebuilt to answer beside the page, scroll it to the proof, and show prices and stock only from store data.

cover:
  src: shopping-assistant/rail-welcome.webp
  alt: The assistant open in a side rail beside a camera's product page, offering three starter questions

galleryTitle: On the QA site
gallery:
  - src: shopping-assistant/rail-welcome.webp
    alt: The assistant open in a side rail beside a camera's product page, offering three starter questions
    caption: The rail opens beside the page, which moves left and stays usable.
  - src: shopping-assistant/page-action-specs.webp
    alt: The page scrolled to its technical specifications while the rail explains the specs that matter for vlogging
    caption: '"Show me the specs that matter for vlogging": it scrolls the page to the specifications and explains five of them in plain words.'
  - src: shopping-assistant/cards-delivery-warranty-comparison.webp
    alt: Three answer cards, for delivery options to a ZIP code, a 2-year warranty, and a side-by-side comparison of two cameras
    caption: Delivery, warranty and comparison cards. Every price, date and stock level on them comes from the store, not the model.
  - src: shopping-assistant/cards-spec-pick-fit.webp
    alt: Three answer cards, for specs in plain terms, a recommended camera with price and stock, and a fit verdict with reasons to choose or avoid it
    caption: Spec, recommendation and fit cards. The model writes the reasons; the store supplies the figures.
  - src: shopping-assistant/talk-modes.webp
    alt: The voice tray with Text on the left, the listening orb in the middle, and Voice note on the right
    caption: Three ways to talk. Hands-free (the orb) is the default; text and voice notes stay one tap away.
  - src: shopping-assistant/nudge-desktop.webp
    alt: The rail opened by a nudge beside the delivery options, with three reply chips
    caption: A nudge. Four seconds after a shopper scrolls past the buy box without adding to cart, the rail opens with reply chips.
  - src: shopping-assistant/nudge-phone.webp
    alt: On a phone, the assistant open as a sheet over half the screen, with reply chips and the buy button below
    caption: On phones it opens as a half-height sheet, and the buy button stays visible below it.

tldr:
  part: "The website side of the rebuild: the side rail and phone sheet, hands-free voice, page actions, the answer cards and the nudge rules. The agent's prompts on Echo. The evaluator and API for the team's dashboard. On the live store: shopper context, instrumentation and a product-ID hotfix."
  team: Three engineers, working from a designer's Figma
  when: Sep – Nov 2026
  stack: Next.js, TypeScript, Echo (voice agents), Kotlin/Spring Boot, MongoDB
  result: Rebuild on the QA site, not yet on the live store; page actions right in 9 of 10 staging tests

problem: A full answer covered the page it was about

decisions:
  - chose: Answer cards get only product IDs and reasons from the model, and fetch every price, stock level and date from the store
    rejected: letting the model write figures into the card
    because: the card sits beside the page's own buy box, so a second source could show two prices for one camera; a comparison row that carries a money amount is dropped
  - chose: A page action names a product, one of 3 site pages or one of 9 sections, and the website checks it before it acts
    rejected: letting the model send selectors or URLs
    because: a known name either works or goes back to the agent as missing, so it can say so instead of scrolling to nothing
  - chose: One rule at the top of the prompt says that on a product page "this" and "it" mean the camera on the screen
    rejected: a rule about how to read pronouns
    because: the pronoun rule only moved the mistakes (3 of 9 answers still named the camera from its previous answer); the plain rule got 9 of 9
  - chose: The evaluator checks each answer against product data it fetches itself, when it runs
    rejected: judging against the tool results the agent saw
    because: the agent platform stores those cut to about 500 characters, too little to prove a fact right or wrong

diagram:
  src: static/shipped/shopping-assistant/architecture.svg
  alt: "Diagram: the website sends the question and page context to the Echo agent; the agent calls the store APIs every turn and replies with words, a card and a page action; cards fetch their figures from the store APIs; after a chat, the evaluator checks each answer against fresh store data"
  text: The model chooses what to show and the store supplies every figure. The agent replies with words, a card type with product IDs, and at most one page action. The website draws the card from the store's data and reports whether the action worked.

results:
  - n: 9 of 9
    basis: '"this camera" questions answered about the camera on the screen · 6 typed, 3 spoken · staging · Sep 2026 · the previous prompt got 6 of 9'
  - n: 9 of 10
    basis: page-action test cases right after 5 prompt rounds; round 1 got 4 of 9 · staging · Sep 2026
  - n: 12 card types
    basis: none shows a price, stock level or date typed by the model · QA site · Oct 2026

differently: I would hand-label about 50 conversations and compare them with the evaluator's verdicts before building dashboard views on top of it. That check was planned and not done, so I can't quote an answer-accuracy figure.
---

The assistant already ran on the store's live site, answering by voice or text from the store's product, stock, warranty and delivery data. But on desktop a full answer opened over the product page, so the shopper lost sight of the camera they were asking about. It had one voice mode: record, then send. And the website already worked out which group a shopper was in, from a first visit to a third visit with a camera in the cart, but the assistant ignored it.

## What we rebuilt

With two teammates, I rebuilt it on the store's QA site, which runs on the live catalogue:

- **A side rail, not a takeover.** On desktop the page moves left and stays usable. On phones a sheet opens at half height, and the buy button stays visible.
- **Three ways to talk.** Hands-free is the default: the microphone opens with the rail, and a turn ends after 700 ms of silence. Text and voice notes with a live transcript are one tap away.
- **Page actions.** It opens a product, the home page, the camera list or the cart, and scrolls to 9 kinds of section, such as the warranty or what's in the box.
- **12 answer cards,** such as delivery, warranty, payment, comparison and fit.
- **9 nudges.** At most 1 per page, and none after 3 are ignored in a visit.
- **Replies by shopper group.** The website recomputes one of 6 groups before every message.

## My part

I built most of the website side: the rail and sheet, hands-free voice, the page-action code, the card system and the nudge rules. I also wrote the agent's prompts on Echo and tested prompt changes in loops on staging. One loop found that an emptied cart was simply left out of the context, so the agent kept naming the last basket it had seen. Now an empty cart is sent as empty.

On the live store, my parts are the shopper context and instrumentation, a new visitor identity after 30 days without activity, and a hotfix so the assistant receives product IDs instead of warehouse codes.

For the team's dashboard I built the API and an evaluator. For each shopper question, a model gives a verdict, such as correct, partly or wrong, against product data fetched fresh. The rebuild and the evaluator are on the QA site and staging; the live store still runs the earlier assistant.
