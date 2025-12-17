# Docker Deployment Guide

This guide shows how to run Esther using Docker - perfect for ensuring it works the same way for everyone.

## Quick Start with Docker

### Prerequisites
- Docker installed on your system
  - **Windows/macOS**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
  - **Linux**: `sudo apt-get install docker.io` (Ubuntu) or equivalent

### Run Esther with One Command

```bash
# Clone the repository
git clone https://github.com/mehrunes77/Esther.git
cd Esther

# Run with Docker Compose (easiest)
docker-compose up

# Wait for "Listening on" messages, then open:
# http://localhost:3001
```

That's it! Everything runs inside the container - no Node.js installation needed.

---

## Why Docker?

**Problem**: "Works on my machine but not on yours"
```
- Person A: Node 18, macOS
- Person B: Node 22, Windows
- Person C: Node 20, Ubuntu
- Result: Esther works for A but breaks for B and C
```

**Solution**: Docker
```
- Docker image: Node 20-alpine + all dependencies
- Person A: Same environment ✅
- Person B: Same environment ✅
- Person C: Same environment ✅
- Result: Esther works for everyone ✅
```

---

## Docker Files Explained

### `Dockerfile` (Development)
- Uses Node 20 with build tools
- Installs all dependencies
- Builds frontend and backend
- Runs both servers
- Great for development and testing

### `Dockerfile.prod` (Production)
- Multi-stage build (smaller final image)
- Only includes production files
- Optimized for cloud deployment
- Smaller Docker image (~200MB vs 500MB)
- Faster startup time

### `docker-compose.yml`
- Orchestrates container startup
- Maps ports 3001 (frontend) and 5001 (backend)
- Sets environment variables
- Allows live code editing with volumes

### `.dockerignore`
- Excludes unnecessary files (like `.git`, `node_modules`)
- Speeds up Docker build
- Reduces image size

---

## Usage Scenarios

### Scenario 1: Local Development

```bash
docker-compose up
# Open http://localhost:3001
# Edit code, changes appear instantly
```

### Scenario 2: Test Before Push

```bash
# Build production image
docker build -f Dockerfile.prod -t esther-test .

# Run it
docker run -p 3001:3001 -p 5001:5001 esther-test

# Test at http://localhost:3001
```

### Scenario 3: Cloud Deployment (Heroku)

```bash
# Set up Heroku
heroku login
heroku create my-esther-app
heroku container:push web
heroku container:release web

# App runs at https://my-esther-app.herokuapp.com
```

### Scenario 4: Self-Hosted Server

```bash
# SSH into your server
ssh user@your-server.com

# Clone and run
git clone https://github.com/mehrunes77/Esther.git
cd Esther
docker-compose up -d  # -d runs in background

# App available at http://your-server.com:3001
```

### Scenario 5: GitHub Actions CI/CD

Automatically build Docker image on every push:

```yaml
# See .github/workflows/docker.yml
# Builds and pushes to Docker Hub automatically
```

---

## Common Docker Commands

```bash
# Build image
docker build -t esther .

# Run container
docker run -p 3001:3001 -p 5001:5001 esther

# Stop running container
docker stop <container_id>

# View container logs
docker logs <container_id>

# Remove image
docker rmi esther

# Remove container
docker rm <container_id>

# List running containers
docker ps

# List all images
docker images
```

---

## Troubleshooting Docker

### Port Already in Use

```bash
# Use different ports
docker run -p 8001:3001 -p 8501:5001 esther
# Then open http://localhost:8001
```

### Container Exits Immediately

```bash
# Check logs
docker logs <container_id>

# Run interactively to see errors
docker run -it esther sh
```

### Out of Disk Space

```bash
# Clean up unused Docker resources
docker system prune

# Remove dangling images
docker image prune -a
```

### Can't Access from Network

```bash
# Bind to all interfaces
docker run -p 0.0.0.0:3001:3001 -p 0.0.0.0:5001:5001 esther

# Then access from other machines at http://<your-ip>:3001
```

---

## Docker Compose Reference

**Start all services**:
```bash
docker-compose up
```

**Run in background**:
```bash
docker-compose up -d
```

**Stop all services**:
```bash
docker-compose down
```

**View logs**:
```bash
docker-compose logs -f

# Specific service
docker-compose logs -f esther
```

**Rebuild after code changes**:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## Production Deployment

### Using Docker Hub

```bash
# Build and tag
docker build -t username/esther:1.0.0 .

# Push to Docker Hub
docker push username/esther:1.0.0

# Others can now run
docker run username/esther:1.0.0
```

### Using GitHub Container Registry

```bash
# Login to GHCR
echo $TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build and push
docker build -t ghcr.io/username/esther:1.0.0 .
docker push ghcr.io/username/esther:1.0.0
```

### Deploy to Cloud Platforms

**AWS ECS**:
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag esther:latest <account>.dkr.ecr.us-east-1.amazonaws.com/esther:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/esther:latest
```

**Google Cloud Run**:
```bash
docker tag esther:latest gcr.io/PROJECT_ID/esther:latest
docker push gcr.io/PROJECT_ID/esther:latest
gcloud run deploy esther --image gcr.io/PROJECT_ID/esther:latest
```

**Azure Container Instances**:
```bash
az acr build --registry myregistry --image esther:latest .
az container create --resource-group mygroup --name esther --image myregistry.azurecr.io/esther:latest --ports 3001 5001
```

---

## Benefits Summary

✅ **Works Everywhere** - Same environment on Windows, Mac, Linux  
✅ **No Setup Required** - Just `docker-compose up`  
✅ **Isolated** - Doesn't interfere with your system  
✅ **Reproducible** - Same version every time  
✅ **Easy Deployment** - Push to any cloud platform  
✅ **Easy Scaling** - Run multiple containers  
✅ **Version Control** - Dockerfile in Git tracks configuration  

---

## Next Steps

1. Install Docker
2. Run `docker-compose up`
3. Open `http://localhost:3001`
4. Enjoy Esther with zero Node.js setup!

