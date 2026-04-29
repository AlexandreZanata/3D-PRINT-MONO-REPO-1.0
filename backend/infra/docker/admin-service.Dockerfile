# ─── admin-service — multi-stage production image ────────────────────────────
FROM node:22-alpine AS builder

# argon2 requires python3 + make + g++ to compile native bindings
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/admin-service/package.json ./apps/admin-service/
COPY packages/application/package.json ./packages/application/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/domain/package.json ./packages/domain/
COPY packages/utils/package.json ./packages/utils/
COPY packages/infra/db-adapter/package.json ./packages/infra/db-adapter/
COPY packages/infra/cache-adapter/package.json ./packages/infra/cache-adapter/

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild argon2

COPY apps/admin-service ./apps/admin-service
COPY packages/application ./packages/application
COPY packages/contracts ./packages/contracts
COPY packages/domain ./packages/domain
COPY packages/utils ./packages/utils
COPY packages/infra/db-adapter ./packages/infra/db-adapter
COPY packages/infra/cache-adapter ./packages/infra/cache-adapter

RUN pnpm --filter @repo/utils build
RUN pnpm --filter @repo/domain build
RUN pnpm --filter @repo/contracts build
RUN pnpm --filter @repo/application build
RUN pnpm --filter @repo/db-adapter build
RUN pnpm --filter @repo/cache-adapter build
RUN pnpm --filter @repo/admin-service build

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

# python3/make/g++ needed to rebuild argon2 native binary in runtime stage
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/admin-service/package.json ./apps/admin-service/
COPY packages/application/package.json ./packages/application/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/domain/package.json ./packages/domain/
COPY packages/utils/package.json ./packages/utils/
COPY packages/infra/db-adapter/package.json ./packages/infra/db-adapter/
COPY packages/infra/cache-adapter/package.json ./packages/infra/cache-adapter/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts
RUN pnpm rebuild argon2

COPY --from=builder /repo/apps/admin-service/dist ./apps/admin-service/dist
COPY --from=builder /repo/packages/application/dist ./packages/application/dist
COPY --from=builder /repo/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /repo/packages/domain/dist ./packages/domain/dist
COPY --from=builder /repo/packages/utils/dist ./packages/utils/dist
COPY --from=builder /repo/packages/infra/db-adapter/dist ./packages/infra/db-adapter/dist
COPY --from=builder /repo/packages/infra/cache-adapter/dist ./packages/infra/cache-adapter/dist

WORKDIR /repo/apps/admin-service

USER node

ENV NODE_ENV=production

EXPOSE 3002

CMD ["node", "dist/index.js"]
