#!/bin/sh

set -e

# Generate app key if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate
fi

# Run migrations without seeding
php artisan migrate --force

# Clear cache
php artisan cache:clear
php artisan route:clear
php artisan config:clear
php artisan view:clear

# Publish CORS configuration
php artisan config:publish cors

# Start the PHP-FPM server
exec "$@"
