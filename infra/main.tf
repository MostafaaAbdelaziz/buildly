terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ─── Enable required APIs ──────────────────────────────────────────────────────

resource "google_project_service" "cloudfunctions" {
  service            = "cloudfunctions.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudbuild" {
  service            = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "pubsub" {
  service            = "pubsub.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudscheduler" {
  service            = "cloudscheduler.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "firestore" {
  service            = "firestore.googleapis.com"
  disable_on_destroy = false
}

# ─── Cloud Storage bucket for function source ──────────────────────────────────

resource "google_storage_bucket" "functions_bucket" {
  name                        = "${var.project_id}-functions-source"
  location                    = "US"
  uniform_bucket_level_access = true
  force_destroy               = true
}

# ─── Zip the functions source ─────────────────────────────────────────────────

data "archive_file" "functions_zip" {
  type        = "zip"
  source_dir  = var.functions_source_dir
  output_path = "${path.module}/.terraform/functions.zip"
  excludes    = ["node_modules", ".git", "*.log"]
}

resource "google_storage_bucket_object" "functions_zip" {
  name   = "functions-${data.archive_file.functions_zip.output_md5}.zip"
  bucket = google_storage_bucket.functions_bucket.name
  source = data.archive_file.functions_zip.output_path
}

# ─── Pub/Sub topic ────────────────────────────────────────────────────────────

resource "google_pubsub_topic" "checkin_nudge" {
  name    = "bob-checkin-nudge"
  project = var.project_id

  depends_on = [google_project_service.pubsub]
}

# ─── Service account for Cloud Scheduler ──────────────────────────────────────

resource "google_service_account" "scheduler_sa" {
  account_id   = "bob-checkin-scheduler"
  display_name = "Bob Check-in Scheduler SA"
}

resource "google_pubsub_topic_iam_member" "scheduler_publisher" {
  topic  = google_pubsub_topic.checkin_nudge.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.scheduler_sa.email}"
}

# ─── Cloud Scheduler: fire every minute ───────────────────────────────────────

resource "google_cloud_scheduler_job" "checkin_trigger" {
  name      = "bob-checkin-reminder-trigger"
  schedule  = "* * * * *"
  time_zone = var.scheduler_timezone
  region    = var.region

  pubsub_target {
    topic_name = google_pubsub_topic.checkin_nudge.id
    data       = base64encode("{\"trigger\":\"checkin\"}")
  }

  depends_on = [
    google_project_service.cloudscheduler,
    google_pubsub_topic_iam_member.scheduler_publisher,
  ]
}

# ─── Cloud Function 1: sendCheckInReminders (Pub/Sub trigger) ─────────────────

resource "google_cloudfunctions_function" "send_checkin_reminders" {
  name        = "sendCheckInReminders"
  description = "Sends 2PM check-in push reminders to all active site members"
  runtime     = "nodejs20"
  region      = var.region

  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.functions_bucket.name
  source_archive_object = google_storage_bucket_object.functions_zip.name
  entry_point           = "sendCheckInReminders"
  timeout               = 540

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.checkin_nudge.id
  }

  environment_variables = {
    GCLOUD_PROJECT = var.project_id
  }

  depends_on = [
    google_project_service.cloudfunctions,
    google_project_service.cloudbuild,
  ]
}

# ─── Cloud Function 2: notifyPMOnNotOnTrack (Firestore trigger) ───────────────

resource "google_cloudfunctions_function" "notify_pm_not_on_track" {
  name        = "notifyPMOnNotOnTrack"
  description = "Push-notifies the PM when a site member reports 'not on track'"
  runtime     = "nodejs20"
  region      = var.region

  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.functions_bucket.name
  source_archive_object = google_storage_bucket_object.functions_zip.name
  entry_point           = "notifyPMOnNotOnTrack"
  timeout               = 60

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.write"
    resource   = "projects/${var.project_id}/databases/(default)/documents/daily_check_ins/{checkInId}"
    failure_policy {
      retry = false
    }
  }

  environment_variables = {
    GCLOUD_PROJECT = var.project_id
  }

  depends_on = [
    google_project_service.cloudfunctions,
    google_project_service.cloudbuild,
    google_project_service.firestore,
  ]
}

# ─── IAM: allow unauthenticated invocations is NOT needed ─────────────────────
# Both functions are triggered internally (Pub/Sub + Firestore), not via HTTP.
