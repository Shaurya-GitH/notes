## Definitions
* **CI/CD (Continuous Integration / Continuous Deployment):** A DevOps practice that automates building, testing, and deploying code changes, enabling faster and more reliable software releases.
* **Pipeline:** An automated process that moves code changes through a series of stages, from initial commit to final deployment.

## GitLab Architecture
The architecture consists of the GitLab server and Runners that execute the jobs.

```mermaid
graph LR
    Server[GitLab Instance / Server] -- "job-1" --> Runner1[Runner]
    Server -- "job-2" --> Runner2[Runner]
    
    subgraph "Architecture"
    Server
    Runner1
    Runner2
    end
````

### Components

1. **GitLab Instance/Server:**
- Example: `gitlab.com` (SaaS maintained by GitLab) or a self-hosted instance.
- Users can connect their own runners or set up their own GitLab instance.

2. **GitLab Runners:**
- Agents that run CI/CD jobs. 
- The GitLab server assigns pipeline jobs to available runners.
    - **Tags:** The `tags` field can be used to run a job on a specific GitLab runner (e.g., `tags: - runner-tag`).
    - **Containers:** GitLab's managed runners use Docker containers.