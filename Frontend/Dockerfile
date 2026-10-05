# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder — install deps and build the Vite/React app
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy source
COPY . .

# Build-time environment variables (injected via Docker build args)
# These get baked into the static JS bundle at build time
ARG VITE_PROD_BASE_URL
ARG VITE_FALLBACK_PROD_BASE_URL
ARG VITE_DEV_BASE_URL
ARG VITE_BACKEND_URL
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_PROD_BASE_URL=$VITE_PROD_BASE_URL
ENV VITE_FALLBACK_PROD_BASE_URL=$VITE_FALLBACK_PROD_BASE_URL
ENV VITE_DEV_BASE_URL=$VITE_DEV_BASE_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the production bundle
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production — serve static files with Nginx
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config (handles SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
