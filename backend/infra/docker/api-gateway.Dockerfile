# ─── api-gateway — multi-stage production image ───────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/utils/package.json ./packages/utils/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY apps/api-gateway ./apps/api-gateway
COPY packages/contracts ./packages/contracts
COPY packages/utils ./packages/utils

RUN pnpm --filter @repo/utils build
RUN pnpm --filter @repo/contracts build
RUN pnpm --filter @repo/api-gateway build

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/utils/package.json ./packages/utils/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /repo/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /repo/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /repo/packages/utils/dist ./packages/utils/dist

WORKDIR /repo/apps/api-gateway

USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
