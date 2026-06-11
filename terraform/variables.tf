variable "app_port" {
  description = "Port to expose the application on the host"
  type        = number
  default     = 8080
}

variable "app_image" {
  description = "Docker image for the application"
  type        = string
  default     = "ghcr.io/dengoan969/naumenpracticesanatoriumproject/sanatorium-project:latest"
}

variable "app_container_name" {
  description = "Name of the application container"
  type        = string
  default     = "sanatorium-app"
}

variable "app_replicas" {
  description = "Number of application container replicas"
  type        = number
  default     = 1
}

variable "db_image" {
  description = "Docker image for the database"
  type        = string
  default     = "postgres:17-alpine"
}

variable "db_container_name" {
  description = "Name of the database container"
  type        = string
  default     = "sanatorium-db"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "sanatorium_db"
}

variable "db_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "sanatorium"
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  default     = "sanatorium_secret"
  sensitive   = true
}

variable "network_name" {
  description = "Name of the Docker network"
  type        = string
  default     = "sanatorium-net"
}

variable "volume_name" {
  description = "Name of the database volume"
  type        = string
  default     = "sanatorium-db-data"
}

variable "jwt_secret" {
  description = "JWT signing secret key"
  type        = string
  default     = "sanatorium_jwt_secret_key_for_dev"
  sensitive   = true
}

variable "cors_origins" {
  description = "Allowed CORS origins"
  type        = string
  default     = "http://localhost:3000"
}
