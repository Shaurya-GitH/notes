---
title: Shaurya Mehta
layout: portfolio
socialTitle: Shaurya Mehta · AI Engineer
description: Full-stack, applied AI engineer building AI agents and apps that scale and stay secure, with DevOps and security depth and the notes to show how it all works.
# who this site belongs to, for search engines (schema.org Person on the home page)
person:
  name: Shaurya Mehta
  jobTitle: AI Engineer
  worksFor:
    "@type": Organization
    name: The Product Highway
  sameAs:
    - https://www.linkedin.com/in/shaurya-mehta-0b916a349/
    - https://github.com/Shaurya-GitH
    - https://x.com/ShauryaCODE
    - https://leetcode.com/ShauryaLC
# the home hub (PortfolioHome.tsx). Copy is the redesign's (copy v10); a section whose data is
# empty does not render
home:
  headline: I build AI agents and apps that scale and stay secure.
  lede: I'm a problem solver first. I follow a problem from the servers on AWS all the way up to the product.
  role: Software engineer at The Product Highway, Bangalore
  chip:
    before: Fix merged into
    strong: Keycloak
    after: ", Oct 2026"
    href: https://github.com/keycloak/keycloak/pull/54078
  # the handwritten note beside the hero, shown only while the ink cursor runs
  brush: every system has another side. paint to find it.
  proof:
    - initials: KC
      label: Merged into Keycloak, the open-source identity server
      title: Login no longer offers organizations you can't use
      href: https://github.com/keycloak/keycloak/pull/54078
      why: The organization picker listed disabled organizations, and choosing one reloaded the page with no message. I filtered them out and added a test that fails without the fix.
      meta: "PR #54078 · merged Oct 2026 · repo has 37.9k stars (Nov 2026)"
    - initials: LP
      label: Merged into Loop, an open-source agent harness in Rust
      title: No more 404s from batch-only models
      href: https://github.com/soketlabs/loop/pull/64
      # `:batch` renders as code, as in the design
      why: "OpenRouter's `:batch` models (78 at the time) failed every prompt with a 404. The provider preset now hides them, and a test fails without the fix."
      meta: "PR #64 · merged Nov 2026"
  recommendation:
    quote: He has a solid understanding of web services, security mechanisms, end-to-end protection, and the fundamental concepts of encryption and decryption.
    name: Azad Singh Kalakoti
    role: Project Lead at SBS · my architect there · Oct 2026
    # the recommender's photo, only with his permission (empty: an empty circle)
    photo:
    href: https://www.linkedin.com/in/shaurya-mehta-0b916a349/details/recommendations/
  awards:
    heading: Two awards in my year at SBS
    lede: One for a single client delivery, one for the year's work.
    list:
      - initials: SP
        issuer: SBS · Sep 2025
        title: Spot Award
        cite: For contributing to the end-to-end client delivery of Wero's peer-to-peer payments management feature.
        text: "Wero is the European Payments Initiative's wallet for sending money to people and paying shops. During the client delivery I worked on the whole peer-to-peer payments management feature end to end: I built the payment-cancellation step, tested the feature end to end with JMeter, and fixed every bug the testing found, hotfixes included."
        photo: spot-photo
        alt: The Spot Award kit from SBS, a black leather wallet, a pen and an SBS keyring in a gift box
        href: https://www.linkedin.com/in/shaurya-mehta-0b916a349/details/honors/
      - initials: KA
        issuer: SBS · Apr 2026
        title: Kalam Award
        cite: "“In recognition of your dedication and perseverance.”"
        text: Over the year I built the security and infrastructure foundations of an Open Banking platform for European payments (EPI and PSD2). I designed shared services that create and validate request signatures and wired them into every API, validated QWAC certificates at the API gateway, and ran security reviews against the EPI and PSD2 standards. On the infrastructure side I added Invicti security scanning to the pipelines for the consent apps and Keycloak extensions, stabilised the deployment pipelines, and built a stateful WireMock framework so integrations could be tested realistically.
        photo: kalam-photo
        alt: The Kalam Award, a glass trophy engraved with the SBS logo, “Kalam Award”, “Congratulations” and “In recognition of your dedication and perseverance”
        href: https://www.linkedin.com/in/shaurya-mehta-0b916a349/details/honors/
  branches:
    heading: Pick a painting.
    list:
      - title: Journey
        text: Invoicing software, then Open Banking APIs for European banks, a pre-seed marketplace, and voice agents for US shoppers.
        go: Read the journey
        to: journey
        art: field
      - title: Shipped
        text: AI agents running on real traffic, Open Banking APIs live at European banks, and two fixes merged into open source.
        go: See what I've shipped
        to: shipped
        art: harbour
      - title: How I work
        text: A team of AI agents that reviews, pushes back on and tests its own work, and the tools I built for it.
        go: See how I work
        to: how-i-work
        art: studio
      - title: Notes
        text: "Rate limiting, caching, HSMs, Kubernetes: notes I wrote to understand why things work."
        go: Browse the notes
        to: notes
        art: sky-alt
  # the posts slideshow: the owner's own LinkedIn and X posts, newest first, shown with the official
  # embeds (a link card stands in until an embed loads, or if it fails). Each post:
  # { network: linkedin | x, url: the post's own address, date: Month Year, about: a few words on
  # what the post is about (the embed's accessible name and the link card's title) }
  posts:
    heading: What I've been writing.
    lede: Recent posts from LinkedIn and X.
    all: See all posts on LinkedIn
    allHref: https://www.linkedin.com/in/shaurya-mehta-0b916a349/recent-activity/all/
    list:
      - network: x
        url: https://x.com/ShauryaCODE/status/2120892918827499909
        date: Nov 2026
        about: A kanban board in my T3 Code fork
      - network: linkedin
        url: https://www.linkedin.com/feed/update/urn:li:activity:7516079159048302592/
        date: Oct 2026
        about: Why I rebuilt my coding agents' memory on SQLite
      - network: linkedin
        url: https://www.linkedin.com/feed/update/urn:li:activity:7511099366246535168/
        date: Sep 2026
        about: Alfred OS, built at the Claude Community Opus Build Day
      - network: linkedin
        url: https://www.linkedin.com/feed/update/urn:li:activity:7510358238475956224/
        date: Sep 2026
        about: A year on Open Banking at SBS
  contact:
    heading: Building something with AI agents?
    text: I work full time at The Product Highway, and I'm always happy to talk about agents, voice AI and the infrastructure that keeps them fast and secure.
    # the address the "Email me" and "Copy email" buttons use; empty hides both until the owner
    # confirms which email to show
    email: mehta.shaurya123@gmail.com
---
