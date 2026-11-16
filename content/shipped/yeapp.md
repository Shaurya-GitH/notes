---
# Draft: needs the owner's review, plus media (app screenshots or a screen recording of the voice
# tour and a pre-join message) and usage numbers if any. Media: quartz/static/shipped/yeapp/
draft: true
layout: case-study
title: YEAPP
kind: At work
period: Jul – Sep 2026
outcome: My parts of YEAPP, KRAFTON India's voice-first messenger
lead: "One of four engineers. I built the AI companion's vendor failover, the voice-onboarding pipeline and pre-join messages: write to a contact who isn't on the app yet, delivered when they sign up."
description: "My parts of YEAPP, KRAFTON India's voice-first messenger: companion vendor failover, the voice-onboarding pipeline and pre-join messages."
tldr:
  part: Companion failover, voice-onboarding pipeline, pre-join messages, sticker search cache
  team: 4 engineers
  when: 29 Jul – 30 Sep 2026
  stack: React Native, Node.js, BullMQ, Redis, Postgres, Whisper
  result: Failover on the first error · 0 lost writes across 3 replicas
problem: The companion's backup LLM vendor never took over
decisions:
  - chose: Keep per-request failures (an empty body, a schema reject) off the vendor's circuit breaker
    rejected: counting every failure against the vendor
    because: one bad response would take a healthy vendor out of rotation
  - chose: Lock only the clip index write with a Redis mutex, so renders still fan out across replicas
    rejected: a queue concurrency of 1
    because: BullMQ's concurrency is per instance, not per queue, so three replicas could still overwrite each other
  - chose: Attach a sender's voice note to an invite video only once the server marks it ready
    rejected: trusting the app's state
    because: a mid-render race could attach one chat's private voice note to another chat's invite
results:
  - n: Failover on the first error
    basis: live test against the vendor API · 0 ms skip while open, a probe after 15 s, then recovery · on production
  - n: 58 clips
    basis: synthesized, transcoded and word-aligned with Whisper for karaoke captions · runs in production behind a flag
  - n: 0 lost writes
    basis: 3 worker replicas, live; 8 concurrent writers in a unit test with a negative control
---

The companion had a fallback chain on paper. In practice a 30-second breaker at the router ended the walk before the second vendor was tried, and the vendor adapters returned an error value instead of throwing, so their circuits never opened. I fixed both, added a second vendor in case the first ran out of credit, and verified it live.

## A voice tour that changes without an app release

The AI companion teaches new users the app in a chat. I moved its script and voice clips from the app bundle to the backend: queued jobs synthesize each clip, transcode it, align every word with Whisper for captions, and publish it to a CDN.

## Messages that wait for a friend to join

A user can message a contact who isn't on the app yet. The message is held and delivered when the contact signs up, and the sender's first voice note is rendered into the invite video. It is live on Android.
