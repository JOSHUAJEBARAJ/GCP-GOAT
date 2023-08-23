provider "google" {
  project = var.project-id
  region  = "us-central1"
}

variable "project-id" {
 type        = string
 description = "project id"
}


resource "google_service_account" "gcp-sa-account" {
  account_id   = "gcp-goat"
  display_name = "gcp-goat-sa-account"
  project      = var.project-id
}

resource "google_service_account_key" "sa-key" {
  service_account_id = google_service_account.gcp-sa-account.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}


resource "google_storage_bucket" "internal-bucket" {
  name          = "gcp-goat-internal-${random_string.random_name.result}"
  force_destroy = true
  location      = "us-central1"
  storage_class = "STANDARD"
 }


resource "google_project_iam_binding" "sa-iam-binding" {
  project = var.project-id
  role    = "roles/iam.serviceAccountTokenCreator"

  members = [
    "serviceAccount:${google_service_account.gcp-sa-account.email}",
  ]
}


output "sa-key" {
  value = base64decode(google_service_account_key.sa-key.private_key)
   sensitive = true
}