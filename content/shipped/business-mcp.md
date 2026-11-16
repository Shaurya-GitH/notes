---
layout: case-study
title: Business MCP server
socialTitle: Business MCP server · Shaurya Mehta
kind: At work
period: Oct – Nov 2026
outcome: "A founder runs sales, product, marketing and tech from a chat with Claude"
lead: An MCP server for a US e-commerce company. Its founder asks Claude about any figure in the business and changes products, prices, stock and purchase orders in plain English. Every number names its source, and every change waits for a preview and a yes. I designed and built it at The Product Highway.
description: An MCP server that lets an e-commerce founder query and change sales, catalogue, ads and site health from Claude, with role-based access and preview-then-confirm writes.

cover:
  src: business-mcp/architecture.webp
  alt: "Architecture: Claude apps call 12 MCP tools; a guard applies roles, masking and the audit log; adapters grouped as sales and ops, product, marketing and tech reach the operations system, store database, CMS, Merchant Center, four ad platforms, Mixpanel, Sentry and CloudWatch"

galleryTitle: How it works
gallery:
  - src: business-mcp/what-you-can-ask.webp
    alt: "A grid of example questions and change requests in four columns: sales and ops, product, marketing and tech. Names and values anonymised"
    caption: Questions from the company's own brief and the end-to-end test plan. Reads come back at once; changes are for operators and wait for a yes.
  - src: business-mcp/preview-confirm.webp
    alt: "A Claude conversation beside the server calls behind it: run_action returns a before-and-after preview and a one-time code, the founder says yes, then confirm_action applies the change. Product, ids and code anonymised"
    caption: A real session on a test product. The preview changes nothing, and the code works once.
  - src: business-mcp/sourced-answer.webp
    alt: "A Claude answer comparing ROAS from Google Ads and from store data, naming each source, window, time zone and definition, beside the provenance the server returned. Figures anonymised"
    caption: A real answer for the marketing role. Two sources, two definitions, kept apart and named.

tldr:
  part: "All of it, end to end: the design and the whole server (12 tools, the adapter contract and its adapters, sign-in, roles and masking, previews and confirmations, the audit log, jobs and the health check), plus the store-side routes it writes through (403 + 96 commits)"
  when: Oct – Nov 2026
  stack: Kotlin, Spring Boot, MCP over HTTP with OAuth, MongoDB, PostgreSQL, NestJS, the Google Ads, Meta, TikTok, Reddit and Merchant APIs, the Mixpanel, TikTok and Sentry MCP servers, CloudWatch Logs
  result: "57/57 end-to-end scenarios across all four roles and 2,923 tests passing"

problem: The answers were spread over eleven systems

decisions:
  - chose: A searchable catalog behind a few tools (find_metric, then get_metric with one entry)
    rejected: one MCP tool per backend endpoint
    because: about 160 undocumented read endpoints would be too many tools for Claude to choose from; a new figure is now a catalog entry, not a tool
  - chose: Plug the vendors' own MCP servers (Mixpanel, TikTok, Sentry) in as one more adapter behind the same search and guard
    rejected: passing their tools straight through as extra MCP tools
    because: it would put Mixpanel's 66 and TikTok's ~400 tools into Claude's context and give two approval models
  - chose: Copy every definition from the operations system's own backend code; where its dashboard computed a figure in the browser, move that calculation into the backend
    rejected: defining the figures again for the server, or letting Claude work them out from rows
    because: the founder must see the same number in Claude as on the dashboard
  - chose: Confirm every change through a separate tool that the Claude app holds for the person's click
    rejected: a rule in the tool text telling Claude to ask first
    because: in scripted runs the rule alone let 3 of 10 "just do it" requests through in the same reply

results:
  - n: 57/57
    basis: "end-to-end scenarios across all four roles: reads, refusals, masking, previews and applied changes, real logs and Sentry · Nov 2026, after fixing the 2 defects they found"
  - n: 0 of 18
    basis: 'first replies that changed data when the person said "just do it", with confirming in its own tool · 3 of 10 with the rule only in the tool text · scripted headless Claude runs, Nov 2026'
  - n: "2,923"
    basis: "automated tests, 0 failures: the full backend suite, Nov 2026 · about 2,000 of them in the server's and health checks' own test folders"
  - n: 187 + 243
    basis: "operations in its own catalog (74 of them change data) plus pinned read-only vendor tools, all behind 12 MCP tools · counted from the code, 16 Nov 2026"
---

The founder ran the company from an internal operations dashboard, a CMS, Google Merchant Center, four ad platforms, Mixpanel and Sentry. A question such as "which campaigns made money last week?" meant opening several of them and matching definitions by hand, and some figures existed only in the dashboard's browser code. Changes, from entering a purchase order to fixing a product's Merchant Center data, went through screens or through the team.

## What it does

The server lives inside the company's operations backend and speaks MCP, so the founder adds it to claude.ai, Claude Desktop or Claude Code and signs in with a personal key. Then, by business area:

- **Sales and operations:** sales, gross profit and order value per country against last week; per-product economics and a margin ranking; stock, what is on order, purchase orders and supplier offers; orders and payments from the store's database; refund, fraud and return cases.
- **Product:** the whole catalogue in the CMS (products, prices, content, specs, media, variants, FAQs, warranties, stock per warehouse, site content) and Merchant Center, including why a product is disapproved and Google's own fix.
- **Marketing:** spend, clicks and conversions from Google, Meta, TikTok and Reddit, each with its own conversion definition; channel and campaign profit; Mixpanel funnels and events. The company's agency has its own read-only role.
- **Tech:** Sentry issues and events, the store's request, payment and error logs, and a daily health check of 26 checks over rendering, SEO, Merchant Center, catalogue content, payments and vendor changes.

## How it's built

Twelve tools sit in front of a searchable catalog. Claude searches with `find_metric`, then calls `get_metric` with one entry and only its declared parameters. For anything the catalog lacks, `describe_data` and `run_query` run one validated, read-only query. Every source is behind one adapter contract, so a new system is a new adapter, not a new tool. Each result carries its provenance: source, definition, time zone, currency and freshness. The server tells Claude never to recompute a figure or add up rows whose definitions differ.

A guard wraps every adapter and applies the person's role: viewer, analyst, marketing or operator. Without the right permission, personal columns are dropped or hashed, and cost and margin columns are dropped. Only an operator can change data, and each change takes two calls. `run_action` returns the record before and after, any warnings and a one-time code, valid for ten minutes and bound to that person, action and values. `confirm_action` applies it in a later reply. Every call goes to an audit log with personal values hashed, and a change is refused if its intent cannot be recorded first. When an answer goes wrong, Claude logs it to a feedback store that only the owner reads.

Scripted Claude sessions for every role (60, then 14 more) found two personal-data leaks in payment log lines: a shipping name and billing addresses. I fixed both in the masker and checked them again.

## How I built it

I designed it with the founder, then built the server and the store-side routes it writes through, end to end. I work with coding agents: Claude Code for the build, Codex for an independent review of each finished sub-feature.
