FROM node:lts AS build-stage-backend

WORKDIR /app/backend

COPY ./slek-server /app/backend/

RUN npm install

ENV HOST=0.0.0.0
ENV PORT=3333
ENV NODE_ENV=production
ENV APP_KEY=nlnpGYSTleLKKrMtkZSPJfI8tHJWMIa9
ENV DRIVE_DISK=local
ENV DB_CONNECTION=pg
ENV DB_HOST=slek-postgres
ENV DB_PORT=5432
ENV DB_USER=slek
ENV DB_PASSWORD=slekpass
ENV DB_NAME=slek

EXPOSE ${PORT}
#--------------------------------

FROM node:18-alpine AS build-stage-client
WORKDIR /app/client

COPY ./slek-client/package*.json /app/client/

RUN npm install

COPY ./slek-client /app/client/

RUN npx quasar build -m pwa

#--------------------------------
FROM nginx:alpine as production-stage

COPY --from=build-stage-client /app/client/dist/pwa /usr/share/nginx/html

COPY --from=build-stage-backend /app/backend/ /app/backend/

EXPOSE 80

WORKDIR /app/backend

# Use shell form to run both commands
CMD nginx -g "daemon on;" && node ace serve --watch