---
layout: case-study
title: YEAPP
socialTitle: "YEAPP · Shaurya Mehta"
kind: At work
period: Jul – Sep 2026
outcome: "YEAPP: a 58-clip voice tour that changed without an app release"
lead: "As one of four engineers on KRAFTON India's voice-first messenger, I built the pipeline behind its voice-guided tour, messages that wait for a friend to join, and the AI companion's LLM vendor failover."
description: "My parts of YEAPP, KRAFTON India's voice-first messenger: the voice tour's clip pipeline, pre-join messages and the AI companion's vendor failover."

# the architecture first, then the write-up (the card's cover is set in content/shipped.md)
mediaFirst: true
galleryTitle: Architecture

gallery:
  - src: yeapp/architecture.webp
    alt: "Three pipelines: voice tour clips from an admin edit to the app, a held message from sender to delivery at sign-up, and the companion's vendor chain with circuit breakers"
    caption: The three pipelines I built. Teal marks where the fix or the guard lives; gold marks what the user sees.

tldr:
  part: The voice tour's clip pipeline, pre-join messages, the companion's LLM failover, a sticker search cache
  team: One of four engineers
  when: 29 Jul – 30 Sep 2026
  stack: React Native, NestJS, BullMQ, Redis, Postgres, Whisper
  result: Failover on the first error · 0 lost writes across 3 replicas

problem: New users arrived to an empty, silent app

decisions:
  - chose: Count only vendor outages against a vendor's circuit breaker; an empty reply or a rejected schema still moves to the next vendor but is not counted
    rejected: counting every failed request
    because: the breaker opens on one counted failure, so one user's bad request would cut a healthy vendor off for everyone
  - chose: Lock only the clip index write with a Redis lock, so renders still run in parallel across replicas
    rejected: a queue concurrency of 1
    because: "BullMQ's concurrency is per worker, not per queue, so three replicas could still overwrite the one index file, and running renders one at a time would stretch the first 58-clip render from about a minute to several"
  - chose: Refuse a copy edit that no longer matches its recorded clip
    rejected: saving the edit and fixing the audio later
    because: the caption timings come from the audio, so the captions would drift out of sync and only a user watching would notice
  - chose: Serve the invite video that carries a sender's voice note only once its render is ready
    rejected: serving the last finished render, as the other invite videos do
    because: a race during a render could attach one chat's private voice note to another chat's invite

results:
  - n: First failure
    basis: the companion moves to the second vendor on the first failed call, skips a down vendor in 0 ms while its circuit is open, and tries it again after 15 s · live test against the vendor's API · shipped to production
  - n: 58 clips
    basis: synthesized, transcoded and aligned word by word with Whisper by queued jobs · shipped to production behind a rollout flag
  - n: 0 lost writes
    basis: index updates during a render burst across 3 live worker replicas; a unit test with 8 concurrent writers fails if the lock is turned off

differently: I would store the clip index as one entry per clip instead of one JSON file. Every render rewrites that one file, which is the only reason the renders needed a lock.
---

YEAPP was KRAFTON India's voice-first messenger: you talked instead of typing, and Ziggy, an AI companion, talked back. The team had shipped it to the Play Store before I joined in late July. In a new user's first minutes, nobody they knew was on the app yet, and the tour that taught it was built into the app, so changing a line or a voice meant shipping a new version of the app.

## A voice tour that changed without an app release

Ziggy taught a new user the app in a chat, by voice, with captions that lit up word by word. I moved the tour's script and voice clips from the app to the backend. Queued jobs synthesize each of the 58 clips, transcode it, align every word with Whisper and publish the audio to a CDN under a content hash. An admin can edit a line or upload a recording by a person instead, which runs the same pipeline without the speech synthesis. The tour shipped to production behind a rollout flag, with a kill switch.

## Messages that wait for a friend to join

The app listed contacts who weren't on YEAPP yet and let you message them. The server held the messages, within a limit and an expiry set from the admin console, and delivered them when the contact finished signing up. If the first message was a voice note, it went into the invite video the sender shared. I fixed the 12 issues QA found on it. It shipped on Android; the iOS build was still in test in mid-October.

## A backup vendor that took over

The companion had a fallback chain in its config, but it never took over. A 30-second breaker around the whole chain gave up before the second vendor was tried, and the vendor adapters returned an error value instead of throwing, so their circuits never opened. I fixed both, set up a second vendor in case the first ran out of credit, and tested the failure path live.

## Stickers

Sticker search returned results as you typed, from a Redis cache that every write cleared (shipped to production). Two sticker pipelines stayed unshipped: auto-tagging stock stickers with a vision model, and a proof of concept that turns sticker videos into animated WebP with a transparent background.
