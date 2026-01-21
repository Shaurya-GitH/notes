- All communications are governed by protocols
- Protocols are rules that communications will follow
### Network protocol requirements
Protocols must be in agreement and must include following requirements:
- Message encoding
- Message formatting and [[Encapsulation]]
- Message size
- Message delivery options (Unicast, Multicast, Broadcast, anycast)
- Message timing

Message timing includes the following -
1. Flow control
2. Response timeout
3. Access method (deals with collisions)
### Protocol suites
A group of inter-related protocols necessary to perform a communication function. 
The protocols are viewed in terms of layers:
- Higher layers
- Lower layers - concerned with moving data and provide services to upper layers
#### There are several protocol suites -
- Internet Protocol Suite (TCP/IP) - open standard
- Open Systems Interconnection (OSI)
- Apple Talk
- Novell Netware

While the OSI model is a conceptual framework for understanding network layers, TCP/IP is a specific implementation of the framework.

| OSI Layers                                | Protocol Suite                      | TCP/IP Layer        |
| :---------------------------------------- | :---------------------------------- | :------------------ |
| Application<br>Presentation<br>Session    | HTTP, DNS, DHCP, FTP                | Application         |
| [[Transport layer]]                       | TCP, UDP                            | [[Transport layer]] |
| [[Network layer]]                         | IPv4, IPv6, ICMPv4, ICMPv6          | Internet            |
| [[Data Link Layer]]<br>[[Physical Layer]] | Ethernet, WLAN, SONET, SDH<br>Wi-Fi | Network Access      |



