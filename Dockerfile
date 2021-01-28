FROM node:14.15.4-alpine3.10
COPY ["package.json", "package-lock.json*", "tsconfig.json", "tslint.json", "./"]
COPY ["src", "./src"]
RUN npm install
RUN npm run build
RUN npm test

FROM node:14.15.4-alpine3.10
ARG BUILD_NUMBER
ENV NODE_ENV=test
ENV BUILD_NUMBER=${BUILD_NUMBER:-?}
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY --from=0 dist/ .
CMD [ "node", "index.js" ]
