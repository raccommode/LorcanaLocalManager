FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Set port environment variable
ENV PORT=1923

# Start the application
CMD ["npm", "start"]