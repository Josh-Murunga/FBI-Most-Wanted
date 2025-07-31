# Use Node.js 20 on Debian bullseye
FROM node:20-bullseye

# Set working directory (matches compose working_dir)
WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port (matches Express server port)
EXPOSE 5000

# Start command (overridden in compose for live reload)
CMD ["npm", "start"]