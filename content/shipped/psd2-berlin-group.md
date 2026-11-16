---
layout: case-study
title: PSD2 open-banking APIs
socialTitle: PSD2 open-banking APIs · Shaurya Mehta
kind: At work
period: Jan – Jun 2026
outcome: "PSD2 APIs where every check is written once and SCA is per bank"
lead: Under PSD2, European banks must open account and payment data to licensed third-party providers, through APIs such as the Berlin Group's. At SBS I built version 2 of those APIs for its client banks, with three shared services every endpoint reuses, and strong customer authentication (SCA) that each bank configures.
description: Berlin Group v2 open-banking APIs for PSD2 at SBS, with shared certificate, token and consent validation and SCA configurable per bank.

cover:
  src: psd2-berlin-group/architecture.webp
  alt: "One Berlin Group call: a provider's request over mTLS with a QWAC and a QSeal-signed JWS passes the certificate and header checks, token claims and 7 consent checks, then throttling; the account list, payment cancellation, consent update and approval journey endpoints reuse those checks; SCA runs from a per-bank approach header through consent type, an SCA decision service and status validation to a single or multi-step flag; Keycloak, a JMeter suite and the guides sit around it"

tldr:
  part: "Berlin Group v2 endpoints end to end: the three shared validation services, throttling, payment-cancellation authorisation, consent update, the approval journey, the whole SCA epic, the JMeter suite for v2, and the implementation and upgrade guides"
  when: Jan – Jun 2026
  stack: APIs as services on an integration platform (iPaaS), mTLS with QWAC, JWS with QSeal, OAuth, Keycloak, JMeter
  result: 4 endpoints on 3 shared services, and SCA each bank sets to single or multi-step

problem: Every PSD2 call has to prove who is calling, for whom, and with what consent

decisions:
  - chose: Build the first endpoint's checks as three shared services, for certificates and headers, token claims and consent, that every later endpoint reuses
    rejected: validating inside each endpoint
    because: the rules are the same for every Berlin Group call, so one copy means one place to fix and nothing to drift
  - chose: Read the provider's certificate from the JWS x5c header and check it field by field
    rejected: trusting a signature that verifies
    because: a valid signature does not prove the signer is a licensed provider with the right role; the certificate's QC statements, PSP role and NCA id do
  - chose: Make the SCA approach a per-bank setting, single or multi-step
    rejected: the hard-coded value
    because: banks authenticate their customers differently, and a code change per bank does not scale

results:
  - n: "3"
    basis: "shared services, for certificates and headers, token claims and consent, reused by every Berlin Group v2 endpoint after the first"
  - n: 6 + 7
    basis: "certificate checks (type, validity, organisation id, QC statements, PSP role, NCA id) and consent checks on every call"
  - n: "5"
    basis: "changes that made SCA per bank: the approach header, consent-type validation, a new SCA decision service in 2 endpoints, status validation, the multi-step flag"
  - n: "4"
    basis: "endpoints: account list, payment-cancellation authorisation, consent update with SCA, approval journey"

links:
  - text: Read about the Keycloak layer under PSD2, Wero and FDX
    href: shipped/fdx-keycloak
---

A third-party provider calls a bank's API on a customer's behalf. Before any data moves, the bank must know three things: the caller is a licensed provider with the right role, the access token covers this call, and the customer's consent is valid for it. SBS was moving its client banks to version 2 of its Berlin Group APIs, and each check had to be built for it.

## What I built

- **The first endpoint, and the services under it.** The account list was the first v2 endpoint, and the largest single piece of work. I built it on three shared services that every later endpoint reuses: certificate and header validation, token-claims extraction, and consent validation with seven checks. I added throttling, so each provider can call only so often.
- **Payment-cancellation authorisation.** A provider starts the customer's approval to cancel a payment. It checks the token's scope, the QWAC over mTLS and the JWS signature.
- **SCA, the whole epic.** Strong customer authentication in the consent flow was fixed to one approach. I made it per bank, single or multi-step, in five changes: the SCA-approach header, consent-type validation, a new SCA decision service wired into two endpoints, rebuilt SCA status validation, and a multi-step flag. The consent update and the approval journey run on it.
- **Keycloak underneath.** Consent and sign-in run on Keycloak with SBS's extensions; I made the claims saved with a consent a per-bank setting. [[shipped/fdx-keycloak|More on the Keycloak work]].

## Tested and written down

I rebuilt the legacy JMeter suite for v2, so every endpoint runs end to end with test certificates and signatures. I wrote the Berlin Group v2 implementation guide and the customer upgrade guide, and gathered the error codes, environment properties and features into one place.
