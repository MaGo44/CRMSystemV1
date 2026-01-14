# Etapa 1: Build
FROM node:18-alpine AS builder

RUN npm install -g pnpm@10.26.2

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# RUN pnpm install --frozen-lockfile --prod
RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate

RUN pnpm build

# Etapa 2: Production
FROM node:18-alpine

RUN npm install -g pnpm@8

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]