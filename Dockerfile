FROM --platform=linux/amd64 node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]