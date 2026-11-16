---
layout: case-study
title: Alfred-OS
socialTitle: Alfred-OS · Shaurya Mehta
kind: Side projects
period: Sep 2026
outcome: "Alfred-OS: say it, and your Mac does it"
lead: A voice-driven macOS agent, built in one day by a team of three at the Claude Community Opus Build Day in Bangalore. I built the voice input, the background tasks and the spoken confirmations.
description: A voice-driven macOS agent built in a day by a team of three; my part was the voice input, background tasks and confirmations.

cover:
  src: alfred-os/demo-poster.jpg
  alt: Alfred-OS running four tasks at once, each in its own card

video:
  - src: alfred-os/demo.mp4
    poster: alfred-os/demo-poster-command.jpg
    title: "Alfred-OS demo: one sentence, four tasks at once"
    duration: "0:36"

gallery:
  - src: alfred-os/architecture.webp
    alt: "Alfred-OS architecture: the app, the orchestrator, the agents, and the Mac and the web"
    caption: One sentence in, finished tasks out. My part is the app column and the task API.

tldr:
  part: Hold-to-talk voice input and speech-to-text, background tasks with live progress, spoken confirmations, and moving the browser agent onto Claude (2 merged PRs)
  team: Three engineers, one day
  when: Sep 2026
  stack: Electron, FastAPI, Python, Deepgram, Claude Opus 5 and Haiku 4.5, Playwright over MCP
  result: Simple commands done in 3–5 s on the demo Mac

problem: Most assistants talk; this one had to act, and never block the next command

decisions:
  - chose: Run speech-to-text in Electron's main process
    rejected: calling the speech API from the page
    because: the API keys then never reach the page
  - chose: Answer every command at once (202) and do the work in the background, streaming each step
    rejected: one request that waits for the task to finish
    because: a two-minute browser task must never block the next thing you say
  - chose: Only a whole "yes" or "no" answers a pending question
    rejected: treating any reply as an answer
    because: '"Okay, open Safari" should start a new task, not approve a purchase'

results:
  - n: 3.2 s
    basis: '"Lower the volume", from speaking to done, on the demo Mac'
  - n: 5.0 s
    basis: '"What is the latest stable Python release?", answered by the browser agent'
  - n: 0.8 s
    basis: to ask before deleting files; nothing irreversible runs without a yes

links:
  - text: Read my pull requests
    href: https://github.com/sainitishmitta04/Alfred-OS/pulls?q=is%3Apr+author%3AShaurya-GitH
  - text: Watch the demo on LinkedIn
    href: https://www.linkedin.com/feed/update/urn:li:activity:7511099366246535168/
---

Tap ⌥Space, say "tidy my desktop, play some jazz, order a pizza and plan my day", and Alfred-OS runs all four at once: a small, fast model decides which agent takes each task and whether it is destructive, then Claude agents do the work on the Mac and in a real browser.

My part was everything between your voice and the orchestrator. The overlay records you, speech-to-text turns it into text in about 0.6 s, and the task API answers at once while the work runs in the background. The overlay says "On it", shows a toast when a task is done, and keeps an agent's question on screen until you answer it with a button or a spoken yes or no. A tray window lists every task with its live steps. In a second PR I moved the browser agent onto Claude Opus 5, routed note requests to the desktop agent, and wrote the demo guide.

The demo reel has music and no narration; everything it says is on screen.
