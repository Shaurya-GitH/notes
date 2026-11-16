---
title: How I work
layout: portfolio
nav: solid
socialTitle: How I work · Shaurya Mehta
description: I work with a fleet of coding agents, and I built the system they run in. An alert or an idea goes in. A tested fix comes out, with the evidence. Agents never ship; I do.

work:
  stats:
    - n: "30"
      basis: skills in my stack, one for each job
    - n: "18"
      basis: production alerts my triage agent worked through in its first week
    - n: "11"
      basis: business systems my MCP server opens to every session
    - n: "10"
      basis: knowledge bases in the one memory store every agent shares

  loop:
    heading: One loop for every bug and every feature
    text: Two ways in, one way through. Every step runs in its own session, and every session can see the business and remember what came before.
    starts:
      - k: A bug
        title: An alert lands in Slack
        text: My triage agent picks it up, reproduces it on real systems and posts the cause, the impact and a fix in the thread.
      - k: A feature
        title: An idea or a ticket
        text: Desktop and phone designs in Figma first, then the rules agreed in writing before any code.
    steps:
      - title: Plan
        text: Three reviews attack the plan before code exists. Is it sound, does it do the job, does it fit the other plans?
      - title: Build
        text: Each sub-feature in its own git worktree, so parallel sessions never collide.
      - title: Verify
        text: Each repo has its own verify skill. It starts the code on its own ports and databases and drives it.
      - title: Review
        text: A second model, Codex, reviews the whole sub-feature. It checks every finding against the code and fixes only what holds.
      - title: End to end
        text: A real browser, emulator or API call, with before-and-after evidence. Fix, rerun, until it passes.
      - title: I ship
        text: Agents stop at "fix ready". I read the evidence, then I push.
    rails:
      - title: apex-memory
        text: every step reads the decisions and writes down what it learned
      - title: My MCP server
        text: every step can see errors, logs, databases, analytics and sales
      - title: S3 Code
        text: every session sits under a task on one board

  tools:
    heading: The tools I built for it
    text: Agents forget, collide and guess. Each of these fixes one of those.
    items:
      - k: Triage agent
        title: Alerts answered before I open Slack
        text: "Sentry posts error, crash and slow-page alerts to Slack. Twice a day my agent reads them and opens one Claude session per alert. Each session reproduces the error through my MCP server: errors, logs, both databases and analytics. It replies in the alert's thread with the cause, who it hit, how sure it is and the fix, and tracks the alert in a sheet until it ships. When I say go, it fixes it on its own branch and runs the review and end-to-end checks."
        metric: 18 alerts in the first week, each with a cause and a proposed fix
        basis: Slack, Sentry, Google Sheets, Claude sessions on a schedule
        wide: true
      - k: MCP server
        title: Every session sees the business
        text: The server I built for the founder is also every agent's window into the business. Triage reads errors and logs through it. Feature sessions check real figures and test changes against it.
        metric: 12 tools over 11 systems
        basis: sales, catalogue, ads, analytics, errors and logs
        link:
          text: Case study
          href: shipped/business-mcp
      - k: S3 Code
        title: My own build of T3 Code
        text: The desktop app every session runs in, forked and extended. A task board sits above the sessions, tasks get folders and colours, and a session reopens its task when you talk to it again. A release pipeline builds and signs the macOS app with an installer.
        metric: 28 commits on my fork
        basis: tasks, sidebar, release pipeline
        link:
          text: See the fork
          href: https://github.com/Shaurya-GitH/t3code
      - k: Memory
        title: apex-memory
        text: One knowledge store that Claude Code and Codex share. Every decision has one page that owns it, so the next session reads the decision instead of guessing it again.
        metric: 49 tool calls instead of 141
        basis: the same 7 tasks, with and without it
        link:
          text: Case study
          href: shipped/apex-memory
      - k: Tasks
        title: t3-tasks
        text: A to-do list one level above sessions. Agents link their session to a task, keep its status true and suggest new ones, so work survives a closed terminal.
        link:
          text: Read the code
          href: https://github.com/Shaurya-GitH/t3-tasks
      - k: Verification
        title: A verify skill for every repo
        text: Each repo has a skill that starts it from any worktree on its own ports, with its own databases and seeded sign-ins, drives it like a user would and saves before-and-after evidence. An agent proves a fix on the same path the bug took.
        metric: 4 repos, each provable from any branch
        basis: backend, services, website and CMS
      - k: Alerts
        title: Alerts that mean something
        text: The slow-page alert used to average every browser span. I rebuilt it to watch what visitors feel, the largest paint on product pages. Service logs ship to CloudWatch, and an hourly memory log caught the leak that crashed the store.
        metric: 0 restarts after the leak fix
        basis: memory flat near 533 MB, against 1,146 MB before

  skills:
    heading: My skill stack
    text: A skill is a written procedure an agent loads for one job. I keep one for each job, so a session never improvises how to plan, test or review.
    groups:
      - title: Plan
        text: Attack a plan, or a whole set of plans, for gaps before anyone builds.
        names: [plan-review, plan-review-technical, plan-review-functional, plan-set-review]
      - title: Backend
        text: Take a feature from agreed rules to tested branches, one sub-feature at a time, then check the branches fit together.
        names: [feature-workflow, implementation-set-review]
      - title: Verify
        text: A verify skill for each repo starts it from any worktree on its own ports and databases. The end-to-end skills drive it like a user.
        names: [api-e2e-test, admin-e2e-test, app-e2e-test, android-rig]
      - title: Review
        text: Hunt defects, check the change against its plan, then fix only what holds.
        names: [sol-review, code-review-sweep, code-review-request, code-review-fix]
      - title: Frontend
        text: Distinctive interfaces, a design system and a review rubric.
        names: [frontend-design, tph-design, ui-ux-pro-max]
      - title: Motion graphics
        text: Animated explainers and interface motion.
      - title: Image generation
        text: Images made to an art direction, like the paintings on this site.
      - title: Writing
        text: Docs in Simplified Technical English, explanations top down, and posts.
        names: [ste100-writer, explaining-systems-top-down, writing-x-posts]

  reach:
    heading: What the agents can reach
    text: Each one is an MCP server, so any session can use it.
    items:
      - title: My MCP server
        text: The business itself, read and change, with a preview before every change
      - title: apex-memory
        text: The decisions, contracts and findings of every project
      - title: Chrome DevTools
        text: Lighthouse audits, performance traces and network logs, headless
      - title: Playwright
        text: Real browsers for end-to-end tests
      - title: Figma
        text: The designs, read before code and written from it
      - title: Sentry
        text: Errors, traces, replays and the alert rules
      - title: Slack
        text: Alert threads in, findings out
      - title: ClickUp
        text: The tickets the work comes from

  rules:
    heading: Rules every session follows
    items:
      - title: Design before code
        text: Screens approved in Figma first. Where the design is silent, the agent asks.
      - title: Nothing is done until it ran
        text: Every feature runs end to end on real systems, never production, before anyone calls it done.
      - title: One review per sub-feature
        text: One review of the whole change by a second model, never per task, and every finding is checked first.
      - title: Only I ship
        text: No agent pushes, merges or deploys. They hand me the branch and the evidence.
---
