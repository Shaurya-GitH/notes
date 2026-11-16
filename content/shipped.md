---
title: Shipped
layout: portfolio
socialTitle: Shipped · Shaurya Mehta
description: Fixes merged into open-source projects, features running on real traffic, and things I built to learn.
# the Shipped page (Shipped.tsx). Copy is the redesign's (copy v10). Each project's `kind` is one of
# the filters; `link` renders only with an href; `caseStudy` (a page slug) adds "Case study →" once
# that page builds (not a draft); `demo` ({text, href}) adds a second link to a demo hosted elsewhere; `cover` ({src, alt}, from quartz/static/shipped/) puts a real photo
# in the card's painted frame, else a built case study's cover is used, else the painting shows.
# How to add media: docs/adding-project-media.md
shipped:
  headline: Shipped
  text: Fixes merged into open-source projects, features running on real traffic, and things I built to learn. Cards with a case study say so.
  filters:
    - Open source
    - At work
    - Side projects
  projects:
    - kind: At work
      art: harbour
      artefact: Architecture diagram
      title: "A business MCP server: run the company from Claude"
      text: An MCP server that lets a US e-commerce founder ask Claude about sales, margins, stock, ads and site health, and change products, prices and purchase orders in plain English. Every number names its source; every change waits for a preview and a yes.
      metric: 187 operations + 243 vendor tools behind 12 MCP tools · 57/57 staging scenarios
      basis: counted from the code and a staging end-to-end run, Nov 2026 · on staging with QA
      caseStudy: shipped/business-mcp
    - kind: At work
      art: field
      artefact: Answer card and page actions
      title: A shopping assistant that answers from the store's own data
      text: A voice and text shopping assistant for a US e-commerce store, answering from live product, variant, warranty and shipping data. With two teammates I rebuilt it to open page sections and switch pages by voice, answer with rich cards and react to ad and browsing context. I added an LLM judge that grades each answer.
      metric: Live on the store · rebuild on the QA site · judge on staging
      basis: "rebuild: team of 3, not yet in production · judge run end to end on staging, Oct 2026"
      caseStudy: shipped/shopping-assistant
      cover:
        src: shopping-assistant/rail-welcome.webp
        alt: The assistant open in a side rail beside a product page, offering three starter questions
    - kind: At work
      art: market
      artefact: Funnel and LLM judge
      title: Business insights for a shopping assistant, driven by an AI pipeline
      text: The funnel from site visit to purchase for a US store's voice and text shopping assistant, with breakdowns by device, entry point, input type and country. When a chat ends, an LLM pipeline summarises it and an LLM judge checks every answer against live product data.
      metric: 6-step funnel · one of 7 verdicts per question · events synced every 4 h
      basis: on staging, tested end to end with the real model, Oct 2026
      caseStudy: shipped/insights-dashboard
    - kind: At work
      art: almond-alt
      artefact: Pipeline diagram
      title: "YEAPP: a voice-first messenger for KRAFTON India"
      text: "One of four engineers. I built the AI companion's vendor failover with circuit breakers, the voice-onboarding pipeline, and pre-join messages: write to a contact who isn't on the app yet, delivered when they sign up."
      metric: Failover on the first error · 58 clips word-aligned · 0 lost writes across 3 replicas
      basis: live failure and replica tests, Aug – Sep 2026
      caseStudy: shipped/yeapp
      cover:
        src: yeapp/architecture.webp
        alt: "YEAPP's three pipelines: the voice tour clips, held messages and the companion's vendor failover"
    - kind: At work
      art: sky
      artefact: Latency chart
      title: "Echo: voice replies 41–59% faster"
      text: Found why a voice agent was slow for US users, moved the service next to them, and added a shared tool cache.
      metric: Reply start −41% to −59% by turn type · cache hits ~10 ms vs 69–130 ms
      basis: server medians, 1,081 vs 228 turns, 16 Sep – 14 Oct 2026
      caseStudy: shipped/echo-latency
    - kind: At work
      art: eye
      artefact: Eval table
      title: "Echo: a 28 ms tool-call model"
      text: Fine-tuned GLiNER 2.5 (194M parameters) to predict a voice agent's next tool call, served on a GPU.
      metric: Exact tool picks 0/50 → 18/50 · 3 LLM tool calls instead of 9 in a replay
      basis: fixed 50-case benchmark · prototype
      caseStudy: shipped/tool-call-model
    - kind: Open source
      art: sky-alt
      artefact: Diff and review thread
      title: "Keycloak: login stops offering disabled organizations"
      text: Choosing a disabled organization reloaded the page with no message. They're filtered out now, with a test that fails without the fix. I also reported a Dynamic Client Registration bug that the Keycloak team fixed in 26.6.0.
      metric: "PR #54078 · merged Oct 2026"
      basis: "+9 / −1 lines · also issue #44284, fixed in 26.6.0"
      link:
        text: Read the pull request
        href: https://github.com/keycloak/keycloak/pull/54078
      cover:
        src: keycloak/pr-54078-diff.webp
        alt: "Keycloak pull request 54078, merged: the diff adds a filter that keeps only enabled organizations"
    - kind: Open source
      art: almond
      artefact: Diff and test
      title: "Loop: batch-only models no longer 404"
      text: 78 OpenRouter :batch models failed every prompt at the time. The provider preset now hides them, with a test.
      metric: "PR #64 · merged Nov 2026"
      basis: "Rust agent harness · closes issue #63"
      link:
        text: Read the pull request
        href: https://github.com/soketlabs/loop/pull/64
      cover:
        src: loop/pr-64.webp
        alt: "Loop pull request 64, merged: its description of why OpenRouter batch-only models failed and how the preset now hides them"
    - kind: At work
      art: city
      artefact: Heap snapshot
      title: A storefront memory leak, found and fixed
      text: Traced slow product pages to a server memory leak that crashed the site four times in a week.
      metric: Product-page first-byte p95 1.8 s → ~1.3 s
      basis: real visitors, 1 week before vs 3 days after
    - kind: At work
      art: field-alt
      artefact: Architecture sketch
      title: An order engine built from sagas
      text: Exchanges, partial cancellations, inventory sync and fulfilment as MedusaJS workflows with compensating steps, idempotency and retries, at a pre-seed marketplace where I owned the platform end to end.
      metric: Saga-based order lifecycle · event-driven
      basis: For Real · Jun – Jul 2026
    - kind: Side projects
      art: eye-alt
      artefact: Terminal capture
      title: "Alfred-OS: a voice-driven macOS agent, built in a day"
      text: Built with two teammates at the Claude Community Opus Build Day, Bangalore. I built the hold-to-talk voice input, background tasks with live progress and spoken confirmations.
      metric: Team of 3 · Sep 2026
      basis: "my part: 2 merged PRs"
      caseStudy: shipped/alfred-os
      cover:
        src: alfred-os/architecture.webp
        alt: "Alfred-OS architecture: the app, the orchestrator, the agents, and the Mac and the web"
      link:
        text: Read the pull requests
        href: https://github.com/sainitishmitta04/Alfred-OS/pulls?q=is%3Apr+author%3AShaurya-GitH
      demo:
        text: Watch the demo on LinkedIn
        href: https://www.linkedin.com/feed/update/urn:li:activity:7511099366246535168/
    - kind: Side projects
      art: studio
      artefact: Architecture diagram
      title: "apex-memory: one checked memory for every coding agent"
      text: An open-source MCP memory store that Claude Code and Codex share. Every write is version-checked and rolls back if it breaks a link or the index.
      metric: 49 vs 141 tool calls · 14/14 vs 13/14 correct
      basis: same 7 tasks, store vs Obsidian, 12 Oct 2026
      caseStudy: shipped/apex-memory
      link:
        text: Read the code
        href: https://github.com/Shaurya-GitH/apex-memory
    - kind: Side projects
      art: city
      artefact: UI frame
      title: "WeSplit: settle a group with 70% fewer payments"
      text: A Splitwise-style expense app in Spring Boot and React. Fixing N+1 queries and adding Redis cut API response times 60% and database reads 90%.
      metric: 70% fewer settlement transactions
      basis: debt-settlement algorithm · Keycloak auth
      link:
        text: Read the code
        href: https://github.com/Shaurya-GitH/WeSplit
    - kind: Side projects
      art: studio
      artefact: Model diagram
      title: Emotion recognition from face, voice and text
      text: Fuses three models (a CNN on FER-2013, a CNN-LSTM on RAVDESS and BERT on GoEmotions) behind a chatbot.
      metric: 85% cumulative accuracy
      basis: under 300 ms average response
      link:
        text: Read the code
        href: https://github.com/Shaurya-GitH/DRS-Dynamic-Reconciliation-System
---
