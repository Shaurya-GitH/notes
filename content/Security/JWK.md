**JSON Web Key**
## Overview
* **Definition:** A JWK is a JSON data structure that represents a cryptographic key.

---
## Standard Fields
These are the common parameters found in a JWK object:

* **`kty` (Key Type):** Identifies the cryptographic algorithm family used with the key.
    * *Examples:* `EC` (Elliptic Curve), `RSA`([[RSA]]).
* **`use` (Public Key Use):** Identifies the intended use of the public key.
    * *Examples:* `sig` ([[Signing]]), `enc` ([[Encryption]]).
* **`alg` (Algorithm):** Identifies the algorithm intended for use with the key.
    * *Examples:* `HS256`, `RS256`, `ES256`.
* **`kid` (Key ID):** A unique identifier for the key (useful when rotating keys).

---
## Key Type Specific Fields
Depending on the `kty`, specific [[Cryptography]] parameters are required:

### For [[RSA]] Keys
* **Required Parameters:** `n` (modulus), `e` (exponent), `d` (private exponent).

### For EC (Elliptic Curve) Keys
* **Required Parameters:** `x`, `y` (coordinates).

> **Important Note:** These specific cryptographic values ($n, e, d, x, y$) are stored as **Base64 encoded** strings within the JSON object.