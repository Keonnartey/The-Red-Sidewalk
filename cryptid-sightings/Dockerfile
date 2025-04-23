# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (layer caching)
COPY package*.json ./

# Install while ignoring peer dep conflicts (dev-friendly)
RUN npm install --legacy-peer-deps

# Copy the rest of your code
COPY . .

# Expose port for Next.js dev server
EXPOSE 3000

# Build Next.js app
RUN npm run build

# Run the Next.js dev server
CMD ["npm", "run", "start"]
