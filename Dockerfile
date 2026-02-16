# 1. Use an official Node.js runtime as the base image
FROM node:20

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json first
# This allows Docker to cache your dependencies if they haven't changed
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your application code
COPY . .

# 6. Open the port your Express app runs on
EXPOSE 3000

# 7. The command to run your app
CMD [ "npm", "start" ]