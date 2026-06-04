# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# ---- Dependencies ----
FROM base AS deps
RUN npm ci

# ---- Builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner ----
FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    apk add --no-cache wget chromium
WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
