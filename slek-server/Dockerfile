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
ENV PG_PORT=5432
ENV PG_USER=vpwa_user
ENV PG_PASSWORD=vpwa_pass
ENV PG_DB_NAME=vpwa
ENV PG_HOST=172.17.0.1

EXPOSE ${PORT}

# Create a startup script
RUN echo '#!/bin/sh\n\
echo "Running migrations..."\n\
node ace migration:run --force\n\
echo "Running seeds..."\n\
node ace db:seed\n\
echo "Starting server..."\n\
npm run dev --watch' > /app/backend/start.sh && \
chmod +x /app/backend/start.sh

# Run the startup script
CMD ["/app/backend/start.sh"]