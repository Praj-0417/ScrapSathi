# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder — install ALL dependencies (including devDeps for build tools)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package.json package-lock.json ./

# Install all deps (including dev) for any build steps
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production — lean image with only runtime deps
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production dependency manifests
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --frozen-lockfile --omit=dev && npm cache clean --force

# Copy built source from builder stage
COPY --from=builder /app .

# Remove dev files not needed in production
RUN rm -rf .env.example docs scripts

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Expose the app port
EXPOSE 8000

# Health check — hits the /health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start the server
CMD ["node", "index.js"]
