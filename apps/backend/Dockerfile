FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm turbo

COPY . .
RUN turbo prune --scope=@campusos/backend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:20-alpine AS installer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
FROM node:20-alpine AS sourcer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/backend/node_modules ./apps/backend/node_modules
RUN pnpm turbo run build --filter=@campusos/backend...

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=sourcer /app/apps/backend/package.json .
COPY --from=sourcer /app/apps/backend/dist ./dist
COPY --from=sourcer /app/node_modules ./node_modules
COPY --from=sourcer /app/apps/backend/node_modules ./apps/backend/node_modules

EXPOSE 3000
CMD ["node", "dist/main"]
