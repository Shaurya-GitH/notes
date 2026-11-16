---
title: Journey
layout: portfolio
socialTitle: Journey · Shaurya Mehta
description: "Four companies since May 2025: invoicing software, Open Banking APIs, a pre-seed marketplace, and voice agents."
# the nav's keyboard-only skip link (shown on focus)
skip:
  text: Skip to the four stops ↓
  href: "#stops"
# the Journey page (Journey.tsx): the eye → iris → sky → field scroll story ends on the hero copy,
# then the four stops. Copy is the redesign's (copy v10). Bold lead-ins are each item's `lead`.
journey:
  headline: I take systems apart to understand why they work.
  tagline: "Four companies since May 2025: invoicing software, Open Banking APIs, a pre-seed marketplace, and voice agents."
  stops:
    - id: taction
      rail: Taction
      company: Taction Softwares
      logo: taction
      art: sky
      dates: May – Jul 2025
      role: Backend and DevOps · Noida · 3 months
      items:
        - lead: "Cut invoice creation time by over 95%:"
          text: a Spring Boot backend (8+ REST APIs) with automated PDF generation, and a React app for managing invoices end to end.
        - lead: "Ran the DevOps:"
          text: AWS, Kubernetes and GitLab CI/CD, including a custom Nginx double proxy that connects public endpoints to an isolated private cloud.
    - id: sbs
      rail: SBS
      company: SBS
      logo: sbs
      art: city
      dates: Jul 2025 – Jun 2026
      aka: formerly Sopra Banking Software
      role: Open Banking platform team · Noida · 1 year
      items:
        - lead: "Owned the Open Banking APIs end to end for European banking clients:"
          text: 10+ endpoints across the Berlin Group account (AIS) and payment (PIS) standards and the Wero wallet, from sprint planning to production.
        - lead: "Built the security layer:"
          text: shared services that sign and validate requests across every API, including all four Wero services that call the EPI network, QWAC certificate validation at the gateway, and security reviews against the EPI and PSD2 standards.
        - lead: "Extended our Keycloak extensions:"
          text: decrypting a bank's JWE tokens so the consent app could read user claims without holding the key, and letting each bank choose which identity attributes are saved with a consent, with no code change.
        - lead: "Debugged Keycloak itself:"
          text: traced a sign-in error, when two users signed in from the same browser, to how Keycloak links authentication sessions, and set out the fix options for the client.
        - lead: "Took Wero to a bank:"
          text: built wallet-activity APIs and a 9-endpoint mock of the EPI central service for performance tests, then deployed and validated a release at a European bank, mTLS and OAuth included.
        - lead: "Built the full-stack demo SBS showed at corporate summits in Dubai:"
          text: 50+ API endpoints and 20+ financial features.
        - lead: "Hardened the pipelines:"
          text: Invicti security scanning for the consent apps and Keycloak extensions, stabilised deployments on GitLab runners, and an NGINX proxy for secure connectivity to EPI.
    - id: for-real
      rail: For Real
      company: For Real
      logo: forreal
      art: market
      dates: Jun – Jul 2026
      aka: a marketplace where brands sell their deadstock · raised a ₹3.2 crore pre-seed from Titan Capital
      role: Product Engineer, early team · Bengaluru
      items:
        - lead: "Owned the platform end to end at a pre-seed startup:"
          text: architecture, build and production, working every day with the founders, the founder's office, marketing, design and logistics.
        - lead: "Designed the order engine as sagas:"
          text: exchanges, partial cancellations, inventory sync and fulfilment run as MedusaJS workflows whose every step has a compensating action, so a failure halfway through rolls the order back cleanly instead of leaving it half done.
        - lead: "Made every step safe to retry:"
          text: idempotent steps and retry policies across the order flow, with event subscribers keeping inventory and fulfilment in step, so duplicate events and flaky partner APIs can't double an order or lose stock.
        - lead: "Integrated third-party platforms end to end:"
          text: order management, shipping, checkout and customer engagement, working directly with each platform's team.
    - id: the-product-highway
      rail: The Product Highway
      company: The Product Highway
      logo: tph
      art: eye-alt
      dates: Jul 2026 – now
      role: Software Engineer · Bengaluru
      items:
        - lead: "Built an MCP server that lets a founder run the business from Claude in plain English:"
          text: "sales, margins, stock, purchase orders, the catalogue, ads, analytics, errors and logs, from 11 systems behind one adapter contract, with role-based access, personal-data masking, and changes applied only after a preview and the person's yes."
        - lead: Cut Echo's voice-agent reply time by 41–59%
          text: "for US users (server-side medians by turn type), about 1.8 s sooner per typed message: I traced the delay to a service running in Mumbai while the users, models and APIs were in the US, moved it, and added a shared Redis tool cache that answers in about 10 ms instead of 69–130 ms."
        - lead: Fine-tuned GLiNER 2.5 (194M parameters) to predict a voice agent's next tool call,
          text: served on a GPU in 28 ms. On a fixed benchmark, exact tool picks rose from 0/50 to 18/50, and in a replayed conversation the main LLM needed 3 tool calls instead of 9.
        - lead: Traced a storefront's slow pages to a server memory leak
          text: "that crashed it four times in a week, reproduced it with heap snapshots and fixed it: product-page first-byte p95 fell from 1.8 s to about 1.3 s."
        - lead: "Built the business-insights funnel for the store's shopping assistant:"
          text: from site visit to purchase, driven by an AI pipeline that summarises every finished chat and has an LLM judge check each answer against live product data.
        - lead: Built an alert-triage agent
          text: that runs up to six parallel agent sessions, each on its own branch and local stack, reproduces production alerts and proposes the fix; it triaged 13 alerts in its first two days.
        - lead: "On YEAPP, KRAFTON India's voice-first messenger:"
          text: "made the AI companion survive LLM vendor outages by fixing circuit breakers that never opened (fallback on the first failure, recovery after a 15 s probe), and built the voice-onboarding pipeline: 58 clips word-aligned with Whisper, rendered across three replicas behind a Redis lock."
  # a second sentence from the home page's recommendation (its person and link come from there)
  quote:
    label: In someone else's words
    text: What truly sets him apart, however, is not just his technical knowledge but also his exceptional attitude, positivity, and willingness to learn and adapt.
    link: Read the full recommendation on LinkedIn
  next:
    heading: Shipped
    text: The work behind these stops, plus two open-source fixes and things I built to learn.
    link: See what I've shipped
---
