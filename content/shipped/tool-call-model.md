---
layout: case-study
title: "Echo: tool-call model"
socialTitle: "Echo: tool-call model · Shaurya Mehta"
kind: At work
period: Sep 2026
outcome: "Echo: a 28 ms model that predicts a voice agent's tool calls"
lead: For Echo, The Product Highway's voice-agent platform, I fine-tuned a small model that guesses which lookups a turn will need and starts them before the main LLM asks for them. This page covers what I built, what failed, and what the numbers showed.
description: Fine-tuning GLiNER 2.5 (194M parameters) to predict a voice agent's next tool call, served on a GPU in 28 ms, including the runs that failed.

cover:
  src: tool-call-model/exact-picks.webp
  alt: "Chart: exact tool picks on a frozen 50-turn benchmark. GLiNER 2.5 as released 0 of 50; gpt-4.1 with a compact prompt 17; fine-tuned v1 18; fine-tuned v2 19."

galleryTitle: Architecture and results
gallery:
  - src: tool-call-model/pipeline.webp
    alt: "Diagram: transcript, then GLiNER 2.5, then a gate, then a prefetch call, then the main LLM; if the gate fails, nothing is fired and the LLM calls the tool itself."
    caption: The prediction only ever adds information. If it is unsure, the turn runs exactly as before.
  - src: tool-call-model/replay.webp
    alt: "Chart: time per turn with prediction off and on over six turns of one conversation; four tool turns are 1.4 to 2.7 s faster, the greeting 0.09 s slower."
    caption: Most of the time saved is on the four turns where a prediction landed. Turn 2 changed with no tool involved, so it is model variance.
  - src: tool-call-model/latency.webp
    alt: "Chart: one prediction took about 2,300 ms on a laptop CPU, about 300 ms on a laptop GPU, 61 ms on an L4 GPU and 28 ms on an L4 with fused attention; a small LLM over an API took 1,118 ms."
    caption: All of the speed came from how and where the model ran. Fine-tuning changed nothing about speed.

tldr:
  part: All of it, end to end. I built the baselines, the training data, the fine-tune, the GPU serving and the benchmarks.
  when: Sep 2026
  stack: GLiNER 2.5 (194M), PyTorch, Colab T4 for training, Modal L4 GPUs, FlashDeBERTa
  result: Exact tool picks 0/50 → 18/50 on a fixed benchmark

problem: Each tool call waited for the main LLM to ask for it

decisions:
  - chose: Fine-tune a 194M-parameter encoder (GLiNER 2.5) that reads every tool definition and the message in one pass
    rejected: asking a small LLM to predict the call
    because: "the best small LLM I tested over an API (qwen3.8-flash) took 1,118 ms at the median, gpt-4.1 scored 17/50 and was no better, and a local 4B model never produced a tool call at all"
  - chose: Score against a frozen 50-turn gold set, counting only the tools needed on the first step
    rejected: scoring against the main LLM's own tool calls
    because: "the LLM repeats its own choice on only 34 of 50 turns, and a one-shot guess cannot make a second-step call whose product ID does not exist yet"
  - chose: Serve on an NVIDIA L4 with fused attention (FlashDeBERTa), one request at a time, adding replicas to scale
    rejected: batching requests on one GPU
    because: "batching made this model slower on both Apple and NVIDIA GPUs, while fused attention took one request from 61 ms to 28 ms with all 50 picks unchanged"
  - chose: Keep the full tool definitions in every input, trimmed to 200 characters each
    rejected: caching the tool definitions as a fixed prefix
    because: "the model's attention runs in both directions, so the definitions change with every message. When I masked them to make them cacheable, the model picked the same tool for every message, even a goodbye"

results:
  - n: 28 ms
    basis: per request on an NVIDIA L4 with fused attention · the same 50 requests · 47–68 ms on live inputs
  - n: 0/50 → 18/50
    basis: exact tool picks on a frozen 50-turn gold set · precision 0.74, recall 0.49 · a later checkpoint scored 19/50
  - n: 3 tool calls, not 9
    basis: made by the main LLM over one replayed six-turn conversation, two runs each way · turn time −28%, time to the first word unchanged
  - n: 0 results
    basis: injected by the model as released in Echo's real pipeline over 50 turns · the first fine-tune also made none


links:
  - text: Read the reply-latency case study
    href: shipped/echo-latency
---

In a voice turn the main LLM reads the question, decides it needs a tool, calls it, waits for the result and only then answers. A shopping question often takes two or three of these round trips, and each one delays the whole answer. A small model could guess the lookups first and start them while the rest of the turn is being prepared. Then the results would already be in the LLM's prompt. A wrong guess would cost one wasted API call, never a wrong answer, because the LLM still calls tools itself when it needs them.

I tried the cheap options first. Regex rules fired on only 10 of 49 turns. GLiNER 2.5 is a 194M-parameter model that reads a list of tool definitions and a message in one pass, and it was the option worth fine-tuning. Out of the box it gave nothing useful. In Echo's real pipeline it injected zero tool results over 50 turns, and on the gold benchmark it got the exact tools on 0 of 50 turns.

My first fine-tune failed too. The frozen four-arm benchmark compared no prediction, regex, the released model and the fine-tune: 196 matched turns, graded blind with a second reviewer. The fine-tune made zero usable calls and added about 0.8 s of model time per turn. I set it aside and kept the checkpoint only as a diagnostic: it had trained for only 40 updates, and its dev split overlapped its training data.

Then I rebuilt each part. The new dataset has 7,830 training examples. About 62% are synthetic turns for the store's seven tools, and the rest are public tool-calling data. It is split so that no message family appears in both training and test. The pipeline was giving up after 1.5 s while the model was allowed 4 s, so it threw correct answers away; I made the two limits match. And I moved the model from a CPU to a GPU.

On the frozen benchmark, exact picks rose to 18/50. A second checkpoint scored 19/50; it trained on 10,164 examples, adding turns where a result is already in context. In one six-turn conversation, replayed twice each way, the main LLM made 3 tool calls instead of 9. The whole conversation took 28% less time, but the first word came no sooner.

The limits are plain. The gain rests on one replayed conversation. A GPU kept warm costs about $580–1,020 a month. And in the first end-to-end run on the hosted GPU, 3 of 4 planned calls were dropped as ambiguous: working out which product "it" means is still unsolved.
