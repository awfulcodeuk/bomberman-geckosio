FROM node:lts-gallium

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install --omit=dev

COPY . .

RUN ls -al /app

EXPOSE 1235 27900-28000/udp
CMD [ "node", "server/server.js" ]