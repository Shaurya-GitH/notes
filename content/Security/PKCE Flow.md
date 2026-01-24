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

    %% Step 1: Client generates secrets locally
    Note over Client: 1. Generate code verifier<br/>+ challenge (SHA256)<br/>(in memory)

    %% Step 2: Initial Authorization Request
    Client->>AuthServer: /auth + challenge

    %% Step 3: User Login
    AuthServer->>User: show login page
    User->>AuthServer: login

    %% Step 4: Code Exchange
    AuthServer-->>Client: redirect with authorization code

    %% Step 5: Token Request
    Client->>AuthServer: /token + code + code verifier

    %% Step 6: Verification
    Note over AuthServer: Verify<br/>SHA256(code verifier)<br/>== challenge

    %% Step 7: Access Token
    AuthServer-->>Client: access token
```
