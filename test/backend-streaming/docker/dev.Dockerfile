FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN yarn install --frozen-lockfile

EXPOSE 5000