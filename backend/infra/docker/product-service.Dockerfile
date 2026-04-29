# ─── product-service — multi-stage production image ──────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/product-service/package.json ./apps/product-service/
COPY packages/application/package.json ./packages/application/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/domain/package.json ./packages/domain/
COPY packages/utils/package.json ./packages/utils/
COPY packages/infra/db-adapter/package.json ./packages/infra/db-adapter/
COPY packages/infra/cache-adapter/package.json ./packages/infra/cache-adapter/
COPY packages/infra/queue-adapter/package.json ./packages/infra/queue-adapter/
COPY packages/infra/sse-adapter/package.json ./packages/infra/sse-adapter/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY apps/product-service ./apps/product-service
COPY packages/application ./packages/application
COPY packages/contracts ./packages/contracts
COPY packages/domain ./packages/domain
COPY packages/utils ./packages/utils
COPY packages/infra/db-adapter ./packages/infra/db-adapter
COPY packages/infra/cache-adapter ./packages/infra/cache-adapter
COPY packages/infra/queue-adapter ./packages/infra/queue-adapter
COPY packages/infra/sse-adapter ./packages/infra/sse-adapter

RUN pnpm --filter @repo/utils build
RUN pnpm --filter @repo/domain build
RUN pnpm --filter @repo/contracts build
RUN pnpm --filter @repo/application build
RUN pnpm --filter @repo/db-adapter build
RUN pnpm --filter @repo/cache-adapter build
RUN pnpm --filter @repo/queue-adapter build
RUN pnpm --filter @repo/sse-adapter build
RUN pnpm --filter @repo/product-service build

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/product-service/package.json ./apps/product-service/
COPY packages/application/package.json ./packages/application/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/domain/package.json ./packages/domain/
COPY packages/utils/package.json ./packages/utils/
COPY packages/infra/db-adapter/package.json ./packages/infra/db-adapter/
COPY packages/infra/cache-adapter/package.json ./packages/infra/cache-adapter/
COPY packages/infra/queue-adapter/package.json ./packages/infra/queue-adapter/
COPY packages/infra/sse-adapter/package.json ./packages/infra/sse-adapter/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /repo/apps/product-service/dist ./apps/product-service/dist
COPY --from=builder /repo/packages/application/dist ./packages/application/dist
COPY --from=builder /repo/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /repo/packages/domain/dist ./packages/domain/dist
COPY --from=builder /repo/packages/utils/dist ./packages/utils/dist
COPY --from=builder /repo/packages/infra/db-adapter/dist ./packages/infra/db-adapter/dist
COPY --from=builder /repo/packages/infra/cache-adapter/dist ./packages/infra/cache-adapter/dist
COPY --from=builder /repo/packages/infra/queue-adapter/dist ./packages/infra/queue-adapter/dist
COPY --from=builder /repo/packages/infra/sse-adapter/dist ./packages/infra/sse-adapter/dist

WORKDIR /repo/apps/product-service

USER node

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/index.js"]
