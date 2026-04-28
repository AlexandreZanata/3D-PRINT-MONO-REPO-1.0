# ─── api-gateway — multi-stage production image ───────────────────────────────
# Stage 1: install all workspace dependencies and build
FROM node:22-alpine AS builder

# Enable corepack so pnpm is available without a separate install step
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /repo

# Copy workspace manifests first for better layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/utils/package.json ./packages/utils/

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api-gateway ./apps/api-gateway
COPY packages/contracts ./packages/contracts
COPY packages/utils ./packages/utils

# Build in dependency order
RUN pnpm --filter @repo/utils build
RUN pnpm --filter @repo/contracts build
RUN pnpm --filter @repo/api-gateway build

# ─── Stage 2: lean runtime image ─────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /repo

# Copy workspace manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/utils/package.json ./packages/utils/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder
COPY --from=builder /repo/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /repo/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /repo/packages/utils/dist ./packages/utils/dist

WORKDIR /repo/apps/api-gateway

# Run as non-root user for security
USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
