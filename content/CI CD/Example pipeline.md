```yaml
# Decides if the entire pipeline should be created.
# This prevents duplicate pipelines when pushing to a branch with an open Merge Request.
workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: always
    - if: $CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS
      when: never
    - if: $CI_COMMIT_BRANCH
      when: always

default:
  image: ruby:3.0          # Default image for all jobs
  before_script:           # Runs before every job's script
    - echo "Setting up environment..."

variables:
  # Global variables (lower priority than job variables)
  DEPLOY_TARGET: "staging"
  DATABASE_URL: "postgres://db:5432"

stages:
  - test
  - build
  - security
  - deploy

integration-test:
  stage: test
  # Service: Helper container running alongside the job (e.g., a Database)
  services:
    - name: postgres:14
      alias: db            # Hostname used to access the service
  script:
    - echo "Connecting to $DATABASE_URL..."
    - echo "Running integration tests against Postgres service..."
  # Rules: Only run this job if 'database/' folder changes
  rules:
    - changes:
        - database/**/*

# 'unit-test 1/2' and 'unit-test 2/2' will appear grouped in the UI
unit-test 1/2:
  stage: test
  script:
    - echo "Running first batch of unit tests..."

unit-test 2/2:
  stage: test
  # Inherit: Prevent this job from using global defaults
  inherit:
    default: false         # Won't use the global 'before_script'
    variables: false       # Won't use global 'DEPLOY_TARGET'
  image: python:3.9        # Overriding the default Ruby image
  script:
    - echo "Running python tests (second batch)..."

build-app:
  stage: build
  script:
    - echo "Compiling application..."
    - mkdir build
    - echo "Binary file content" > build/app.bin
  # Artifacts: Save the 'build' directory so other jobs can use it later
  artifacts:
    paths:
      - build/
    expire_in: 1 hour

security-scan:
  stage: security
  script:
    - echo "Running security scan..."
  # Rules: Logic to determine when this runs
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"  # Run automatically on schedule
      when: always
    - if: $CI_COMMIT_BRANCH == "main"       # Or run on main branch
      allow_failure: true                   # Pipeline continues even if this fails

deploy-production:
  stage: deploy
  # Needs: Starts immediately after 'build-app' finishes.
  # It ignores the 'security' stage, breaking the sequential order (DAG).
  needs:
    - job: build-app
      artifacts: true      # Downloads the artifacts from build-app
  script:
    - echo "Deploying binary from build/app.bin to Production..."
  when: manual             # Requires human approval button
```