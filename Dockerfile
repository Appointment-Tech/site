# v1 — TanStack Start app (SSR + /api/invites + /api/pricing-inquiries),
# built with the nitro "node-server" preset (see vite.config.ts) so the
# output is a plain Node server, not a Cloudflare Worker.
#
# Using `slim` (Debian/glibc), not `alpine` (musl) — Tailwind CSS v4's
# lightningcss engine ships native bindings that are a known source of
# "Cannot find module" failures on musl. Not worth the smaller image here.

FROM node:22-slim AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
