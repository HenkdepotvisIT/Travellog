# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Suppress Expo telemetry and ensure non-interactive CI mode
ENV CI=1
ENV EXPO_NO_TELEMETRY=1
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install all dependencies (including devDependencies needed for the build)
RUN npm ci --legacy-peer-deps
RUN cd server && npm ci

# Copy source files
COPY . .

# Build the web app
RUN npm run build:web

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy built web app and server
COPY --from=builder /app/dist ./dist
COPY server ./server

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
CMD ["node", "server/index.js"]