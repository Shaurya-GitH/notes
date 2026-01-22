## Problem Solved
* Standard [[TLS]] trusts *any* certificate signed by a valid authority.
* If a CA is hacked or a user device is compromised, attackers can intercept traffic.

## Core Mechanism
* Instead of checking if the certificate is trusted by a third party, pinning checks if the [[Certificates]] matches a specific **certificate/public key hardcoded** in the application (acting as an allowlist).

## Process
1.  During the handshake, the app extracts the server's public key.
2.  It hashes the key and compares it to the hash stored in the app code.
3.  **Note:** Always pin the **public key** and not the certificate to allow for certificate renewals.

## Result
* Prevents Man-in-the-Middle (MiTM) attacks due to compromised Trust Stores or corrupt CAs.
* This check is performed by the **Client**.