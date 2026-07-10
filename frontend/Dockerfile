# Stage 1: Build Stage
FROM node:20-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy package files first for caching layers
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the Vite static assets
RUN npm run build

# Stage 2: Production Stage
FROM nginx:alpine

# Copy custom nginx configuration to handle SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx web server port
EXPOSE 80

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
