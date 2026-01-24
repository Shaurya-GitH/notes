Container networking refers to the ability for containers to connect to and communicate with each other, or to non-docker workloads.

Since, a network namespace is isolated and has a separate IP address, they require to be on a network to communicate with the host network or other containers.

Docker creates a virtual LAN where the default gateway is the host network (configurable) and containers on that network can communicate directly.

`docker network create my-network`

A container can be on multiple networks.

> [!note] A default network is created for the containers without network specified (docker0). Containers on default network can only communicate via IP addresses and not container names.