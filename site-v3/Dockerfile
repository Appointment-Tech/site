# v3 — o site dinâmico, servido em v3.marcaumappointment.com.
#
# Mesma forma da v1: TanStack Start com o preset nitro "node-server", então a
# saída é um servidor Node comum, não um Cloudflare Worker. E `slim`
# (Debian/glibc), não `alpine` (musl): o lightningcss do Tailwind v4 traz
# binários nativos que quebram com "Cannot find module" em musl.
#
# O contexto de build é a pasta site-v3/, não a raiz do repo: a v3 é um
# projeto próprio, com package.json e node_modules separados da v1.

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
