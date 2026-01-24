* **Definition:** A temporary helper container started alongside the job's main container.
* **Networking:** The runner automatically links them together on the same Docker network. They communicate via hostnames (Internal DNS).
* **Use Case:** Providing a database, cache, or API that the code depends on during testing.
* **Execution:** The runner does **not** wait for services to start before executing the script.

```yaml
job:
  image: ruby:2.4
  services:
    - name: postgres:latest  # Image
      alias: db              # Hostname
  variables:
	  # Variables required to start containers
```