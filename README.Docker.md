# Travel Log - Docker Deployment

This guide explains how to deploy Travel Log as a Docker container with PostgreSQL database and AI features.

## Quick Start

### 1. Configure Environment

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Gemini API key:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

**Get your free Gemini API key at:** https://aistudio.google.com/app/apikey

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This will start:
- **travel-log**: The main application on port 3000
- **postgres**: PostgreSQL database for persistent storage

### 3. Access the App

Open `http://your-server-ip:3000` in your browser.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `DATABASE_URL` | (auto) | PostgreSQL connection string |
| `GEMINI_API_KEY` | - | Your Google Gemini API key (recommended) |
| `OPENAI_API_KEY` | - | Your OpenAI API key (alternative) |

### AI Features

To enable AI-powered summaries and highlights:

**Option 1: Google Gemini (Recommended - Free Tier Available)**
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add `GEMINI_API_KEY=your-key` to your `.env` file
3. Restart the containers

**Option 2: OpenAI**
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add `OPENAI_API_KEY=your-key` to your `.env` file
3. Restart the containers

AI features include:
- **Summary Generation**: Creates a 2-3 sentence summary of your adventure
- **Highlights**: Generates 4-6 bullet-point highlights
- **Story Writing**: Creates a full narrative in different styles (personal, blog, poetic, factual)

### Database

Data is stored in PostgreSQL with the following tables:
- `adventures` - Your travel adventures
- `narratives` - Custom user stories
- `ai_summaries` - Cached AI-generated content
- `settings` - App configuration
- `proxy_headers` - Cloudflare/proxy authentication headers

Data persists in a Docker volume (`postgres_data`).

## Synology NAS Setup

1. Install Docker from Package Center
2. Create a folder for the app: `/volume1/docker/travel-log`
3. Copy `docker-compose.yml` and `.env` to that folder
4. SSH into your NAS and run:
   ```bash
   cd /volume1/docker/travel-log
   docker-compose up -d
   ```
5. Access at `http://your-nas-ip:3000`

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

### Database Backup
```bash
docker exec travel-log-db pg_dump -U travellog travellog > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker exec -i travel-log-db psql -U travellog travellog
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Wait for database to initialize on first start

### AI Not Working
- Verify GEMINI_API_KEY or OPENAI_API_KEY is set correctly
- Check server logs: `docker-compose logs travel-log`
- For Gemini: Ensure you have access to the API (check quotas at Google AI Studio)

### Container Won't Start
- Check logs: `docker-compose logs`
- Ensure ports 3000 and 5432 are available
- Verify Docker has enough resources

## Health Check

```bash
curl http://localhost:3000/api/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "ai": {
    "openai": "not configured",
    "gemini": "configured"
  }
}