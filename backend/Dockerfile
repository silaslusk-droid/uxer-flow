FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create volume for SQLite database
VOLUME /app/data

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]