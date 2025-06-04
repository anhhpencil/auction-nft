FROM node:20-alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

# Create app directory
WORKDIR /usr/src/node-app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Default command
CMD ["npm", "start"]
