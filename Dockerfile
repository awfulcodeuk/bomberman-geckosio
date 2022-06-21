FROM node:lts-gallium

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# make the 'app' folder the current working directory
WORKDIR /home/node/app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

USER node

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY --chown=node:node . .

RUN ls -al /app

EXPOSE 1235
CMD [ "node", "server/server.js" ]