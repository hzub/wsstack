FROM node:10-alpine
RUN ["npm", "install", "pm2", "-g"]
WORKDIR /usr/app
COPY package*.json .
RUN ["yarn"]
COPY . .
RUN ["yarn", "build"]
ENTRYPOINT [ "pm2-runtime", "dist/index.js" ]
