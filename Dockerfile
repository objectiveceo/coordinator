FROM node:14.15.4-alpine3.10

ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production

COPY src/ .
CMD [ "node", "index.js" ]
