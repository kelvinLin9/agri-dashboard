# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code (包含 .env.production 作為預設值)
COPY . .

# Build arguments for environment variables
# 只有當明確傳入 --build-arg 時才會覆蓋 .env.production
ARG VITE_API_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""

# Set environment variables for build
# 只有在 ARG 有值時才設定 ENV（避免覆蓋 .env.production）
RUN if [ -n "$VITE_API_URL" ]; then \
      echo "VITE_API_URL=$VITE_API_URL" >> .env.production; \
    fi && \
    if [ -n "$VITE_GOOGLE_CLIENT_ID" ]; then \
      echo "VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID" >> .env.production; \
    fi && \
    cat .env.production && \
    npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
