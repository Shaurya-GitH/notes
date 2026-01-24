**Proof key for code exchange**

> [[Authorization Code Flow]]'s extension

## Problem statement

- The redirect from auth server to redirect_uri is passed to the operating system, instead of the targeted application. Any malicious software can intercept this and acquire the authorization code.
- Client secret cannot be stored safely in a frontend application. (private client)

## Solution


```mermaid
sequenceDiagram
    participant Client
    participant User
    participant AuthServer as Auth Server

    Note over Client: 1. Generate code verifier<br/>+ challenge (SHA256)<br/>(in memory)

    Client->>AuthServer: /auth + challenge

    AuthServer->>User: show login page
    User->>AuthServer: login

    AuthServer-->>Client: redirect with authorization code

    Client->>AuthServer: /token + code + code verifier

    Note over AuthServer: Verify<br/>SHA256(code verifier)<br/>== challenge

    AuthServer-->>Client: access token

```
