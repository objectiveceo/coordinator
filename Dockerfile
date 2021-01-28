FROM node:14.15.4-alpine3.10
COPY ["package.json", "package-lock.json*", "tsconfig.json", "tslint.json", "./"]
COPY ["src", "./src"]
RUN npm install
RUN npm run build
RUN npm test

FROM node:14.15.4-alpine3.10
ARG BUILD_NUMBER
ARG DATABASE_PATH
ENV NODE_ENV=production
ENV BUILD_NUMBER=${BUILD_NUMBER:-?}
ENV DATABASE_PATH=${DATABASE_PATH}
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY --from=0 dist/ .
CMD [ "node", "index.js" ]
