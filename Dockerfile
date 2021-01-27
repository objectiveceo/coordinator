FROM node:14.15.4-alpine3.10

ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
RUN npm run build

COPY dist/ .
CMD [ "node", "index.js" ]
