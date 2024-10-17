# Use the official Node.js image as the base image
FROM node:18 as migrations

# Install pnpm
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN pnpm install

# Expose the port that the app will run on
EXPOSE 3000

# Set working dir for operations within the container
WORKDIR /app/packages/backend

# Define the command to run your app using npm start
CMD ["pnpm", "run", "start:prod"]