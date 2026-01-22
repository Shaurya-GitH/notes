## Problem Solved
* Ensures that compromising a server's long-term private key does **not** allow attackers to decrypt past recorded network traffic.

## Core Mechanism
* Decouples the keys used for encryption from the keys linked to the [[Certificates]] by using **Diffie-Hellman**.
* Diffie-Hellman's ability to generate the **ephemeral private secret** in RAM itself is what allows forward secrecy. (Nothing to do with not sharing the secret over the network.)

## Why Static RSA fails
* Since the server's long-term key is used to encrypt the pre-master secret, an attacker can record the transaction.
* If the private key is compromised later, they can extract the pre-master secret and derive the session keys to decrypt the recording.

> [!caution]
> * **Static Diffie-Hellman:** Won't provide forward secrecy.
> * **[[RSA]] Exchange with Ephemeral Keys:** Will provide forward secrecy (in theory).