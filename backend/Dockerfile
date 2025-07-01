# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose port (example: 5000)
EXPOSE 5000

# Start the backend
CMD ["npm", "start"]
