# The player website: adapter-node (login/account/claim pages hold the
# HttpOnly session cookie and proxy omnicade-api server-side), packaged
# like the api so it lands in the same deployment setup. Built output is
# `node build` with PORT/HOST from the environment.
#
# Deployment env:
#   API_BASE_URL   -- omnicade-api base, e.g. https://api.omnicade.eu
#   SITE_BASE_URL  -- this site's public base, e.g. https://omnicade.eu
#                     (https turns the session cookie's Secure flag on)
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080
CMD ["node", "build"]
