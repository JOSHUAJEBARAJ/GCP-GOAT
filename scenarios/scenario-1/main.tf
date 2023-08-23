variable "project-id" {
 type        = string
 description = "project id"

}

variable "unique-name" {
 type        = string
 description = "unique-name-for-bucket"

}

provider "google" {
  project     = var.project-id 
  region      = "us-central1"  # Replace with your desired region
}

resource "google_storage_bucket" "my_bucket" {
  name          = "${var.unique-name}-backup"
  location      = "US"  # Replace with your desired location
  storage_class = "STANDARD"
  force_destroy = true
  # Make the bucket objects publicly readable
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
}

resource "google_storage_bucket_iam_member" "public_access" {
  bucket = google_storage_bucket.my_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_storage_bucket_object" "juice_shop" {
  name   = "juice-shop.zip"
  bucket = google_storage_bucket.my_bucket.name
  source = "juice-shop.zip"  # Replace with the actual path to your file
}

output "bucket_name" {
  value = google_storage_bucket.my_bucket.name
}
