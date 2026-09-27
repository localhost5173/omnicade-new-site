# Multi-stage Dockerfile for SvelteKit with Alpine
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies needed for building native modules
RUN apk add --no-cache libc6-compat
# Copy package files (pnpm, not npm)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Enable pnpm via corepack and install dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Build the application (requires @sveltejs/adapter-node in svelte.config.js)
RUN pnpm run build

# Production stage
FROM node:24-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Traefik / Dokploy routing configuration.
# Set TRAEFIK_HOST to a real hostname for Let's Encrypt HTTPS.
ARG TRAEFIK_HOST=localhost

LABEL traefik.enable="true" \
	traefik.http.services.omnicade.loadbalancer.server.port="3000" \
	traefik.http.routers.omnicade.rule="Host(`${TRAEFIK_HOST}`)" \
	traefik.http.routers.omnicade.entrypoints="websecure" \
	traefik.http.routers.omnicade.tls="true" \
	traefik.http.routers.omnicade.tls.certresolver="letsencrypt" \
	traefik.http.routers.omnicade-http.rule="Host(`${TRAEFIK_HOST}`)" \
	traefik.http.routers.omnicade-http.entrypoints="web" \
	traefik.http.routers.omnicade-http.middlewares="omnicade-redirect-to-https" \
	traefik.http.middlewares.omnicade-redirect-to-https.redirectscheme.scheme="https"

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Copy built application + pruned node_modules from builder stage
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json

# Switch to non-root user
USER sveltekit

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
# adapter-node needs ORIGIN set to your real public URL for things like
# form actions / CSRF checks to work correctly behind Traefik.
ENV ORIGIN=https://localhost

# Start the application
CMD ["dumb-init", "node", "build"]
