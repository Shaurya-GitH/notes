## Problem statement

1. Using regular Role based Access Control (RBAC) prohibits specific context dependent access control. RBAC fails to handle complex, dynamic and resource specific permissions.

	Roles lead to very broad access control policies

	`All Admins can access all Reports`

2. RBAC is impossible to manage as the application grows and requires more roles and permissions.
3. RBAC becomes brittle when Shared data access starts getting involved. It is important to recognize when Authorization transforms from data filtering to start being a system of it's own.
## Solution

> [!info] **Fine grained authorization (FGA)** is an advanced access control method that grants precise permissions for specific actions on specific resources by specific users

FGA is crucial for complex applications needing granular control over data and features.

`Admin:Shaurya can Read Report:transactions`

FGA can be implemented through a Relationship based Access Control model (ReBAC)

> Subject -> Action -> Resource

## Working

In typical [[OAuth 2.0]] systems, the resource server simply validates the access token and performs authorization based on user and roles by itself. For FGA, a Policy Decision Point (PDP) is introduced in the flow. A PDP is exposed by the authorization server (Keycloak, Auth0 etc.) for this one purpose. The resource server extracts the user identity from the access token. It acts as a Policy Enforcer Point (PEP) and asks the PDP if the request is authorized, the PDP responds with a Yes or No after querying it's database.

The query is created dynamically based on the context: `Is the User:Shaurya allowed to read the Report:transactions?`

The PDP's database stores relationship tuples: `(subject, relation, object)`

> [!note] FGA decouples the Authorization decisions from the system.
