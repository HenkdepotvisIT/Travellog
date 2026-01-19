# Travel Log - Docker Deployment

This guide explains how to deploy Travel Log as a Docker container on your NAS.

## Quick Start

### Using Docker Compose (Recommended)

1. Clone or copy the project to your NAS
2. Run:
   ```bash
   docker-compose up -d
   ```
3. Access the app at `http://your-nas-ip:3000`

### Using Docker CLI

```bash
# Build the image
docker build -t travel-log .

# Run the container
docker run -d \
  --name travel-log \
  -p 3000:3000 \
  -v /path/to/your/data:/app/data \
  --restart unless-stopped \
  travel-log
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `DATA_DIR` | `/app/data` | Directory for persistent data |
| `NODE_ENV` | `production` | Node environment |

### Data Persistence

All data is stored in JSON files in the `/app/data` directory:

- `adventures.json` - Your travel adventures
- `narratives.json` - Adventure stories/narratives
- `settings.json` - App settings
- `favorites.json` - Favorited adventures
- `hidden.json` - Hidden adventures
- `connection.json` - Immich connection settings
- `sync-status.json` - Last sync timestamp

**Important:** Mount a volume to `/app/data` to persist data across container restarts!

## Synology NAS Setup

1. Open Docker in DSM
2. Go to Registry and search for your image (or build locally)
3. Create a container with:
   - Port: 3000 → 3000
   - Volume: `/volume1/docker/travel-log/data` → `/app/data`
4. Start the container

## Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Backup

Your data is stored in the mounted volume. To backup:

```bash
# Create a backup
tar -czvf travel-log-backup.tar.gz /path/to/your/data

# Or use the app's export feature
curl http://localhost:3000/api/export > backup.json
```

## Restore

```bash
# From tar backup
tar -xzvf travel-log-backup.tar.gz -C /path/to/your/data

# From JSON export
curl -X POST -H "Content-Type: application/json" \
  -d @backup.json http://localhost:3000/api/import
```

## Connecting to Immich

1. Open the app in your browser
2. Click the connection button (🔗) in the header
3. Enter your Immich server URL and API key
4. Click Connect

The connection is stored persistently, so you only need to do this once.

## Troubleshooting

### Container won't start
- Check logs: `docker logs travel-log`
- Ensure port 3000 is not in use
- Verify the data directory is writable

### Data not persisting
- Ensure you've mounted a volume to `/app/data`
- Check volume permissions

### Can't connect to Immich
- Verify your Immich server is accessible from the container
- Check that the API key is correct
- Ensure CORS is enabled on your Immich server

## Health Check

The container includes a health check endpoint:

```bash
curl http://localhost:3000/api/health
# Returns: {"status":"ok","timestamp":"..."}