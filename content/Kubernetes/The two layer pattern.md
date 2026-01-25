# The two layer pattern

## Ingress and Ingress controller

Before the Ingress and Load balancer service were introduced in Kubernetes, only Nodeport service was available to expose the pods externally.

>[!note] Problem faced
>Since Nodeport only had ports above 30000, the browser was not able to hit the ports since the DNS only resolves the IP address and uses the default ports for http and https (80 and 443).

To tackle this problem, enterprises made use of reverse proxy servers stationed outside the cluster.

The Load balancer service did the same work as the cluster IP service, but additionally also provisioned an external Load balancer and routed the external traffic inside. When the service is created, the external IP of the field is set to `<Pending>`, the cloud controller manager provisions the external Load balancer after noticing the creation of the Load balancer service and returns the external IP address to be set as the IP of the provisioned Load balancer.

The Load balancer service points to the pods of the Ingress controller (Ideally), which then watch the Ingress.yaml resource to route traffic internally.

If you are new to Kubernetes, you would expect a normal Nginx image to follow your Ingress resource. But, the Nginx image is not even aware if it's inside a cluster or if it is supposed to watch the master API server. Special Ingress controller images are created for this purpose which are aware of the protocol to be followed and route the traffic by following the ingress resource. ==This method also decouples the where with the how== - Ingress resource managed by the developer who created it, and Ingress controller and the Load balancer service created by the cluster operator.

The Ingress controller and the Load balancer service are in a separate namespace together, and the Ingress resource is in the namespace to where it's routing the traffic.

The Ingress controller and the Ingress separates the cluster operators from the app developers just like the storage class and PVC do.

## PVC and storage classes

A Persistent Volume is a piece of storage in the cluster provisioned dynamically using storage classes or manually

Storage classes are resources managed by the cluster operators which provide methods of provisioning the storage on the systems on which the cluster runs.

Persistent Volume Claim is a resource created and used by a developer on the cluster which claims some storage using the storage class for its use.

A PVC is one to one mapped to a PV. The maximum storage claim for the PVC cannot exceed the storage limit of the PV. Usually, the PV is dynamically created by the cluster with the help of the storage class and the PVC is then bound to the PV provisioned.

In case the PV is provisioned manually before the PVC, even if the PVC is requesting less storage than the PV, it will be one-one mapped to the PV, and the remaining storage will remain unused.

A single PVC can be mounted to multiple pods depending on the  the access mode set.
- ReadWriteOnce only allows pods from the same node to access the PVC
- ReadWriteMany allow all pods to access the PVC
- ReadWriteOncePod only allows one pod to access the PVC
Etc.

|**Layer**|**Component (Networking)**|**Component (Storage)**|**Responsibility**|
|---|---|---|---|
|**The "How" (Infra)**|Ingress Controller|Storage Class|Managed by Ops. Defines the implementation (Nginx/HAProxy vs. AWS-EBS/NFS).|
|**The "What" (App)**|Ingress Resource|PVC|Managed by Devs. Defines the intent (Path `/api` vs. `20Gi` of space).|
