# syntax=docker/dockerfile:1

# extend the official Node.js Alpine image
FROM node:22.3.0-alpine

# update the package manager and install dumb-init so Node.js doesn't run as PID1
# https://www.notion.so/jesusgraterol/Containerizing-a-Node-js-App-d0be15fead43450992c4b4847c521a45?pvs=4#9571f1d3418a414088a1ad4dfef0f225
RUN apk update && apk add dumb-init

# create the API's directory
WORKDIR /usr/src/app

# install the dependencies
COPY package*.json ./
RUN npm ci

# copy the source code
COPY . .

# build the API
RUN npm run build

# expose the port
EXPOSE 5075

# finally, start the server
CMD ["dumb-init", "node", "dist/index.js"]