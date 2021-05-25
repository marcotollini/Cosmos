FROM node:14
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

RUN npm run compile

EXPOSE 3000

CMD [ "node", "build/src/index.js" ]