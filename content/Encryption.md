> [!info] **Encryption** is a mathematical process that alters data using an encryption algorithm and a key. Unlike [[Hashing]], encrypted text can be decrypted to get the original.

 Cipher is a method for encrypting messages
1. Symmetric
2. Asymmetric
## Symmetric Encryption

- Same key used for encryption and decryption
- Strength of algorithm **∝** size of key
- A symmetric key is just a set of characters (string)

> [!success] Strengths
> 1. Fast 
> 2. Bulk encryption

> [!caution] Challenges
> 1. Key distribution 
> 2. Scalability

Types of symmetric algorithms -

| Block cipher                                                         | Stream cipher                                                                                    |
| :------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| Operate by encrypting a fixed amount, or block(64 or 128bit) of data | Treats the message as a stream of bits or bytes and performs math functions on them individually |

> [!Examples] Examples 
> - DES (Data Encryption standard) (deprecated)
> - AES (Advance Encryption standard) - Key length= 128/192/256 bits 
