---
title: How I work
layout: portfolio
nav: solid
socialTitle: How I work · Shaurya Mehta
description: How I work with coding agents, including the memory store and task list I built for them.
---

## With coding agents

Most of my code now starts in a session with a coding agent, Claude Code or Codex. Agents forget everything between sessions, so I built two tools that remember for them:

- **[apex-memory](https://github.com/Shaurya-GitH/apex-memory):** a knowledge store for AI agents, served over MCP, on SQLite or Postgres. Every decision, contract and finding has one page that owns it, so the next session reads the decision instead of guessing it again.
- **[t3-tasks](https://github.com/Shaurya-GitH/t3-tasks):** a to-do list one level above sessions, kept current by the agents, so work survives a closed terminal.

## From idea to merged

1. **Design first.** A brief, then desktop and phone screens in Figma, approved before any code.
2. **Build to the design.** Where the design is silent, I ask instead of guessing.
3. **One consolidated review.** One review of the whole change; each finding is checked against the code before anything is fixed.
4. **End-to-end tests.** I run the real thing, a browser, an emulator or the API over the wire, and keep before-and-after evidence.
