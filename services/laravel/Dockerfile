FROM php:8.4-fpm-alpine

# 1. Install system dependencies
RUN apk update && apk add --no-cache \
    libpq-dev \
    postgresql-dev \
    mysql-client \
    mariadb-connector-c-dev \
    icu-dev \
    git \
    unzip

# 2. Configure and install the PHP extensions
RUN docker-php-ext-configure intl \
    && docker-php-ext-install intl pdo pdo_pgsql pgsql pdo_mysql mysqli

# 3. Set the working directory
WORKDIR /var/www/html

# 4. Bake composer right into the image natively
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
