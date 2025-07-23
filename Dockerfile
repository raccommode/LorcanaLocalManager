FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Port configured via ENV variable (no external exposure needed for Umbrel)

# Start the application
CMD ["npm", "start"]