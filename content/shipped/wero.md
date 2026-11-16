---
layout: case-study
title: Wero
socialTitle: Wero · Shaurya Mehta
kind: At work
period: Jul 2025 – Jun 2026
outcome: "Wero at the bank, live for hundreds of thousands of customers"
lead: Wero is the European Payments Initiative's wallet for sending money to people and paying shops. I spent my year at SBS building the bank side of it, the APIs a bank's app calls for peer-to-peer payments, the wallet and its activity, and took it from a private cloud to a European bank. It is now live at several of SBS's client banks.
description: The bank side of the Wero wallet at SBS, with peer-to-peer payments, wallet management and activity APIs, request signing to EPI's central service, and releases validated in private cloud and at a European bank.

cover:
  src: wero/architecture.webp
  alt: "Wero at the bank: a customer's app calls the Wero services for peer-to-peer payments, wallet management and activities, with core banking over mTLS and Keycloak for identity; every request to EPI's central service is signed and every response checked, or the EPI mock answers for load tests. Below, each release goes from private cloud through load tests and an mTLS release package to a European bank, then live at several client banks"

tldr:
  part: "The bank side of Wero, end to end: peer-to-peer payments, wallet and activity APIs, request signing and response checks for every call to EPI, the move of core-banking connectors to mTLS, the EPI mock, validation in private cloud, JMeter suites, and the release at a European bank"
  when: Jul 2025 – Jun 2026
  stack: APIs as services on an integration platform (iPaaS), JWS signing with HSM-held keys, mTLS, Keycloak, JMeter, WireMock, GitLab CI
  result: Live at several client banks, for hundreds of thousands of customers

problem: A bank needs its own side of Wero before its customers can use it

decisions:
  - chose: Move the core-banking connectors from a SOAP client to an HTTP client that handles the XML itself
    rejected: keeping the SOAP client
    because: it could not do mTLS, and the bank's core banking required it
  - chose: Validate each new version of the integration platform end to end in a private cloud first, behind a forward proxy, with WireMock for the systems it could not reach
    rejected: upgrading at the bank and testing there
    because: the private-cloud runs found the gaps first, a bug I fixed and test suites that needed adapting, before any bank saw them
  - chose: Load-test against a mock of EPI's central service that I built
    rejected: sending test load to the live Wero network
    because: the live network is not a test bed; the mock checks signatures and keeps state, so a run still means something

results:
  - n: Hundreds of thousands
    basis: "customers using Wero at SBS's client banks, 2026"
  - n: 4 of 4
    basis: "services that call EPI's central service sign every request and check every response signature · enforcement tested end to end"
  - n: "2"
    basis: "new versions of the integration platform validated end to end in a private cloud, with the gaps they showed fixed"

links:
  - text: Read how the EPI mock works
    href: shipped/epi-mock
  - text: Read about the Keycloak layer under Wero, PSD2 and FDX
    href: shipped/fdx-keycloak
---

Wero lets a customer send money to a phone number, request money and see what moved, inside their own bank's app. EPI runs the central service that routes payments between banks. Each bank needs its own side: APIs its app can call, connected to its core banking, signing every call to EPI and checking every reply. SBS builds that side for its client banks, and it was my main project for the whole year.

## What I built

- **Peer-to-peer payments.** I built the step a payer uses to cancel a payment request: it checks that the request exists, calls EPI's cancellation, and handles a missing request, EPI's errors and refused calls. Through the first client delivery I worked on the whole peer-to-peer payments feature end to end, tested it with JMeter and fixed every bug the testing found, hotfixes included. That delivery earned me SBS's Spot Award in September 2025.
- **Wallet and activity.** I built the APIs that list a wallet's activity and a customer's proxies, such as their phone numbers, then extended the activity list to peer-to-peer payments. I documented the filtering and paging defects I found in the upstream API they depend on.
- **Signing.** Every request the bank's services send to EPI is signed with keys held in an HSM, and every response's signature is checked. I added both to all four services that call EPI, wrote the HSM set-up, and tested enforcement end to end once the token call was signed too.
- **mTLS to core banking.** The connectors to the bank's core banking used a SOAP client that could not do mTLS. I moved them to an HTTP client that handles the XML, with no change in what they do.
- **Keycloak underneath.** Identity and consent run on Keycloak with SBS's extensions, the same layer under the PSD2 APIs and FDX. [[shipped/fdx-keycloak|What I built in it]].

## How it reached a bank

I validated the product on two new versions of the integration platform in a private cloud. I set up a forward proxy and WireMock for the systems the cloud could not reach, then fixed the gaps the runs found. I kept the JMeter suites for payments and the wallet working, and built [[shipped/epi-mock|a mock of EPI's central service]] so they could run without the live network.

Then I built the release package with mTLS, deployed it at a European bank and validated it there, OAuth connector set-up included. I wrote the guide for moving its projects from one environment to the next. The EPI mock got its own repository and CI pipeline.
