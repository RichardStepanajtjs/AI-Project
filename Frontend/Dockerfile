# build stage: compile the Angular app
FROM node:24-bullseye AS build

WORKDIR /Frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# serve the built files with nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /Frontend/dist/Frontend/browser /usr/share/nginx/html

EXPOSE 4200
