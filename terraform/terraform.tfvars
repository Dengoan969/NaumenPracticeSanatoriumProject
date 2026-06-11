app_port       = 8080
app_image      = "ghcr.io/dengoan969/naumenpracticesanatoriumproject/sanatorium-project:latest"
app_container_name = "sanatorium-app"
app_replicas   = 1

db_image       = "postgres:17-alpine"
db_container_name = "sanatorium-db"
db_name        = "sanatorium_db"
db_user        = "sanatorium"
db_password    = "sanatorium_secret"

network_name   = "sanatorium-net"
volume_name    = "sanatorium-db-data"

jwt_secret     = "sanatorium_jwt_secret_key_for_dev"
cors_origins   = "http://localhost:3000"
