# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Create the minimal production runner image
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

# Install production-only dependencies
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main"]
