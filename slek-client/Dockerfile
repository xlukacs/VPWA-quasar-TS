# Stage 1: Build the application
FROM node:18-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npx quasar build -m pwa

# Stage 2: Serve the application using nginx
FROM nginx:alpine as production-stage

# Copy built files from build stage to nginx serve directory
COPY --from=build-stage /app/dist/pwa /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
