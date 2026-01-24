# Rules and Workflow

## Rules
* **Purpose:** Specify when a job or pipeline runs, or specify properties based on `IF` conditions.
* **Evaluation:** Evaluated in order until the **first match**. When found, the job is included/excluded, and the rest of the conditions are ignored.

```yaml
job:
  script: echo "Hello world!"
  rules: 
  - if: $CI_PIPELINE_SOURCE=="merge_request"
	when: manual
	allow_failure: true
```
### Common `if` Conditions
* `$CI_COMMIT_BRANCH == "main"`
* `$CI_COMMIT_TAG` (if tag exists)
* `$CI_PIPELINE_SOURCE == "schedule"`
* `$MY_VARIABLE == "true"`

### Configurations used with `if`
* **changes:** Run job only if specific file/folders change.
* **exists:** Run job only if specific file exists.
* **when:** `always`, `manual`, `never`, `delayed`, `on_success`, `on_failure`. (defaults to `never` when used with Rules)
* **allow_failure:** If `false`, pipeline stops on job failure.
* **variables:** Set variables conditionally.
* **extends:** Include templates conditionally.

## Workflow
* **Purpose:** Decides if an **entire pipeline** should be created or not.
* **Use Case:** Primarily to prevent duplicate pipelines (e.g., preventing a duplicate pipeline on push if an open Merge Request already triggered one).

```yaml
workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: always
```