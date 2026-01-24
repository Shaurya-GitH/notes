A system for automating deployment, scaling and management of containerized applications.

> [!info] Problem solved -> managing containerized applications at scale

## Architecture

- Kubernetes APIs are declarative rather than imperative.
	- you: define desired state
	- system: works to drive towards that state
	- Benefit: Automatic recovery

- The Kubernetes control plane is transparent. There are no hidden internal APIs
	- Master: defines desired state of node
	- Node: works independently to drive itself towards that state
	- ==Level triggered instead of Edge triggered==

>  Level triggering provides a simpler, more robust system that can easily recover from failure of components (no single point of failure). 
 > In distributed systems, edge triggering leads to complex recovery logic, missed instructions and requires carefully designed Idempotency logic.
>  Level triggered design makes Kubernetes composable and extensible

![[Pasted image 20260124225625.png]]