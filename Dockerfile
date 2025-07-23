FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create data directory for SQLite database
RUN mkdir -p data

# Set port environment variable
ENV PORT=8080

# Start the application
CMD ["npm", "start"]