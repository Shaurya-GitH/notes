## Problem Solved
* Prevents **Access Token Theft** and ==replay attacks==.
## Core Mechanism
* The access token becomes a **sender-constrained token**.
* The Auth Server in the [[OAuth 2.0]] flow binds the token to the client's cryptographic identity by embedding the client's certificate identifier (e.g., serial number) into the token's cnf claim.

## Validation Process
1.  To use the token, the client must provide the [[Certificates]] during an [[mTLS]] handshake with the Resource Server.
2.  The Resource Server verifies that the certificate in the handshake matches the identifier in the token cnf claim.

## Result
* Provides **Proof of Possession**: Only the client with the private key can use the token.

> [!note] 
> In some systems, the auth server is not directly accessed, and requests might be forwarded to it through the main service. In this case, traditional OAuth+mTLS is not possible due to the early termination of TLS. However, the client's certificate can be forwarded to the authorization server to have the same effect. For this usecase, the auth server has to trust the main service.