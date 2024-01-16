# Use the official Node.js image as a parent image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install project dependencies, including nodemon
RUN npm install

# Copy the rest of your application code to the container
COPY . .

RUN npm install -g nodemon

# Expose the port that your application listens on (if applicable)
EXPOSE 5000

# Define the command to start your application
CMD ["npm","start"]
