output "pubsub_topic_id" {
  description = "Pub/Sub topic ID used by Cloud Scheduler"
  value       = google_pubsub_topic.checkin_nudge.id
}

output "scheduler_job_name" {
  description = "Name of the Cloud Scheduler job (fires every minute)"
  value       = google_cloud_scheduler_job.checkin_trigger.name
}

output "send_checkin_reminders_function" {
  description = "Cloud Function name for the Pub/Sub-triggered reminder sender"
  value       = google_cloudfunctions_function.send_checkin_reminders.name
}

output "notify_pm_function" {
  description = "Cloud Function name for the Firestore-triggered PM notifier"
  value       = google_cloudfunctions_function.notify_pm_not_on_track.name
}

output "functions_bucket" {
  description = "GCS bucket holding the deployed function source zip"
  value       = google_storage_bucket.functions_bucket.name
}
