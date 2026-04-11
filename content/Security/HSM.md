Hardware Security Module (HSM) is a physical computing device which makes use of firmware for it's cryptographic computation. It is a highly specialised module built for the sole purpose of cryptographic operations and providing a secure storage of sensitive private keys.

A private key never leaves the HSM and the key is generated directly inside the HSM (although there are secure ways of key transfer to and from the HSM). In order to perform any cryptographic operation, the request is made by the client and the operation takes place inside the HSM without exposing the key. The output is then sent back to the client.

HSM provides tamper resistant, tamper evident and a secure single place to carry out the cryptographic operations for any application within zero trust environments. It helps clients meet the security standards and solves the key storage problem.

To securely interact with an HSM, PKCS #11 interface is used. It is an interface which can be implemented in c by any HSM provider to interact with clients. For example, AWS will implement the PKCS#11 interface for it's cloudHSM, this interface provides functions which will allow the client to securely interact with the HSM.

The PKCS#11 provides functions written in C since the interface requires direct memory management, pointer manipulation and low level interaction with hardware. This is readily available in C. Also, every other language has a way of executing C style machine code (ex.- JNI in java) 