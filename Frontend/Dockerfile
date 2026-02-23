FROM node:24-bullseye

WORKDIR /Frontend

COPY package*.json ./

RUN npm install

COPY . .

# Dit installeert Angular.
RUN npm install -g @angular/cli

EXPOSE 4200

# Dit "--host 0.0.0.0" zorgt ervoor dat de applicatie bereikbaar is buiten de container...
CMD ["ng", "serve", "--host", "0.0.0.0"] 