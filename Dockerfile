# Use Node.js 20.18.0 as the base image
FROM node:20.18.0

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    libglu1-mesa \
    openjdk-11-jdk \
    && rm -rf /var/lib/apt/lists/*

# Install React Native CLI globally
RUN npm install -g react-native-cli

# Copy package files
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose port for Metro bundler
EXPOSE 8081

# Start Metro bundler
CMD ["npm", "start"]
