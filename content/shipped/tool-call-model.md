---
# Draft: needs the owner's review, plus media (the benchmark table, an architecture sketch of the
# prefetch stage). Prototype, not shipped: keep it said. Media: quartz/static/shipped/tool-call-model/
draft: true
layout: case-study
title: "Echo: tool-call model"
kind: At work
period: Sep 2026
outcome: "Echo: a 28 ms model that predicts a voice agent's tool calls"
lead: A prototype for Echo. A small model guesses which tools a turn needs and starts them before the main LLM asks, so their results are ready sooner. A wrong guess costs one wasted API call, never a wrong answer.
description: Fine-tuning GLiNER 2.5 to predict a voice agent's next tool call, served on a GPU in 28 ms; a prototype, not shipped.
tldr:
  part: The dataset, fine-tune, GPU serving and the benchmark
  when: Sep 2026
  stack: GLiNER 2.5 (194M), Modal L4 GPUs, FlashDeBERTa
  result: Exact tool picks 0/50 → 18/50 on a fixed benchmark
problem: Each tool call waited for the main LLM to ask for it
decisions:
  - chose: Fine-tune a small model (GLiNER 2.5, 194M parameters) on synthetic turns
    rejected: asking a large LLM for the prediction
    because: gpt-4.1 on a compact prompt scored 17/50, no better, and would put another LLM call in the hot path
  - chose: Grade on a frozen 50-turn gold set, blind, with an LLM judge and a second-reviewer check
    rejected: judging live calls by eye
    because: the first fine-tune looked fine and failed its benchmark, with no usable prefetch calls and turns about 0.8 s slower
  - chose: Patch in fused attention (FlashDeBERTa)
    rejected: stock PyTorch serving
    because: it took a request from 61 ms to 28 ms on the same GPU
results:
  - n: 28 ms
    basis: per request on a Mumbai L4 · 47–68 ms on live inputs · same 50 requests
  - n: 0/50 → 18/50
    basis: exact tool picks, fixed 50-turn gold set · precision 0.74, recall 0.49
  - n: 3 tool calls, not 9
    basis: the main LLM, one replayed six-turn conversation · turn time −28%, time to first word unchanged
---

In a voice turn the main LLM reads the request, decides it needs a tool, calls it, waits, and only then answers. Starting likely tools early hides that wait. I tried regex rules and a zero-shot model first, then fine-tuned GLiNER 2.5.

One L4 handles about 12 requests a second, roughly 50–100 concurrent voice calls. It is a prototype: it hasn't shipped.
