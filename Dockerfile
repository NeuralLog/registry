FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies for development
RUN npm install

# Copy source code and TypeScript config
COPY tsconfig.json ./
COPY src/ ./src/

# Expose port
EXPOSE 3031

# Set environment variables
ENV NODE_ENV=development

# Start the application in development mode with watch
CMD ["npm", "run", "dev:watch"]
