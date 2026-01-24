> [!info] A tool for defining and running multi container applications on a single host

> **Service** : a service contains one or more container instances of an image. It provides internal DNS and load balancing. (similar to cluster IP service in Kubernetes)

All the services run within a single docker network, i.e., they can communicate directly via LAN with the host network as the default gateway (for external requests).

Publishing a port is only done for services publicly exposed to the host network. You should not publish a service if they only talk to other services.

> [!caution] Docker-compose is primarily designed for running applications on a single-host

```yaml
services:
  mysql:
    image: mysql:8
    container_name: mysql
    volumes:
    - ./my-volume:/var/lib/mysql
    environment:
		MYSQL_DATABASE: wesplit
		MYSQL_ROOT_PASSWORD: root
  
  wesplit:
    image: wesplit:v1
    environment:
		SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/wesplit
	depends_on:
	- mysql
	deploy: 
		replicas: 3
		
  nginx:
    container_name: nginx
    image: nginx:alpine
    ports:
    - 8080:80
    depends_on:
    - wesplit
    volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf
```

- depends_on field ensures correct order when starting containers
- mysql:3306 will resolve to the virtual IP of mysql service
- ports field is used to publish a service to host network.
- Best practice to specify a tag to avoid unpredictable behavior
