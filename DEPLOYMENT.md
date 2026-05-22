# Deployment Guide - Filament Manager

This guide covers deploying the Filament Manager application using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- docker-compose installed (version 1.29 or higher)

## Quick Start

### 1. Build the Docker Image

```bash
docker-compose build
```

This will:
- Build the React frontend in a Node.js container
- Compile the Go backend with embedded frontend files
- Create a minimal Alpine Linux runtime image (~30MB)

### 2. Start the Application

```bash
docker-compose up -d
```

The application will be available at: **http://localhost:8080**

### 3. View Logs

```bash
docker-compose logs -f filament-manager
```

### 4. Stop the Application

```bash
docker-compose down
```

## Data Persistence

The SQLite database is stored in a Docker volume mapped to `./data/filament.db` on your host machine.

**Important**: The `./data` directory will be created automatically on first run.

### Backup Your Data

To backup your filament database:

```bash
# Stop the container
docker-compose down

# Copy the data directory
cp -r ./data ./data-backup-$(date +%Y%m%d)

# Restart the container
docker-compose up -d
```

### Restore from Backup

```bash
# Stop the container
docker-compose down

# Restore the data directory
cp -r ./data-backup-YYYYMMDD ./data

# Restart the container
docker-compose up -d
```

## Configuration

### Environment Variables

You can customize the application by editing `docker-compose.yml`:

```yaml
environment:
  - PORT=8080              # Application port
  - DB_PATH=/app/data/filament.db  # Database path
```

### Custom Port

To run on a different port (e.g., 3000):

```yaml
ports:
  - "3000:8080"  # Host:Container
```

Then access at: http://localhost:3000

## Building Without Docker Compose

### Manual Docker Build

```bash
docker build -t filament-manager:latest .
```

### Manual Docker Run

```bash
docker run -d \
  --name filament-manager \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -e PORT=8080 \
  -e DB_PATH=/app/data/filament.db \
  --restart unless-stopped \
  filament-manager:latest
```

## Health Check

The application includes a health check endpoint at `/health`.

Docker will automatically monitor the container health:

```bash
docker ps
```

Look for the `STATUS` column - it should show `healthy` after ~30 seconds.

Manual health check:

```bash
curl http://localhost:8080/health
```

Expected response: `OK`

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker-compose logs filament-manager
```

### Database Permission Issues

Ensure the `./data` directory has proper permissions:
```bash
chmod -R 755 ./data
```

### Port Already in Use

Change the host port in `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Use port 8081 instead
```

### Clear and Rebuild

To completely rebuild the image:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

### Security Recommendations

1. **Use HTTPS**: Deploy behind a reverse proxy (nginx, Traefik, Caddy) with SSL/TLS
2. **Restrict CORS**: Modify `handlers/middleware.go` to restrict allowed origins
3. **Backup Strategy**: Implement automated database backups
4. **Monitor Logs**: Use a log aggregation tool (ELK, Loki, etc.)

### Example nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name filament.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  filament-manager:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Multi-Architecture Support

The Dockerfile uses Alpine Linux which supports multiple architectures:
- x86_64 (amd64)
- ARM64 (aarch64)
- ARMv7 (armhf)

Build for specific platform:
```bash
docker buildx build --platform linux/amd64 -t filament-manager:latest .
```

## Updating the Application

1. Pull latest code
2. Rebuild the image
3. Restart the container

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

Your data in `./data` will be preserved.
