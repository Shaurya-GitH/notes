## Problem Solved
* Prevents **Access Token Theft** and ==replay attacks==.
## Core Mechanism
* The access token becomes a **sender-constrained token**.
* The Auth Server in the [[OAuth 2.0]] flow binds the token to the client's cryptographic identity by embedding the client's [[certificate]] identifier (e.g., serial number) into the token's cnf claim.

## Validation Process
1.  To use the token, the client must provide the [[certificate]] during an [[mTLS]] handshake with the Resource Server.
2.  The Resource Server verifies that the [[certificate]] in the handshake matches the identifier in the token cnf claim.

## Result
* Provides **Proof of Possession**: Only the client with the private key can use the token.