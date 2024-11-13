# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies, including devDependencies for TypeScript and ts-node
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Compile TypeScript files if needed for production (optional step)
# RUN npm run build

# Expose the port your app runs on (update if different)
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]
