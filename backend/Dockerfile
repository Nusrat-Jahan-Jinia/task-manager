FROM php:8.4-fpm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    zip \
    unzip \
    git \
    nodejs \
    npm \
    mariadb-client \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    && docker-php-ext-install pdo pdo_mysql bcmath gd zip

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN apt-get update && apt-get install -y \
    libgd-dev \
    libpng-dev \
    libjpeg-dev \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install -j$(nproc) gd

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --optimize-autoloader --no-dev

COPY . .

RUN composer dump-autoload

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 9000

ENTRYPOINT ["docker-entrypoint"]
CMD ["php-fpm"]
