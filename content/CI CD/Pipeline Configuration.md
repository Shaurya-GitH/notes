# Pipeline Configuration & Resources

* **Config File:** The pipeline is defined in `gitlab-ci.yml`.
- A pipeline can run automatically when pushing to a branch, creating MR or on a schedule. It can also be run manually.

## Pipeline Flow
A typical pipeline flow involves:
`Run Tests` $\rightarrow$ `Build Docker Image` $\rightarrow$ `Push to Registry` $\rightarrow$ `Deploy to Server`
*(Optionally perform security scans)*.

## Key Resources

### 1. Job
* The smallest unit of work. It runs in its own environment with its own script of commands inside a stage.
- All jobs in a stage run parallelly.
- Default image used in a Gitlab job is Ruby

### 2. Stage
* A group of jobs that run in parallel.
* **Sequential:** Stages themselves run sequentially (jobs run in parallel by default).
* Stages are necessary to provide sequence.

### 3. Variables
* Store values you can reuse anywhere in the pipeline.
* Can be defined inside a job, pipeline, or CI/CD settings.
* Variables are also passed to the containers running the job scripts.
- A file added in variables will give permissions to everyone to read and write.
* **Priority:** Variables defined by us have higher priority than pre-defined variables.

### 4. Default
* Keyword used to set default configuration for all other jobs in the pipeline.

### 5. Inherit
* Inheritance of default keywords and variables can be controlled using the `inherit` keyword in a job.

### 6. Groups
* Jobs can be automatically grouped for concise pipeline building.
* **Syntax:** Separate each job name with a number and a slash, colon, or space (e.g., `1/3`, `1:3`, `1 3`).