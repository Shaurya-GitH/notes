# 🌐 Network Fundamentals

> [!info] Definition: A **network** is a group of interconnected devices that can communicate and share resources with each other.

## Core Components

- **Host / End Device:** Every computer on a network.
- **Server:** Computers that provide information to end devices.
    - _Examples:_ Email servers, web servers, file servers.
- **Client:** Computers that send requests to servers to retrieve information.
- **Intermediary Device:** Hardware that interconnects end devices.
    - _Examples:_ Switches, routers, firewalls, wireless access points.
## Transmission Media

Communication is carried through a specific medium using different signal types:

| Medium                           | Signal Type               |
| -------------------------------- | ------------------------- |
| **Metal Wires** (Cables)         | ==Electrical Impulses==   |
| **Fiber Optics** (Glass/Plastic) | ==Pulses of Light==       |
| **Wireless**                     | ==Electromagnetic Waves== |

---
## Network Architecture

The Internet is essentially a worldwide collection of interconnected LANs and WANs. A robust network architecture relies on four pillars:

1. **Fault Tolerance:** The ability to recover quickly when a failure occurs.
    
2. **Scalability:** The ability to grow without degrading performance.
    
3. **Quality of Service (QoS):** Managing priorities (e.g., voice vs. data), often handled by routers.
    
4. **Security:** Protecting the confidentiality, integrity, and availability of data.
    
### Packet Switching

> **Concept:** Traffic is split into small "packets" that are routed independently over the network.

- **Routing:** Each packet can take a different path to the destination.
    
- **Redundancy:** Reliable networks use packet switching to ensure that if one path fails, packets can automatically reroute.