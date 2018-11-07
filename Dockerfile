FROM node:10

WORKDIR /app

COPY . /app
COPY package.json /app
CMD npm run serve

EXPOSE 2345