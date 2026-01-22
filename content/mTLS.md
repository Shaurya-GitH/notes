**mutual Transport Layer Security**
## Overview
* In addition to the working of standard [[TLS]], mTLS requires the **client** to present a certificate during the handshake.

## Difference from TLS
* The difference lies entirely in the **Authentication phase**.
    1.  The server authenticates the client certificate.
    2.  The client also digitally signs the data requested by the server during the handshake.