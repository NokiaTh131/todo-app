FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat dumb-init

# Enable corepack for pnpm
RUN corepack enable

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm store prune

# Copy source code
COPY . .

# Build application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN pnpm install --frozen-lockfile --prod=true
RUN pnpm store prune

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main"]

