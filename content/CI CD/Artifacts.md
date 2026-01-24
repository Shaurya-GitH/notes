> [!info] **Definition**: Files we want to save after a job finishes (build outputs, reports, test results) which can also be used by other jobs.

**Storage**: The mentioned paths are packaged, zipped, and uploaded to GitLab.

**Usage**: Future jobs download, unzip, and install these onto their container instances.

```yaml
artifacts:
  paths:
  - /example/file.txt
  - /example2	  
```

> [!note] By default, a job will download and extract all artifacts from the jobs of previous stages
	> - We can use `dependencies: []` to control this

## DAG pipeline

- By default, stages are run sequentially. We can use `needs` to break that order and let a job start as soon as the specific jobs it lists are finished (creating a DAG pipeline)

```yaml
needs:
  - job: build-app
    artifacts: true #False by default
```
