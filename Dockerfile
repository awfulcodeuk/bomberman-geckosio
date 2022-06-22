FROM node:lts-gallium

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install --omit=dev

COPY . .

RUN npm run build

RUN ls -al /app

EXPOSE 3000 27900-27920/udp
CMD [ "node", "server/server.js" ]