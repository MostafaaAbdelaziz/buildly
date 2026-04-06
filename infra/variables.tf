variable "project_id" {
  description = "GCP project ID (same as your Firebase project ID, e.g. pm-checking-app)"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Functions and Cloud Scheduler"
  type        = string
  default     = "us-central1"
}

variable "functions_source_dir" {
  description = "Relative path from the infra/ folder to the Cloud Functions source directory"
  type        = string
  default     = "../project-milestone-2/functions"
}

variable "scheduler_timezone" {
  description = "Timezone for Cloud Scheduler (IANA format). The scheduler fires every minute; actual per-site timezone conversion is done inside the function."
  type        = string
  default     = "UTC"
}
