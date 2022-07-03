FROM node:lts-gallium

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

# use node user instead of root
WORKDIR /app

# copy both 'package.json'
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY webpack.config.cjs ./

# mount pnpm cache to save having to redownload all the time 
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
 --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
 pnpm install --frozen-lockfile\
 --unsafe-perm\
 # ↑ Docker runs pnpm as root and then pnpm won't run package scripts unless we pass this arg
 | grep -v "cross-device link not permitted\|Falling back to copying packages from store"

# install project dependencies
RUN pnpm install

COPY . .

RUN npm run build

# set environment to be production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN ls -al /app

EXPOSE 3001 9208 27900-27920/udp
CMD [ "node", "server/server.js" ]