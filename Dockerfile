FROM node:22-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN DATABASE_URL=postgresql://user:password@localhost:5432/rt_kas \
    BETTER_AUTH_SECRET=build-time-placeholder-secret-32-chars \
    BETTER_AUTH_URL=http://localhost:3030 \
    REDIS_URL=redis://localhost:6379 \
    NODE_ENV=production \
    npm run build

FROM node:22-alpine AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3030 \
    HOSTNAME=0.0.0.0 \
    NODE_OPTIONS=--max-old-space-size=512

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3030

CMD ["node", "server.js"]
