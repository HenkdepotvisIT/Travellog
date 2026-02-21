# Travel Log - Docker Deployment

This guide explains how to deploy Travel Log as a Docker container with PostgreSQL database and AI features.

---

## Portainer Deployment (Recommended for NAS)

The easiest way to run Travel Log on your NAS using Portainer.

### Prerequisites

- Portainer running on your NAS (CE or Business)
- Internet access from the NAS (to pull the image from GitHub Container Registry)

### Step 1 – Open Portainer and Create a Stack

1. Open Portainer in your browser (`http://your-nas-ip:9000`)
2. Go to **Stacks** → **+ Add stack**
3. Give it a name, e.g. `travel-log`
4. Select **Web editor**

### Step 2 – Paste the Stack Configuration

Copy the contents of [`portainer-stack.yml`](./portainer-stack.yml) and paste it into the web editor.

```yaml
version: '3.8'

services:
  travel-log:
    image: ghcr.io/henkdepotvisit/travellog:latest
    container_name: travel-log
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATA_DIR=/app/data
      - DATABASE_URL=postgresql://travellog:${POSTGRES_PASSWORD:-travellog}@travel-log-db:5432/travellog
      - GEMINI_API_KEY=${GEMINI_API_KEY:-}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
    volumes:
      - travel_log_data:/app/data
    networks:
      - travel-log-net
    depends_on:
      travel-log-db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  travel-log-db:
    image: postgres:16-alpine
    container_name: travel-log-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=travellog
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-travellog}
      - POSTGRES_DB=travellog
    volumes:
      - travel_log_postgres:/var/lib/postgresql/data
    networks:
      - travel-log-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U travellog"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  travel_log_data:
  travel_log_postgres:

networks:
  travel-log-net:
    driver: bridge
```

### Step 3 – Set Environment Variables

Scroll down to the **Environment variables** section in Portainer and add:

| Variable | Required | Example | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes (for AI) | `sk-ant-...` | Anthropic API key from [console.anthropic.com](https://console.anthropic.com/) |
| `POSTGRES_PASSWORD` | Recommended | `MySecurePass123` | Database password (defaults to `travellog` if not set) |
| `APP_PORT` | No | `3000` | Host port (default: `3000`) |
| `GEMINI_API_KEY` | No | `AIzaSy...` | Alternative AI provider (Google Gemini) |
| `OPENAI_API_KEY` | No | `sk-...` | Alternative AI provider (OpenAI) |

### Step 4 – Deploy

Click **Deploy the stack**. Portainer will:
1. Pull the pre-built image from GitHub Container Registry
2. Pull PostgreSQL 16
3. Start both containers with automatic health checks

### Step 5 – Access the App

Open `http://your-nas-ip:3000` in your browser.

---

## Docker Compose (Manual / CLI)

For deploying directly from the source code using the terminal.

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
ANTHROPIC_API_KEY=your-anthropic-api-key-here
POSTGRES_PASSWORD=your-secure-password
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This starts:
- **travel-log** – The app on port 3000
- **travel-log-db** – PostgreSQL 16 database

### 3. Access the App

Open `http://your-server-ip:3000`.

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `3000` | Host port to expose the app on |
| `PORT` | `3000` | Internal port (do not change) |
| `DATABASE_URL` | (auto) | PostgreSQL connection string |
| `POSTGRES_PASSWORD` | `travellog` | Database password |
| `ANTHROPIC_API_KEY` | - | Anthropic API key (recommended) |
| `GEMINI_API_KEY` | - | Google Gemini API key (alternative) |
| `OPENAI_API_KEY` | - | OpenAI API key (alternative) |

### AI Features

To enable AI-powered summaries and highlights:

**Option 1: Anthropic Claude (Recommended)**
1. Get your API key at [console.anthropic.com](https://console.anthropic.com/)
2. Set `ANTHROPIC_API_KEY` in your environment or `.env` file
3. Restart the containers

The default model is `claude-haiku-4-5-20251001` (fast and cost-effective). You can also use `claude-sonnet-4-6` for higher quality output by updating the AI provider setting in the app.

**Option 2: Google Gemini (Free Tier Available)**
1. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set `GEMINI_API_KEY` in your environment or `.env` file
3. Restart the containers and change the AI provider to `gemini` in the app settings

**Option 3: OpenAI**
1. Get an API key at [OpenAI](https://platform.openai.com/api-keys)
2. Set `OPENAI_API_KEY` in your environment or `.env` file
3. Restart the containers and change the AI provider to `openai` in the app settings

---

## Synology NAS (CLI)

1. Install Docker from Package Center (or use Container Manager)
2. SSH into your NAS
3. Clone the repository:
   ```bash
   git clone https://github.com/HenkdepotvisIT/Travellog.git /volume1/docker/travel-log
   cd /volume1/docker/travel-log
   ```
4. Create your `.env` file:
   ```bash
   cp .env.example .env
   nano .env   # Add ANTHROPIC_API_KEY and POSTGRES_PASSWORD
   ```
5. Build and start:
   ```bash
   docker-compose up -d --build
   ```
6. Access at `http://your-nas-ip:3000`

---

## Updating

### Portainer
In Portainer → Stacks → travel-log → **Pull and redeploy**

### Docker Compose (CLI)
```bash
git pull
docker-compose pull   # If using pre-built image
docker-compose up -d --build
```

---

## Backup & Restore

### Database Backup
```bash
docker exec travel-log-db pg_dump -U travellog travellog > backup.sql
```

### Database Restore
```bash
cat backup.sql | docker exec -i travel-log-db psql -U travellog travellog
```

---

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
```

---

## Troubleshooting

### Container won't start
- Check logs in Portainer: click the container → **Logs**
- Or via CLI: `docker-compose logs travel-log`

### Database connection error
- Wait 30 seconds after first start for PostgreSQL to initialise
- Check: `docker-compose logs travel-log-db`

### AI not working
- Verify `ANTHROPIC_API_KEY` is set correctly (no quotes, no spaces)
- Check: `curl http://localhost:3000/api/health`
- Verify the key is active at [console.anthropic.com](https://console.anthropic.com/)

### Port conflict
- Set `APP_PORT` to a different port (e.g. `3001`) in your environment variables
