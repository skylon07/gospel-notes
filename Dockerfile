FROM node:15-alpine

# Create app directory and make it the current directory.
WORKDIR /usr/src/gospel-notes

# Copy just the package*.json and install dependencies.
# We do this separately from the code so docker doesn't rebuild the dependencies every time the code changes.
COPY package*.json ./
RUN npm install

# Copy the source
# We are going to mount the source as a volume instead
#COPY . .

# Expose the port
EXPOSE 3000

# Start it up
CMD [ "npm", "start" ]
