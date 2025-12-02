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
# 注意：ARG 如果沒有透過 --build-arg 傳入，會是 undefined
# 如果透過 --set-build-env-vars 傳入空值，會是空字串
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Set environment variables for build
# 使用 ENV 指令設定環境變數（Vite 會在 build 時讀取）
# 注意：如果 ARG 是空字串，ENV 也會是空字串，這會覆蓋 .env.production
# 因此部署腳本必須確保不會傳入空值
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# Build the application
RUN npm run build

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
