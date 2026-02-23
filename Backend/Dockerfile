FROM node:24-bullseye

WORKDIR /backend

COPY package*.json ./

RUN npm install

COPY . .

# Dit is voor productie.
RUN npm run build

# Dit is voor development & testing.
# RUN npm start

EXPOSE 3000

# Je vindt de gecompileerde code in de dist map.
CMD ["node", "dist/main.js"]