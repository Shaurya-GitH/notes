---
layout: case-study
title: EPI mock server
socialTitle: EPI mock server · Shaurya Mehta
kind: At work
period: Jan – Mar 2026
outcome: "A 9-endpoint EPI mock, so Wero load tests skip the live network"
lead: A bank's Wero services talk to EPI's central service for every payment. To load-test them without sending traffic to the live Wero network, I built a stand-in for that central service at SBS. It looks like a stub from the outside; inside, it checks signatures, keeps state between calls and calls the bank back, as EPI does.
description: A stateful mock of the Wero/EPI central service at SBS, with 9 endpoints, request-signature checks, a new repository and CI pipeline, used for peer-to-peer performance runs without the live network.

cover:
  src: epi-mock/architecture.webp
  alt: "The EPI mock: JMeter drives the bank's Wero services and a core-banking mock against a mock that checks request signatures, keeps state between calls, serves 7 endpoints and sends 2 callbacks, while EPI's live network is not touched; below, what a plain stub would miss, and the new repository, CI pipeline and performance run"

tldr:
  part: "All of it, end to end: the new repository, the 9 endpoints and their responses, the signature filter, the state between calls, the callbacks, the CI pipeline, and the peer-to-peer performance run on it"
  when: Jan – Mar 2026
  stack: WireMock, JWS signature checks, GitLab CI, JMeter
  result: A peer-to-peer performance run against the EPI and core-banking mocks, with no call to the live network

problem: Load tests cannot run against the real Wero network

decisions:
  - chose: Check every incoming request's signature in the mock, as EPI does
    rejected: a mock that accepts any request
    because: the bank's services sign every call to EPI; if the mock let unsigned calls through, a signing bug would pass every test and fail only on the real network
  - chose: Keep state between calls
    rejected: fixed replies per endpoint
    because: a peer-to-peer flow is a sequence; a cancel or status call has to find the payment request a call before it created
  - chose: Send the 2 callbacks EPI makes to the bank
    rejected: mocking only the calls the bank makes
    because: without them a payment never reaches its final state, and the run measures half a flow

results:
  - n: "9"
    basis: "endpoints: the 7 calls the bank's services make to EPI, and the 2 callbacks EPI makes back to the bank"
  - n: "0"
    basis: "calls to the live Wero network during the peer-to-peer performance run, Mar 2026"
  - n: 1 + 1
    basis: "new repository and CI pipeline, built for the mock"

links:
  - text: Read about Wero, the product it tests
    href: shipped/wero
---

The bank's Wero services sign every request to EPI's central service and check every reply. They also wait for EPI to call them back. The JMeter suites needed somewhere to send peer-to-peer payments at load. The live Wero network is not a test bed, and a canned stub would not behave like EPI.

## Why a stub was not enough

A stub returns a fixed reply for a URL. That breaks a Wero flow in three places:

- **Signatures.** The services sign each request. A stub that ignores signatures lets a signing bug pass every test, and it shows up only on the real network.
- **State.** Requesting money, then cancelling the request, are two calls. The second has to find what the first created, or it fails as a missing request.
- **Callbacks.** EPI tells the bank when something happens. Without those calls, a payment never reaches its final state.

## What I built

A mock of EPI's central service on WireMock, in a repository I set up from scratch:

- **Nine endpoints:** the seven calls the bank's services make to EPI, with realistic replies and errors, and the two callbacks EPI makes back to the bank.
- **A signature filter** that checks each request's signature as EPI does, and refuses a bad one.
- **State between calls,** so a later call sees what an earlier one created.
- **A CI pipeline** that builds and deploys it.

Earlier in the year I had set up WireMock and a forward proxy to validate Wero in a private cloud. This went further. With the mock running beside a core-banking mock, I ran peer-to-peer payments through the bank's services at load, without sending one call to the live network.
