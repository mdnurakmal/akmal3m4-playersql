FROM debian
RUN apt-get update && \
    apt-get install -y default-mysql-client

FROM node:16
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .


EXPOSE 8080

CMD [ "node", "app.js" ]