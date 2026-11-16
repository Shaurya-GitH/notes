---
title: Shipped
layout: portfolio
socialTitle: Shipped · Shaurya Mehta
description: Fixes merged into open-source projects, features running on real traffic, and things I built to learn.
# the Shipped page (Shipped.tsx). Copy is the redesign's (copy v10). Each project's `kind` is one of
# the filters; `link` renders only with an href; `caseStudy` (a page slug) adds "Case study →" once
# that page builds (not a draft); `cover` ({src, alt}, from quartz/static/shipped/) puts a real photo
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
      art: field
      artefact: Answer card and page actions
      title: A shopping assistant that answers from the store's own data
      text: A voice and text shopping assistant for a US e-commerce store, answering from live product, variant, warranty and shipping data. With two teammates I rebuilt it to open page sections and switch pages by voice, answer with rich cards and react to ad and browsing context. I added an LLM judge that grades each answer.
      metric: Live on the store · rebuild in UAT · judge on staging
      basis: "rebuild: team of 3, not yet in production · judge run end to end on staging, Oct 2026"
    - kind: At work
      art: almond-alt
      artefact: Pipeline diagram
      title: "YEAPP: a voice-first messenger for KRAFTON India"
      text: "One of four engineers. I built the AI companion's vendor failover with circuit breakers, the voice-onboarding pipeline, and pre-join messages: write to a contact who isn't on the app yet, delivered when they sign up."
      metric: Failover on the first error · 58 clips word-aligned · 0 lost writes across 3 replicas
      basis: live failure and replica tests, Aug – Sep 2026
    - kind: At work
      art: sky
      artefact: Latency chart
      title: "Echo: voice replies 41–59% faster"
      text: Found why a voice agent was slow for US users, moved the service next to them, and added a shared tool cache.
      metric: Reply start −41% to −59% by turn type · cache hits ~10 ms vs 69–130 ms
      basis: server medians, 1,081 vs 228 turns, 16 Sep – 14 Oct 2026
    - kind: At work
      art: eye
      artefact: Eval table
      title: "Echo: a 28 ms tool-call model"
      text: Fine-tuned GLiNER 2.5 (194M parameters) to predict a voice agent's next tool call, served on a GPU.
      metric: Exact tool picks 0/50 → 18/50 · 3 LLM tool calls instead of 9 in a replay
      basis: fixed 50-case benchmark · prototype
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
    - kind: At work
      art: market
      artefact: Audit table
      title: Checkout bugs fixed in two days
      text: Fixed four live buy-now-pay-later bugs that were blocking orders on a US store, then audited every payment integration.
      metric: 4 live bugs in 2 days · 51 findings, ~30 real bugs
      basis: production logs · sandbox running production code
    - kind: At work
      art: city
      artefact: Heap snapshot
      title: A storefront memory leak, found and fixed
      text: Traced slow product pages to a server memory leak that crashed the site four times in a week.
      metric: Product-page first-byte p95 1.8 s → ~1.3 s
      basis: real visitors, 1 week before vs 3 days after
    - kind: At work
      art: studio
      artefact: Architecture sketch
      title: Ask the business in plain English
      text: An MCP server that lets a business owner query sales, ads, catalogue and site health from Claude, safely.
      metric: 10+ sources behind one contract · 57/57 scenarios pass
      basis: staging, Nov 2026 · in QA
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
      link:
        text: Read the pull requests
        href: https://github.com/sainitishmitta04/Alfred-OS/pulls?q=is%3Apr+author%3AShaurya-GitH
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
