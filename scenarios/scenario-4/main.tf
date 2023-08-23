provider "google" {
  project = var.project-id
  region  = "us-central1"
}

variable "project-id" {
 type        = string
 description = "project id"
}

variable "project_number"{}


resource "google_service_account" "gcp-sa-account" {
  account_id   = "gcp-goat"
  display_name = "gcp-goat-sa-account"
  project      = var.project-id
}

resource "google_compute_firewall" "test_node_port" {
  name    = "node-port"
  network = "default"  # Replace with your network name if needed

  allow {
    protocol = "tcp"
    ports    = ["30003"]
  }

  source_ranges = ["0.0.0.0/0"]  # Adjust to your desired source ranges
}

resource "google_project_iam_member" "workload_identity_binding" {
   project      = var.project-id
  role    = "roles/iam.workloadIdentityUser"
  member  = "serviceAccount:${var.project-id}.svc.id.goog[test/k8s-sa]"
}

output "service_account_email" {
  value = google_service_account.gcp-sa-account.email
}




resource "google_storage_bucket" "internal-bucket" {
  name          = "gcp-goat-internal-${random_string.random_name.result}"
  force_destroy = true
  location      = "us-central1"
  storage_class = "STANDARD"
 }


resource "google_project_iam_binding" "sa-iam-binding" {
  project = var.project-id
  role    = "roles/editor"

  members = [
    "serviceAccount:${google_service_account.gcp-sa-account.email}",
    "serviceAccount:${var.project_number}@cloudservices.gserviceaccount.com"
  ]
}




