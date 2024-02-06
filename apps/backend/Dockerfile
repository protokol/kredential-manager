# Install dependencies
FROM --platform=linux/amd64 node:20-alpine AS deps
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml  ./
RUN pnpm install

# Rebuild the source code only when needed
FROM --platform=linux/amd64 node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Production image, copy all the files and run nest
FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app
ENV DB_HOST="host.docker.internal"
ENV DB_USERNAME="enterprise-wallet-user"
ENV DB_PORT="5432"
ENV DB_PASSWORD="password"
ENV DB_NAME="enterprise-wallet"

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
