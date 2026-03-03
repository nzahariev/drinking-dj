# Stage 1: Build the static Next.js app
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Clean default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy static export (Next.js → out/)
COPY --from=builder /app/out /usr/share/nginx/html

# Optional: SSL (build fails if fullchain.pem / privkey.pem are not in project root)
RUN mkdir -p /etc/nginx/ssl
COPY --from=builder /app/fullchain.pem /etc/nginx/ssl/
COPY --from=builder /app/privkey.pem /etc/nginx/ssl/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
CMD ["sh", "-c", "nginx -t && nginx -g 'daemon off;'"]