**Privacy Enhanced Mail**
## Overview
* **Definition:** It is the de facto file format for storing and sending cryptographic keys, certificates, and other data.
* **Technical Description:** It is a Base64 encoded DER serialization of an ASN.1 representation of data.
* **Important Note:** PEM is *not* used for storing AES or DES keys.

---

## The Encoding Process (Layer by Layer)

The creation of a PEM file involves a specific pipeline of transformations:

### 1. Data
* The data starts as a structured key according to **PKCS standards** or a certificate.

### 2. ASN.1 (Abstract Syntax Notation One)
* **Role:** PKCS acts as a blueprint for ASN.1.
* **Definition:** ASN.1 is a standard language for defining data structures that can be serialized and deserialized in a cross-platform way.

### 3. DER Encoding (Distinguished Encoding Rules)
* **Role:** This is the serialization format for ASN.1 structures.
* **Format:** It converts the data into **Binary serialization**.

### 4. Base64
* **Role:** Since DER is binary, Base64 is used as a **binary-to-text encoding scheme** to make it safe for transport (like email or copy-pasting).

### 5. Adding Header and Footer
* The final Base64 encoded key is wrapped with a specific header and footer to identify the content type.

---

## Structure Example

The Base64 encoded data is sandwiched between clear markers:

```
-----BEGIN RSA PRIVATE KEY-----
(Base64 Encoded Data Here)
-----END RSA PRIVATE KEY-----
```
