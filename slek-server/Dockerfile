FROM node:lts AS builder

WORKDIR /app/backend

COPY . /app/backend/

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

CMD ["node", "ace", "serve", "--watch"]