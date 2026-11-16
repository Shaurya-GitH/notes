---
layout: case-study
title: FDX and Keycloak
socialTitle: FDX and Keycloak · Shaurya Mehta
kind: At work
period: Aug 2025 – May 2026
outcome: "FDX for a US bank, on the Keycloak layer under all three"
lead: Wero, the PSD2 APIs and FDX, SBS's three open-banking products, all sign customers in and record their consent through Keycloak, extended with SBS's own Java extensions. I built and fixed those extensions through the year, including the work FDX, the US open-banking standard, needed for a US bank.
description: Keycloak extensions at SBS for FDX, PSD2 and Wero, with JWE decryption, per-bank consent claims, offline access for dynamically registered clients, SCA, and two Keycloak bugs traced to the source.

cover:
  src: fdx-keycloak/architecture.webp
  alt: "One identity layer under Wero, PSD2 Berlin Group v2 and FDX: Keycloak with SBS's extensions for JWE decryption, consent claims per bank, offline access, SCA and JWE tokens out; below, two bugs traced into Keycloak itself, one reported as issue 44284, and the pipelines moved to a new GitLab runner and into private cloud"

tldr:
  part: "Keycloak for all three products: JWE decryption of a bank's tokens, configurable consent claims, offline access for dynamically registered clients, SCA, tenant realm work, two Keycloak bugs traced to their source, and the deployment pipelines for Keycloak and both consent apps"
  when: Aug 2025 – May 2026
  stack: Keycloak, Java SPI extensions, OAuth 2.0 with dynamic client registration, JWE and JWS, GitLab CI
  result: One Keycloak build under Wero, PSD2 and FDX; a bug reported upstream and fixed in Keycloak 26.6.0

problem: Three open-banking products, one place where customers sign in and consent

decisions:
  - chose: Decrypt the bank's JWE tokens inside a Keycloak extension and pass the signed token inside on
    rejected: giving the consent app the decryption key
    because: the consent app could then read the customer's claims without ever holding the key
  - chose: Make the claims saved with a consent a per-bank list in the extension's settings, where no list means the old behaviour
    rejected: changing the code for each bank
    because: a bank picks its claims without a release, and banks already live see no change
  - chose: Give dynamically registered clients offline access by default
    rejected: refresh tokens tied to the sign-in session
    because: a registered app lost access whenever the sign-in session ended

results:
  - n: 3 of 3
    basis: "SBS open-banking products on this Keycloak layer: Wero, PSD2 (Berlin Group v2) and FDX"
  - n: 6 of 6
    basis: "JWE encryption methods (A128/A192/A256GCM, A128CBC-HS256, A192CBC-HS384, A256CBC-HS512) whose tokens decrypted with a second, independent library"
  - n: 3 pipelines
    basis: "deployment pipelines (Keycloak and both consent apps) moved to a new GitLab runner and cloud identity · 2 of them extended to deploy to a private-cloud cluster"
  - n: "#44284"
    basis: "the Keycloak issue I filed after tracing a registration failure to the admin console · fixed in Keycloak 26.6.0"

links:
  - text: Read Keycloak issue 44284
    href: https://github.com/keycloak/keycloak/issues/44284
  - text: Read about Wero
    href: shipped/wero
  - text: Read about the PSD2 APIs
    href: shipped/psd2-berlin-group
---

Every SBS open-banking product needs the same things from its identity layer. It signs a bank's customers in, records what they consented to, and issues tokens that third-party apps can use and the APIs can trust. SBS runs Keycloak for this, with its own Java extensions (SPIs) for what Keycloak does not do out of the box. Each bank brings its own identity provider and its own rules, and the US bank on FDX brought the American standard's.

## FDX, for a US bank

- **Offline access by default.** Apps that register themselves through dynamic client registration now get offline access, so their refresh tokens no longer end with the sign-in session.
- **A bank's encrypted tokens.** The bank's identity provider sent JWE tokens. I extended our Keycloak extension to decrypt them and pass the signed token inside on, so the consent app reads the customer's claims without holding the key.
- **A registration case that kept failing.** I traced it to Keycloak's admin console: keys sent through dynamic client registration were stored and used, but not shown. I [reported it to Keycloak](https://github.com/keycloak/keycloak/issues/44284), and the Keycloak team fixed it in 26.6.0.
- **Two users, one browser.** A sign-in error appeared when two customers signed in from the same browser. I traced it to how Keycloak links authentication sessions and set out the fix options.

## Under all three

- **Consent claims per bank.** Each bank now lists which identity attributes are saved with a consent. There is no code change, and a bank without a list keeps the old behaviour.
- **SCA.** Strong customer authentication, single or multi-step per bank, which I built for the [[shipped/psd2-berlin-group|PSD2 APIs]].
- **Encrypted tokens out.** When Keycloak gained JWE token generation, I checked it with all six symmetric encryption methods, decrypting every token with a second, independent library. I noted the gap that remained: asymmetric algorithms were not yet supported.
- **Tenant realms.** I moved four clients into the tenant realm template.

## The pipelines behind it

I moved the deployment pipelines for Keycloak, the consent admin dashboard and the consent grant app to a new GitLab runner and cloud identity. Then I extended two of them to deploy to a private-cloud cluster.
