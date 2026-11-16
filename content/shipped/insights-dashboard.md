---
layout: case-study
title: Shopping-assistant insights
socialTitle: "Shopping-assistant insights · Shaurya Mehta"
kind: At work
period: Sep – Oct 2026
outcome: From site visit to sale, every answer checked by an LLM judge
lead: For a US e-commerce store's voice and text shopping assistant, I built the business-insights system in the company's internal operations dashboard. It shows a funnel from site visit to purchase, and an agentic AI pipeline summarises every chat and has an LLM judge check each answer against live product data.
description: A funnel from site visit to purchase for a store's shopping assistant, with an agentic AI pipeline that summarises every chat and grades each answer with an LLM judge.

cover:
  src: insights-dashboard/pipeline.webp
  alt: "Diagram: site events go to Mixpanel and sync every 4 hours; when a chat ends, the transcript is fetched, an LLM writes the summary and intent, and an LLM judge gives each question a verdict; orders carry the conversation ID; all three feed the dashboard's funnel, breakdowns, resolution and conversations explorer"

galleryTitle: Redrawn with illustrative values
gallery:
  - src: insights-dashboard/funnel.webp
    alt: "The Adoption card with illustrative values: a six-step funnel from 1,000 site visits to 10 purchases with revenue in two currencies, emails and handoffs tiles beside it, and a By device table below"
    caption: The funnel, redrawn with illustrative values. Every rate shows its counts, and revenue is shown per currency, never converted.
  - src: insights-dashboard/resolution.webp
    alt: "The Resolution card with illustrative values: answer accuracy, conversation resolution, a bar of verdicts, questions the product data could not answer, and reasons the rest did not resolve"
    caption: Resolution, with illustrative values. "Handed off" and "couldn't verify" are left out of both rates.
  - src: insights-dashboard/drawer.webp
    alt: "A conversation drawer with illustrative content: the verdict, product, country, device and outcome at the top, then the transcript with the input type under each shopper turn and the judge's verdict and evidence under each answer"
    caption: The conversations explorer, with illustrative content. Each answer shows the judge's verdict, its reason and the evidence it used.

tldr:
  part: Event tracking, the Mixpanel sync, the API, the LLM judge and the dashboard UI (17 pull requests, 4 repositories)
  team: Planned for three engineers. It builds on a teammate's conversation ingest and summary step
  when: Sep – Oct 2026
  stack: Kotlin/Spring Boot, MongoDB, Next.js, Recharts, Mixpanel, DeepSeek
  result: On staging, verified end to end with the real model; not yet in production

problem: A list of chats could not say whether the assistant paid its way

decisions:
  - chose: The judge checks each answer against product data it fetches itself when it runs
    rejected: judging against the tool results the assistant saw
    because: the agent platform stores those cut to about 500 characters, too little to prove a fact right or wrong
  - chose: The judge is a second LLM call in the existing analysis step, retried by the existing queue
    rejected: a separate nightly judging run, the first plan
    because: it runs as soon as a chat is fetched and again only when the chat grows, a judge failure cannot break the summary, and the retry also fixed summaries that were lost when a model call failed
  - chose: A separate "couldn't verify" verdict, left out of both rates
    rejected: filing those questions as "not in our data"
    because: on staging, a failed product lookup was blaming the catalogue and the assistant for facts nobody had checked
  - chose: Business outcomes only, with the resolution rate as a quality signal
    rejected: the spec's prompt-improvement loop (intent suggestions, regression sets, judge versions, per-turn overrides)
    because: prompt quality stays with QA and human-reviewed edits, automated prompt changes cause regressions, and the loop would have been used about once a month

results:
  - n: 6 steps · 8 cards
    basis: site visit to purchase, with revenue per currency; every rate shows its counts · staging · Oct 2026
  - n: 7 verdicts
    basis: for each shopper question, each with a reason and one line of evidence, checked against fresh data for up to 5 products
  - n: Every 4 h
    basis: Mixpanel events synced into the operations database; orders linked to chats by conversation ID, not by timing
  - n: 156 tests
    basis: backend tests for the dashboard and the judge (138 core + 18 controller), passing at the last staging build · 21 Oct 2026
---

The store's shopping assistant answers by voice and text on every page. In the company's internal operations dashboard, the team could see only a list of conversations with an AI summary. Nothing showed how many visitors opened the assistant, whether asking led to a cart or an order, or whether its answers were right. The business had to decide whether to push the assistant, leave it, or change direction, and it had no evidence.

## The funnel

Every visit moves through six steps: site visit, product view, opened the assistant, asked a question, added to cart after, and purchased after, with revenue per currency. The website sends each event to Mixpanel with the visit, device, country, entry point and who started the chat: the shopper or a proactive nudge. Each message also records how it was sent: typed, tapped, a voice note or hands-free. A job copies these events into the operations database every 4 hours. The order service writes the conversation ID onto each successful payment, so "purchased after" counts real orders linked to a chat.

Eight cards break the funnel down by week, device, entry point, who started it, first message, input type and country. A rate with a base under 5 is greyed out as a small sample.

## The agentic pipeline

When a chat ends, the backend fetches its transcript from the voice-agent platform. One LLM call writes the summary and the shopper's intent. A second call, the judge, reads each shopper question with fresh catalogue data for the products the assistant looked up. It returns one of seven verdicts: correct, partly, wrong, not answered, handed off, not a question, or couldn't verify. Each verdict has a reason and a line of evidence. If a step fails, the chat goes back in the queue with back-off. The model is a setting: DeepSeek by default, or any OpenAI-compatible endpoint.

The Conversations tab is the explorer. It has filters for verdict, reason, intent and turns, kept in the address so that a view can be shared. Each row shows its turns as squares coloured by verdict, and a drawer shows the transcript with the judge's verdict under every answer.

## My part

The work was planned for three engineers. I split it into instrumentation, judge and API, and the dashboard, and I wrote all three parts. The conversation ingest and the summary step that the judge extends are a teammate's earlier work, and so is the first conversation list. I had already added its country filter, stats cards and spoken-or-typed tags in production.

It runs on staging, verified end to end with the real model against the staging catalogue. Production still shows the conversation list. The pictures are redrawn with illustrative values, because the staging numbers include test visits.
