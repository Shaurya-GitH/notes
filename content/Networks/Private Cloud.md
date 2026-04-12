> [!info] A **private network** is a group of devices which can communicate with each other using private IP addresses and be isolated from the internet. These networks can be a simple LAN setup or it can also be setup through a virtual router virtually over the internet.

## How does networking works in a virtual private network?

In a simple LAN setup, usually, the devices inside the LAN are not exposed outside to the internet. This is managed by the default gateway firewall of the LAN. The default gateway router is responsible for converting the public IP address and routing it inside to the private IP addresses (NAT - Network Address Translation). Even if someone uses the router's public IP address, the router won't propagate the request inside due to the firewall unless we explicitly expose our devices to the internet.

Now, if I setup my router's firewall such that it allows requests from certain devices from the internet, those devices will be able to enter my private LAN, creating a virtual private network. This device can act as the virtual router to connect my private LAN to other devices on the internet. A Virtual Private Network (VPN) software intercepts all (or only the required) requests made from a device and routes them to this virtual router. If the request contains the private IP address of a device from the private LAN, the request will be routed to the default gateway and eventually to the device in the private LAN (The default gateway of the private LAN is setup to only allow requests from the virtual router).

> [!note]
> Connecting to the VPN requires a level of authentication and they additionally encrypt the whole tunnel, making the private network secure.

## Demilitarised Zone (DMZ)

In case, external exposure of a device is required from a private cloud, a DMZ server can be setup. This DMZ server will allow all requests from the internet and will forward those requests to the configured device in the private network. The DMZ server can exist within the private LAN or outside through the virtual router.

Since the DMZ server is exposed directly to the internet, it has to be surrounded by it's own set of firewall rules. The inbound firewall is set to allow all public requests but the outbound requests are limited by whitelisting only the required IP and ports of the private LAN devices. This is essential to limit the blast radius if the DMZ server is compromised.

