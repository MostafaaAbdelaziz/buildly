# Bob App — Infrastructure (Terraform)

Provisions GCP/Firebase resources for the 2PM check-in push notification system.

## Resources created

| Resource | Name | Purpose |
|---|---|---|
| Pub/Sub topic | `bob-checkin-nudge` | Message bus between Scheduler and Cloud Function |
| Cloud Scheduler job | `bob-checkin-reminder-trigger` | Fires every minute (cron `* * * * *`) |
| Cloud Function | `sendCheckInReminders` | Reads sites, finds matches for current minute, sends Expo push notifications |
| Cloud Function | `notifyPMOnNotOnTrack` | Firestore trigger; pushes PM when a "not on track" check-in is written |
| GCS bucket | `{project_id}-functions-source` | Stores the function source zip |
| Service account | `bob-checkin-scheduler` | Allows Cloud Scheduler to publish to Pub/Sub |

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5
- [Google Cloud SDK](https://cloud.google.com/sdk) (`gcloud auth application-default login`)
- Firebase project already exists (same project ID)
- Billing enabled on the GCP project

## First-time setup

```bash
# Authenticate
gcloud auth application-default login

cd infra/

# Copy and fill in your project ID
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set project_id = "your-project-id"

# Initialise Terraform
terraform init

# Preview changes
terraform plan

# Apply
terraform apply
```

## Deploying function code changes

Terraform zips and uploads the functions source automatically (`archive_file` data source).
When you change `functions/index.js`, re-run `terraform apply` — it detects the md5 change and
re-uploads the zip, then updates both functions.

Alternatively, use the Firebase CLI directly (faster for code-only changes):

```bash
cd project-milestone-2/functions
npm install
firebase deploy --only functions
```

## Destroying

```bash
terraform destroy
```

This will delete the Scheduler, Pub/Sub topic, Cloud Functions, and GCS bucket.
It will **not** delete the Firebase project, Firestore data, or Firebase Auth.

## Timezone note

`scheduler_timezone` in `terraform.tfvars` only affects when the Scheduler runs
(it fires every minute anyway, so the timezone is cosmetic).
Per-site timezone is stored in `sites/{id}.timezone` (IANA format, e.g. `"America/Toronto"`)
and used inside the Cloud Function for the actual time comparison.
