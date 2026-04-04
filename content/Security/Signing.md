# Signing and Digital Signatures

## Definition
* A digital signature is a mathematical technique used to validate the authenticity and integrity of a message, software, or digital document.

## Concept
1. **Creation:** To create a signature, signing algorithms use a one-way hash function and make use of the private key depending on the algorithm.
2. **Validation:** The validator can make use of its key to check if the payload's hash and the signature's hash matches.
    * If yes, the payload is valid and untampered with.
    * Since a private key is used for signing, it also provides non-repudiation.

---

## Signing Algorithms

### 1. HS256 ([[HMAC]] with SHA-256)
* **Definition:** HS256 is an implementation of [[HMAC]] where the [[Hashing]] function used is SHA-256.
* **Security:** [[HMAC]] provides authentication and integrity.

### 2. RS256 ([[RSA]] Signature with SHA-256)
* **Definition:** An asymmetric signature algorithm.
* **Security:** Provides authentication, integrity, and non-repudiation.
* **Steps:**
    1.  **Create a Hash:** The payload and header are hashed.
    2.  **Encrypt the Hash:** The hash is then encrypted using the **private key**. This encrypted hash is the signature. (see [[Encryption]])
 - **Steps for verification**:
	1. Create hash of the signed content
	2. Decrypt the signature and match the created hash and the decrypted content