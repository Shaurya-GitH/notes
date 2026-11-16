---
layout: case-study
title: "Echo: reply latency"
socialTitle: "Echo: reply latency · Shaurya Mehta"
kind: At work
period: Sep – Oct 2026
outcome: "Echo: the wait before a voice reply fell 41–59%"
lead: Echo is The Product Highway's voice-agent platform. A US store's shopping assistant on it replied slowly. I found why, moved the service from Mumbai to the US, measured the change on real traffic, and added a shared tool cache.
description: Why a voice agent was slow for US users, the region move that fixed it, how it was measured on real traffic, and a shared, flow-scoped Redis tool cache.

cover:
  src: echo-latency/reply-start.webp
  alt: "Chart: median server-side wait before the reply starts, by turn type, before and after the move. Typed with tools 4.93 s to 2.89 s; typed without tools 2.98 to 1.47 s; spoken with tools 6.63 to 3.28 s; spoken without tools 3.07 to 1.26 s."

galleryTitle: Architecture and results
gallery:
  - src: echo-latency/topology.webp
    alt: "Diagram: before, the voice service sat in India while the user's browser, speech-to-text, the LLM and the store API were in the US; after, all of them are in the US, with the service in the store API's region."
    caption: Before the move, every line was an ocean crossing. Network figures are September probes from India; browser round trips are estimates.
  - src: echo-latency/cache.webp
    alt: "Chart: median tool-call time on two store APIs. Store API A: cache hit 9 ms, miss 130 ms. Store API B: hit 10 ms, miss 69 ms."
    caption: A cache hit answers in about 10 ms. A miss costs the same as an uncached call, so turning the cache on adds no visible overhead.

tldr:
  part: "All of it, end to end: I diagnosed the problem, moved the service, measured the change and wrote the tool cache (PR #9)."
  when: Sep – Oct 2026
  stack: Python, Redis, Postgres, AWS regions, OpenAI, Deepgram
  result: Reply start −41% to −59% by turn type (server medians)

problem: Every step of a US user's turn crossed the ocean

decisions:
  - chose: Move the service to the US
    rejected: bringing the models to India
    because: "OpenAI, Azure OpenAI and OpenRouter had no in-region option there for these models. OpenAI's India option stores data in India but runs the model elsewhere"
  - chose: Settle in Ohio, the store API's own region, after one day in Northern California
    rejected: staying in California, nearer the speech-to-text provider
    because: "almost every shopping turn calls the store's API. In the scripted benchmark, tool calls fell from 280 ms to 88 ms and reply start from 2.05 s to 1.64 s, while speech-to-text rose only from 56 to 100 ms"
  - chose: Compare each turn type separately, and keep turns that touched the cache out of the move's numbers
    rejected: one before/after median over all turns
    because: "the mix of typed, spoken and tool turns changed between the two periods, and a single median would credit the cache's savings to the move"
  - chose: Make the cache opt-in per tool, keyed on a SHA-256 of the whole resolved request and scoped to one flow
    rejected: one shared cache, on by default and keyed on the arguments
    because: "two flows must never see each other's results, the arguments alone miss locale, identity and credentials, and a tool that changes state must never be served from a cache"

results:
  - n: −41% to −59%
    basis: server-side reply start by turn type, medians · 1,081 turns (16–23 Sep) vs 228 (29 Sep – 14 Oct 2026) · includes internal test traffic; only 14 spoken turns after the move
  - n: ~1.8 s sooner
    basis: per typed message, weighted at the old tool mix · a descriptive estimate, not a controlled effect
  - n: −43%
    basis: typed replies with tools on one store API only, 4.92 → 2.80 s · so the gain does not come from a change in which API the traffic used
  - n: ~10 ms vs 69–130 ms
    basis: a cache hit vs a live tool call, medians · 26% hit rate over 329 cacheable calls in the cache's first week

links:
  - text: Read the tool-call model case study
    href: shipped/tool-call-model
---

Echo is The Product Highway's voice-agent platform. One of its flows is the shopping assistant on a US e-commerce store. A customer types or speaks a question, and the agent looks up the catalogue, prices and shipping before it answers. In September the replies were slow. When a typed question needed a tool, the reply started after a median of 4.93 s on the server. For a spoken question it was 6.63 s.

The session events showed why. The voice service ran in Mumbai, but the users, the LLM and embeddings, speech-to-text and the store's API were all in the US. So every step of a US user's turn went to India and back. Each LLM request spent about 400 ms on the network and each store API call about 225 ms, and a turn makes several of each. Only text-to-speech already ran near the user.

I moved the service, its Postgres and its Redis to Northern California, and a day later to Ohio, the store API's own region. Then I measured the move on real traffic, not on a benchmark. I read 7,399 sessions through Echo's own API, rebuilt each turn from its server events and compared the wait before the reply's first audio, one turn type at a time. As more data came in I wrote three reports. My first headline figure did not survive that data, so I replaced it with the per-type medians and their sample sizes.

Once the service sat next to the store's API, tool calls were the next cost worth cutting. Customers often ask about the same products and specs. So I added a shared tool cache to Echo (PR #9). A tool opts in with a time-to-live in the flow editor. Results go to Redis with a fixed expiry and a 1 MiB cap, and any Redis fault falls back to a live call. When several callers miss on the same request at once, one fetches and the others wait for its result. Credentials change the cache key but never appear in it. The test suite (240 tests, including real Redis shared across processes) passed, and I turned the cache on for all three of the store's flows.

The caveats stay with the numbers. Most traffic after the move was internal testing. Only 14 spoken turns passed every check. And this compares two periods of real traffic; it is not a controlled test.
