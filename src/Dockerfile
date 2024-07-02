FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm ci
RUN yarn build

EXPOSE 5173
