**Rivest-Shamir-Adleman**

> [!note] Algorithm used for Asymmetric cryptography.

- Public key = (n,e) where n= large modulus and e= encrypting exponent
- Private key= (n,d) where n=large modulus and d= decrypting exponent
---
## Key generation

1. **Calculate $n$**
   $$n = p \times q$$
   * Where $p$ and $q$ are large prime numbers.
   * $p$ and $q$ are kept **secret**.
   * $n$ is **public**.

2. **Choose $e$**
   * $e$ is a randomly chosen number (preferably prime).
   * **Most common values:** $3$ and $65537$.
   * **Reason:** They can be efficiently used for modular exponentiation.
   * *Note: 3 is not considered safe*.
   * $e$ is **public**.

3. **Calculate $\phi(n)$**
   $$\phi(n) = (p-1) \times (q-1)$$

4. **Calculate $d$**
   $$e \times d \equiv 1 \pmod{\phi(n)}$$
   * $d$ is **private**.

> **Security Note:** It is computationally infeasible to calculate $d$ from $n$ because $p$ and $q$ are secret and it is very difficult to derive them from $n$.

---

## [[Encryption]]

**Formula:**
$$C = M^e \pmod n$$

* **$C$:** Cipher text
* **$M$:** Unencrypted message

**Process:**
* **Modular Exponentiation:** This is performed to encrypt $M$. This method is used because when $M$ and $e$ are large, calculating $M^e$ directly becomes exponentially (impossibly) large.
* **Padding:** Padding is done to add randomness to the data.

> [!note] 
> The encrypted message for the same plaintext will nearly always be different. To avoid same output on every encryption, secure implementations of RSA always use a process called padding before the message is encrypted
---

--- 
## Decryption

**Formula:**
$$M = C^d \pmod n$$
---
## Representation of keys

Public or private keys can be stored and transferred in different ways. Two of them include -
1. Private Enhanced Mail ([[PEM]])
2. JSON Web Key ([[JWK]])


