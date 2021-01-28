ARG build_number_arg=local-docker-build

FROM node:14.15.4-alpine3.10
COPY ["package.json", "package-lock.json*", "tsconfig.json", "tslint.json", "./"]
COPY ["src", "./src"]
RUN npm install
RUN npm run build

FROM node:14.15.4-alpine3.10
ENV NODE_ENV=production
ENV BUILD_NUMBER=$build_number_arg
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY --from=0 dist/ .
CMD [ "node", "index.js" ]
