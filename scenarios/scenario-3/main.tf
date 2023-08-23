provider "google" {
  project = var.project-id
  region  = "us-central1"
}

variable "project-id"{}


resource "google_artifact_registry_repository" "gcp_goat_repository" {
  project      = var.project-id
  location = "us-central1"  # Replace with your desired location
  repository_id = "gcp-goat"

  labels = {
    "team" = "dev"
  }

  format = "DOCKER"


}


resource "google_artifact_registry_repository_iam_binding" "binding" {
  project      = var.project-id
  location = "us-central1"
  repository = google_artifact_registry_repository.gcp_goat_repository.name 
  role = "roles/artifactregistry.reader"
  members = [
    "allUsers"
  ]
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

output "sa-key" {
  value = base64decode(google_service_account_key.sa-key.private_key)
   sensitive = true
}