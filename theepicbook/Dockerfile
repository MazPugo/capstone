# ============================
# 1) Builder Stage
# ============================
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build step (if frontend assets need bundling; otherwise safe to leave)
# For EpicBook this may be a no-op, but good for future-proofing
RUN npm run build || echo "No build step defined"

# ============================
# 2) Runtime Stage
# ============================
FROM node:20-alpine AS runner

WORKDIR /app

# Copy prod node_modules only
COPY --from=builder /app/node_modules ./node_modules

# Copy application source (or built output)
COPY --from=builder /app ./

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run backend
CMD ["node", "server.js"]

CMD ["node", "server.js"]
