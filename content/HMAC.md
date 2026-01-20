**Hash based Message Authentication**

> [!info] A method which utilizes [[Hashing]] combined with a secret key to provide authentication and data integrity

HMAC is most commonly used in JWT

 > JWT= Header+Payload+Signature

- The header and payload are combined together with a private key (Symmetric key generation algorithms) and then hashed and added as the signature. The key is added by performing a nested hash operation.
- This ensures that the header and payload are not tampered with. The key provides the authentication since only the server can create the signature with its private key. 
- Signing the header too prevents an attacker from changing the metadata.

> [!note] The header and payload data are just encoded (base64) and hence, sensitive data should not be stored in a JWT.

HMAC is a form of symmetric signature ([[HS256]]).
