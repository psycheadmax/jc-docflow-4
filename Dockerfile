FROM node:16.20.2-bullseye-slim

WORKDIR /jcdocflow

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3333 1234

CMD ["npm", "run", "dev"]