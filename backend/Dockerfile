# Use official Node.js lightweight Alpine image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first for caching layers
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Define container entry point
CMD ["node", "server.js"]
