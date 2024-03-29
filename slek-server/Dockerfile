# ----- BUILD STAGE -----
# Include the latest node image
FROM node:lts as build-stage
# Aliases setup for container folders
ARG SERVER="/slek-server"
ARG SERVER_src="."
ARG BUILD="/slek-server/build"
# Set the working directory inside the container to server module
WORKDIR ${SERVER}
# Copy server module
COPY ${SERVER_src} ${SERVER}
# Build dependencies and TS files
RUN npm i
RUN node ace build --production
# --production
# --ignore-ts-errors

# ----- PRODUCTION STAGE -----
FROM node:lts as production-stage
# Aliases setup
ARG BUILD="/slek-server/build"
ARG SERVER="/myserver"
# Define environment variables for server (see .env)
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
# Set workdir
WORKDIR ${SERVER}
# Copy build artifacts from previous stage
COPY --from=build-stage ${BUILD} ./
# Install production dependencies
RUN npm ci --production
# Expose port outside container
EXPOSE ${PORT}
# Start server module inside the container
CMD ["node", "server.js"]
