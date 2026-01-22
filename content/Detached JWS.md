## Problem Solved
* Ensures **Application Layer Integrity** of the HTTP request body.
* Prevents tampering by intermediate proxies or API gateways.

## Core Mechanism
* Provides a cryptographically verified integrity check that operates *after* [[TLS]] decryption.
* **Process:**
    1.  The client generates a JWS signature using its private key (or shared symmetric key) based on the request body (payload). (see [[Signing]])
    2.  The payload is **not** included in the final JWS (hence "detached").
    3.  The detached JWS is sent in a separate HTTP header (e.g., `X-Signature`) along with the request body.
    4.  The Resource Server reconstructs the signing input by combining the JWS header with the received request body and verifies it.

## Result
* Provides **Non-repudiation** and **Integrity**.