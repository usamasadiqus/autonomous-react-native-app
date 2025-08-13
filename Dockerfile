# Multi-stage Dockerfile for React Native development
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Expose ports
EXPOSE 8081 3001

# Default command
CMD ["npm", "start"]
