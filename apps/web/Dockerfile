FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm turbo

COPY . .
RUN turbo prune --scope=@campusos/web --docker

FROM node:20-alpine AS installer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS sourcer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/web/node_modules ./apps/web/node_modules
RUN pnpm turbo run build --filter=@campusos/web...

# Runner - Nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=sourcer /app/apps/web/dist .

# Add Nginx config for React Router
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
