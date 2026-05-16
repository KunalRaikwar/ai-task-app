# Stage 1: Build & Install dependencies
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Stage 2: Production runtime image
FROM node:20-alpine

WORKDIR /usr/src/app

# Use unprivileged non-root user 'node'
USER node

COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app .

EXPOSE 5005

ENV NODE_ENV=production

CMD ["npm", "start"]
