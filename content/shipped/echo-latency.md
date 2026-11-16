---
# Draft: needs the owner's review, plus media (a before/after latency chart from the reports, a cache
# hit/miss trace) and the Echo PR link if public. Media: quartz/static/shipped/echo-latency/
draft: true
layout: case-study
title: "Echo: reply latency"
kind: At work
period: Sep – Oct 2026
outcome: "Echo: voice replies 41–59% faster for US users"
lead: Echo is The Product Highway's voice-agent platform. Replies were slow for US users; I found why, moved the service and measured it on real traffic, and added a shared tool cache.
description: Why a voice agent was slow for US users, the region move that fixed it, measured on real traffic, and a shared Redis tool cache.
tldr:
  part: The latency investigation and reports; the flow-scoped tool cache (PR #9)
  team: Echo team; this work mine
  when: Sep – Oct 2026
  stack: Redis, OpenAI, speech-to-text, the store's API
  result: Reply start −41% to −59% by turn type
problem: Every step of a US user's turn crossed the ocean
decisions:
  - chose: Move the service to the US, next to the users, the models and the store's API
    rejected: running the models in India
    because: OpenAI, Azure and OpenRouter had no in-region option there for these models
  - chose: An opt-in cache per tool, keyed on a SHA-256 of the whole request and scoped to one flow
    rejected: one shared cache, on by default
    because: one flow's results must never reach another, and tools that change state must never be cached
  - chose: Identical misses wait for a single fetch, held by a lease
    rejected: letting every miss call the API
    because: the same question from many callers at once would hit the API once per caller
results:
  - n: −41% to −59%
    basis: server reply start by turn type, medians · 1,081 turns (16–23 Sep) vs 228 (29 Sep – 14 Oct) · includes QA traffic; only 14 spoken turns after
  - n: ~1.8 s sooner
    basis: per typed message at the old tool mix · a descriptive estimate, not a controlled effect
  - n: ~10 ms vs 69–130 ms
    basis: a cache hit vs a live tool call · 26% hit rate over 329 cacheable calls in week one
---

The voice service ran in Mumbai, while most users, the LLM, embeddings, speech-to-text and the store's API ran in the US. Each LLM request paid about 400 ms of network time and each API round trip about 225 ms, several times per turn.

After the move I wrote three before/after reports on real traffic. The cache added next: a Redis store with fixed expiry, a 1 MiB cap and a fallback to a live call on any Redis fault, with credentials changing the key but never appearing in it. It is live on all three flows.
