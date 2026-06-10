output "app_container_name" {
  description = "Name of the running application container"
  value       = docker_container.app.name
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://localhost:${var.app_port}"
}

output "app_container_ip" {
  description = "Internal IP of the application container"
  value       = docker_container.app.network_data[0].ip_address
}

output "db_container_name" {
  description = "Name of the running database container"
  value       = docker_container.db.name
}

output "db_container_ip" {
  description = "Internal IP of the database container"
  value       = docker_container.db.network_data[0].ip_address
}

output "network_name" {
  description = "Name of the Docker network"
  value       = docker_network.sanatorium_net.name
}

output "volume_name" {
  description = "Name of the database volume"
  value       = docker_volume.db_data.name
}
