1) **/auth** : Provide client information and scope to get a code

> This endpoint redirects the user to the delegated login screen and then authentication is performed and browser is redirected back to the redirect_uri either with an error or authorization code.

2) **/token** : Exchange code for the token

> The tokens contain the scope, user information and added claims (protocol mappers). The endpoint does not throw an error if a user is unauthorized for a scope. Instead, it provides the maximum scopes it is allowed to.

## Problem solved

For delegated authentication through redirects, the authorization server has no way of safely redirecting back to the client. It makes use of 302 (found) API which is used for front-channel communication. (Communicates with the browser to redirect to the redirect URI). The code is shared through the URL in plain text.

The token cannot be shared in plain text on the browser since it is exposed in the browser history and can be leaked.

> [!caution]
> - For a private client, the client secret is also required along with the code. This is done because the code can be leaked and used by malicious software on the system. The client secret has to be secured securely for this method. 
> - In case the client secret cannot be stored safely, [[PKCE Flow]] is used

> [!note] 
> Authorization code flow makes [[OAuth 2.0 + mTLS]] possible since the client has to fetch the token with it's own certificate