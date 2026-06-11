resource "docker_network" "sanatorium_net" {
  name   = var.network_name
  driver = "bridge"
}

resource "docker_volume" "db_data" {
  name = var.volume_name
}

resource "docker_image" "app" {
  name = var.app_image

  keep_locally = true
}

resource "docker_image" "postgres" {
  name = var.db_image

  keep_locally = true
}

resource "docker_container" "db" {
  image = docker_image.postgres.image_id
  name  = var.db_container_name

  env = [
    "POSTGRES_DB=${var.db_name}",
    "POSTGRES_USER=${var.db_user}",
    "POSTGRES_PASSWORD=${var.db_password}"
  ]

  networks_advanced {
    name = docker_network.sanatorium_net.name
  }

  volumes {
    volume_name    = docker_volume.db_data.name
    container_path = "/var/lib/postgresql/data"
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U ${var.db_user} -d ${var.db_name}"]
    interval = "10s"
    timeout  = "5s"
    retries  = 5
  }

  restart = "unless-stopped"

  lifecycle {
    ignore_changes = [
      healthcheck,
    ]
  }
}

resource "docker_container" "app" {
  image = docker_image.app.image_id
  name  = var.app_container_name

  env = [
    "SPRING_PROFILES_ACTIVE=production",
    "SPRING_DATASOURCE_URL=jdbc:postgresql://${var.db_container_name}:5432/${var.db_name}",
    "SPRING_DATASOURCE_USERNAME=${var.db_user}",
    "SPRING_DATASOURCE_PASSWORD=${var.db_password}",
    "SPRING_JPA_HIBERNATE_DDL_AUTO=update",
    "POLYTECHNIK_APP_JWTSECRET=${var.jwt_secret}",
    "POLYTECHNIK_APP_JWTEXPIRATIONMS=86400000",
    "POLYTECHNIK_APP_CORS_ALLOWEDORIGINS=${var.cors_origins}",
    "NEWS_UPLOAD_DIR=/app/uploads/news",
    "FILE_MAX_SIZE=5MB",
    "FILE_ALLOWED_TYPES=image/jpeg,image/png,image/gif"
  ]

  ports {
    internal = 8080
    external = var.app_port
  }

  networks_advanced {
    name = docker_network.sanatorium_net.name
  }

  depends_on = [docker_container.db]

  restart = "unless-stopped"

  must_run = true
}
