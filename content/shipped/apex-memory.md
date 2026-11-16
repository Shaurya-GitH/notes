---
layout: case-study
title: apex-memory
socialTitle: apex-memory · Shaurya Mehta
kind: Side projects
period: Oct – Nov 2026
outcome: "apex-memory: the same tasks in 49 tool calls, not 141"
lead: An open-source memory store that Claude Code and Codex share across sessions. Notes live in SQLite or Postgres, agents reach them through MCP, and every write is checked before it commits. It holds the knowledge for my side projects and my client work.
description: An open-source, MCP-based memory store for AI coding agents, with version-checked, all-or-nothing writes on SQLite or Postgres.

cover:
  src: apex-memory/architecture.webp
  alt: "apex-memory architecture: Claude Code, Codex and worker agents call 19 MCP tools; the store checks each write in one transaction; SQLite or Postgres holds the data"

galleryTitle: How it works
gallery:
  - src: apex-memory/refusals.webp
    alt: "Terminal output: two agents read the same section; the second write is refused with version_conflict, and a write with a broken link is refused with check_failed"
    caption: Two agents, one section. The late write gets the newer text back to merge, and a broken link rolls the whole write back.
  - src: apex-memory/brief.webp
    alt: "Terminal output of brief for a demo domain: check status, the index catalog, preferences, decisions, open status items and the latest log entry"
    caption: One call gives an agent its starting context, so it reads one section next instead of whole pages.
  - src: apex-memory/tests.webp
    alt: "Terminal output: 87 tests pass on SQLite with 86 Postgres tests skipped, then 171 pass on SQLite and Postgres 17 with 2 skipped"
    caption: The public v0.2.1 suite on both databases, run locally on 16 Nov 2026.

tldr:
  part: All of it. The design, the store and its checks, 19 MCP tools, the SQLite and Postgres backends, and the move off Obsidian
  team: Solo; written with Claude Code, reviewed with Codex
  when: "Oct – Nov 2026: live on 12 Oct, public on 30 Oct, v0.3.0 on 16 Nov"
  stack: Python 3.12, MCP, SQLite (FTS5), Postgres
  result: 49 tool calls vs 141 and 14/14 correct vs 13/14, on the same 7 tasks

problem: My agents' memory was a notes vault, and it failed in three ways

decisions:
  - chose: Keep knowledge only in a database, behind MCP tools, with no markdown copy
    rejected: markdown files in git with a SQLite index built from them
    because: I never opened the old vault to read it, so a second copy would have no reader and could drift
  - chose: Make every write one transaction that runs the check and rolls back on any new problem
    rejected: separate writes for the note, the index and the log, checked by hand at the end
    because: a half-finished update left pages missing from the index and links pointing nowhere
  - chose: Let agents edit one section at a time, with a version check
    rejected: writing whole notes, last write wins
    because: two agents on one page must not erase each other's work; the refusal returns the newer text to merge
  - chose: Build a curated store for decisions, status and history
    rejected: a memory service such as Mem0 or Supermemory
    because: '"newest fact wins" is wrong for decisions, where the latest statement is often only a proposal'

results:
  - n: 49 vs 141
    basis: "tool calls for the same 7 knowledge tasks, 2 runs each, store vs the Obsidian setup · also 14/14 vs 13/14 correct, 160 s vs 615 s · headless Claude Code, graded by script, 12 Oct 2026"
  - n: 0.77%
    basis: "of all new context tokens came from the store · 3,515 Claude Code sessions over 21 days, 245 of them used it · file reads, search and shell output: 11.9% · observed, measured 30 Oct 2026"
  - n: 153 pages
    basis: "in 10 domains: knowledge bases for my side projects and client work, plus the store's own failure log · list_domains, 16 Nov 2026"


links:
  - text: Read the code on GitHub
    href: https://github.com/Shaurya-GitH/apex-memory
  - text: Read how the token cost was measured
    href: https://github.com/Shaurya-GitH/apex-memory#token-cost
---

From mid-September 2026, my coding agents kept a client project's decisions in an Obsidian vault reached over MCP: 50 notes, about 184,000 words and 281 log entries in four weeks. The method worked: corrections survived restarts, and every decision had one home. The tool did not.

- **It was not always there.** For one whole session the server pointed at the wrong vault, so nothing could be written.
- **Updates were not atomic.** Editing a note, updating the index and appending to the log were three writes, so an interrupted update left the vault half-changed.
- **Search did not rank.** It matched words without weighting them, so agents read files directly instead.

I kept the method and replaced the tool. apex-memory stores notes as sections with ids and versions. An agent reads one section and patches it with the version it read. Each write runs the check for broken links, notes missing from the index, duplicate paragraphs and malformed decision records. If the write adds a problem, it rolls back and the agent is told why. The log is append-only, and a decision is superseded, never deleted.

On 12 Oct 2026 every knowledge base moved in, and every refusal and error since then lands in a `memory-ops` domain. Its first 16 days held about 60 refusals and 17 agent reports, and they became v0.2.0: a `batch` tool, smarter checks and suggestions for headings that are not found. On 30 Oct I moved the code out of a private project into its own MIT repository. There it sits behind a small `Backend` interface, with SQLite and Postgres passing the same tests.
