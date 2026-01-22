# Certificates (X.509)

## Definition
* A certificate is a digital document linked to an identity.
* Its primary purpose is to prove that a person or server using it is who they claim to be.

## Key Components
1.  **Identity:** The entity the certificate belongs to (Subject).
    * **Subject DN (Distinguished Name):** Contains attributes like Common Name (CN), Organization (O), Country (C), and Organizational Unit (OU).
2.  **Public Key:** Associated with the certificate.
3.  **Issuer:** The entity that signs and issues the certificate.

## Validation
* A certificate's trust is built on a **Chain of Trust**.
* The final certificate is signed by an intermediate CA, and the intermediate CA's cert is signed by a Root CA.
* **Process:** Validation verifies the authenticity of a client's certificate chain (leaf and intermediate) sent during the [[TLS]] handshake.
* **Success Criteria:** The process is successful as soon as any certificate in the chain can be successfully cryptographically traced back to a **Trust Anchor** present in the validator's Trust Store.

## Additional Checks
* Confirming the certificate has not expired or been revoked.
* The hostname matches the SAN (Subject Alternative Name) listed within the certificate.