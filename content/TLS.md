**Transport Layer Security**
## Overview
* **Goal:** TLS accomplishes [[Encryption]], Authentication, and Integrity.
* **Timing:** The TLS handshake is performed at the [[transport layer]] *after* the TCP handshake is successfully completed.

## TLS [[Certificates]]
* For a website or application to use TLS, it must have a TLS certificate (SSL certificate) installed on its origin server (X.509 standard).
* The certificate contains information about who owns the domain and the server's **public key**.

---

## The TLS Handshake
During the handshake, the client and server:
1.  Specify which TLS version ($1.0, 1.2, 1.3$, etc.) they will use.
2.  Decide which **Cipher Suite** they will use (specifies algorithms for keys and session).
3.  Authenticate the identity of the server using TLS [[Certificates]].
4.  Generate **session keys** for encryption after the handshake is completed (bulk encryption is done using symmetric keys).

> **Authentication Note:** During the handshake, the server digitally signs its messages (transcript and one-time challenge to prevent ==replay attacks==). The client uses the server's public key to authenticate the server.

---

## Key Exchange Methods
The cipher suite decides which algorithm is used for key exchange.

### 1. [[RSA]] Key Exchange (Deprecated)
* **Process:** The client makes use of the server's public key to encrypt the "pre-master secret" and sends it to the server.
* **Result:** Both server and client derive a set of identical session keys from the pre-master secret.
* **Status:** Highly deprecated because it cannot provide **[[Perfect Forward Secrecy]]**.

> [!caution] RSA key exchange can provide PFS in theory if the key used for encrypting the pre master secret is ephemeral, but this is not done due to heavy performance loss.

### 2. Diffie-Hellman (More Secure)
* **Benefit:** Provides **[[Perfect Forward Secrecy]]**.
* **Concept:** Allows two people to create a shared secret key without ever transmitting it over the channel and by using ephemeral private values.

**The Math:**
1.  Client and Server agree on two public numbers: a generator ($g$) and a large prime number modulus ($p$).
2.  Client and Server use their private numbers ($a$ and $b$) to calculate a public key (==private numbers are ephemeral==):
    $$A = g^a \pmod p$$
    $$B = g^b \pmod p$$
3.  The public keys ($A$ and $B$) are exchanged.
4.  They calculate the shared secret using each other's public key:
    $$\text{Shared Secret} = B^a \pmod p = A^b \pmod p$$