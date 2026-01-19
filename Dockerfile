# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the web version
RUN npm run build:web

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies for the API server
COPY package*.json ./
RUN npm ci --only=production

# Copy built web assets
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server

# Create data directory for persistence
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "server/index.js"]