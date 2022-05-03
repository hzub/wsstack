FROM node:10-alpine
WORKDIR /usr/app
COPY package*.json .
RUN ["yarn"]
COPY . .
RUN ["yarn", "build"]
ENTRYPOINT [ "node", "dist/index.js" ]
