# build stage
FROM node:14 as build-stage
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable as production-stage
RUN mkdir /app
COPY --from=build-stage /usr/src/app/dist /app
COPY nginx_prod.conf /etc/nginx/nginx.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]