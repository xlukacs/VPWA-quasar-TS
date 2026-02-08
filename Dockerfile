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
ENV PG_PORT=5432
ENV PG_USER=vpwa_user
ENV PG_PASSWORD=vpwa_pass
ENV PG_DB_NAME=vpwa
ENV PG_HOST=172.17.0.1

# EXPOSE ${PORT}
#--------------------------------

FROM node:18-alpine AS build-stage-client
WORKDIR /app/client

ARG DEMO_LOCKED=true
ENV DEMO_LOCKED=${DEMO_LOCKED}

COPY ./slek-client/package*.json /app/client/

RUN npm install

COPY ./slek-client /app/client/

RUN npx quasar build -m pwa

#--------------------------------
FROM nginx:alpine as production-stage

# Install Node.js in the production stage
RUN apk add --update nodejs npm

COPY --from=build-stage-client /app/client/dist/pwa /usr/share/nginx/html

COPY --from=build-stage-backend /app/backend/ /app/backend/

# Copy nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

WORKDIR /app/backend

RUN npm install

ENV HOST=0.0.0.0
ENV PORT=3333
ENV NODE_ENV=production
ENV APP_KEY=nlnpGYSTleLKKrMtkZSPJfI8tHJWMIa9
ENV APP_NAME=slek-server
ENV DRIVE_DISK=local
ENV DB_CONNECTION=pg
ENV PG_PORT=5432
ENV PG_USER=vpwa_user
ENV PG_PASSWORD=vpwa_pass
ENV PG_DB_NAME=vpwa
ENV PG_HOST=172.17.0.1

# # Create a startup script directly in the final stage
# RUN echo '#!/bin/sh\n\
# echo "Starting frontend..."\n\
# nginx -g "daemon on;"\n\
# echo "Running migrations..."\n\
# node ace migration:run --force\n\
# echo "Running seeds..."\n\
# node ace db:seed\n\
# echo "Starting server..."\n\
# npm run dev --watch' > /app/backend/start.sh && \
# chmod +x /app/backend/start.sh

# # Run the startup script
# CMD ["/app/backend/start.sh"]

# Use shell form to run both commands
CMD node ace migration:run --force && node ace db:seed && nginx -g "daemon on;" && node ace serve --watch