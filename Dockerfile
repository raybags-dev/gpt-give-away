# Use an official Node.js runtime as a parent image
FROM node:14
# Set the working directory to /app
WORKDIR /app
# Copy the package.json and package-lock.json files to the container
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code to the container
COPY . .
# Clear output.txt file
RUN rm -f output.txt && touch output.txt
# Expose port 3000 for the application to listen on
EXPOSE 4300
# Create a named volume to store persistent data
VOLUME [ "/app/data" ]
# Set an environment variable for the Docker version
ENV DOCKER_VERSION="01.01.2"
# # Print the Docker version
# RUN sh -c 'echo "Docker version: ${DOCKER_VERSION}" && docker version'
# Set an argument for the Docker version
ARG DOCKER_VERSION
# Print the Docker version
RUN echo "Docker version: ${DOCKER_VERSION}"
# Run the command to start the application
CMD [ "npm", "start" ]
