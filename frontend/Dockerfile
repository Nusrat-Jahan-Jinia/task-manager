FROM node:18-slim AS build

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies with production flag
RUN npm ci --production=false

# Copy source code
COPY . .

# Build for production
RUN npm run build -- --mode production

# Production image
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration for frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add security headers
RUN echo "add_header X-Content-Type-Options nosniff;" >> /etc/nginx/conf.d/security-headers.conf \
    && echo "add_header X-Frame-Options SAMEORIGIN;" >> /etc/nginx/conf.d/security-headers.conf \
    && echo "add_header X-XSS-Protection \"1; mode=block\";" >> /etc/nginx/conf.d/security-headers.conf \
    && echo "include /etc/nginx/conf.d/security-headers.conf;" >> /etc/nginx/conf.d/default.conf

# Create required directories and set proper permissions
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx /tmp/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html /tmp/nginx \
    && chmod -R 755 /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html /tmp/nginx \
    && sed -i 's/\/var\/run\/nginx.pid/\/tmp\/nginx\/nginx.pid/g' /etc/nginx/nginx.conf

EXPOSE 3000

# Use non-root user for better security
USER nginx

CMD ["nginx", "-g", "daemon off;"]
