---
# A case-study template: copy this file next to it (content/shipped/<project>.md), fill every
# [bracketed] field, delete `draft: true`, and point the project's card in content/shipped.md at
# it with `caseStudy: shipped/<project>`. Drafts never build, so this copy never goes live.
draft: true
layout: case-study
title: "[Project name]"
kind: "[At work / Open source / Side project]"
period: "[Month Year]"
# the page's h1: the outcome with a number, under 65 characters
outcome: "[Outcome with a number, e.g. Voice replies about 1.75 s sooner]"
lead: "[One sentence: who it was for, what changed for them, and the mechanism.]"
description: "[One sentence for search results and link previews.]"
tldr:
  part: "[What I personally designed or built]"
  team: "[Solo, or team of N]"
  when: "[N weeks, Month Year]"
  stack: "[3–5 technologies, plain names]"
  result: "[Number, unit, basis]"
# the heading over the markdown below, which is the problem section
problem: "[A claim naming the problem, e.g. Replies took too long for US callers]"
decisions:
  - chose: "[What I chose, as a sentence]"
    rejected: "[alternative]"
    because: "[reason]"
  - chose: "[What I chose, as a sentence]"
    rejected: "[alternative]"
    because: "[reason]"
# a diagram beside its one-line explanation; src is a path from the site root or a URL
diagram:
  src: static/portfolio/[diagram].svg
  alt: "[What the diagram proves, e.g. requests per region before and after the move]"
  text: "[How the parts fit: the one thing the diagram shows.]"
results:
  - n: "[Number + unit]"
    basis: "[what · percentile · period · sample · observed or estimated]"
  - n: "[Number + unit]"
    basis: "[what · percentile · period · sample · observed or estimated]"
  - n: "[Number + unit]"
    basis: "[what · percentile · period · sample · observed or estimated]"
differently: "[One specific decision I would change, and what I would do instead.]"
# external links get the ↗ mark; a site path (e.g. notes) stays internal
links:
  - text: Read the pull request
    href: "[https://github.com/...]"
  - text: Read the LinkedIn post
    href: "[https://www.linkedin.com/...]"
---

[What was broken or missing, for whom, and how we knew. One number if one exists.]
