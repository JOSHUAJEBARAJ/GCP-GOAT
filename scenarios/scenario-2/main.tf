variable "project-id" {
 type        = string
 description = "project id"

}

provider "google" {
  project = var.project-id 
  region  = "asia-east1"
}

resource "google_sql_database_instance" "public_instance" {
  name             = "gcp-goat-public-instance-${random_string.random_name.result}"
  database_version = "MYSQL_5_7"
  region           = "asia-east1"
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
        
      }
    }
  }
  deletion_protection  = "false"
}

resource "google_sql_user" "users" {
name = "root"
instance = "${google_sql_database_instance.public_instance.name}"
host = "%"
}

output "instance_ip" {
  value = google_sql_database_instance.public_instance.ip_address[0]
}

