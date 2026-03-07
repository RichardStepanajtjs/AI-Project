FROM node:24-bullseye

WORKDIR /backend

COPY package*.json ./

RUN npm install

COPY . .

# Productie
#RUN npm run build

EXPOSE 3000

# Development & testing.
CMD ["npm", "start"]

# Gecompileerde code in dist map (productie).
#CMD ["node", "dist/server.js"]