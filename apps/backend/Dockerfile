# Base image
FROM --platform=linux/amd64 node:22-alpine AS base
WORKDIR /app

# Install dependencies
FROM --platform=linux/amd64 node:22-alpine AS deps
RUN npm install -g pnpm@9.4 
RUN pnpm --version
WORKDIR /app
COPY package.json pnpm-lock.yaml  ./
RUN pnpm install
# RUN ls -la ./node_modules/@probeta

# Rebuild the source code only when needed
FROM --platform=linux/amd64 node:22-alpine AS builder
RUN npm install -g pnpm@9.4
RUN pnpm --version
WORKDIR /app
RUN rm -rf node_modules/*
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npx ts-patch install -s && pnpm run build
# Production image, copy all the files and run nest
FROM --platform=linux/amd64 node:20-alpine AS runner

WORKDIR /app
ENV KM_DB_HOST=${KM_DB_HOST}
ENV KM_DB_USERNAME=${KM_DB_USERNAME}
ENV KM_DB_PORT=${KM_DB_PORT}
ENV KM_DB_PASSWORD=${KM_DB_PASSWORD}
ENV KM_DB_NAME=${KM_DB_NAME}
ENV KM_DB_SCHEMA=${KM_DB_SCHEMA}

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD npm run migration:run:prod && npm run start:prod
