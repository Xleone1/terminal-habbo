FROM php:8.4-fpm-alpine

# 1. Install system dependencies for PostgreSQL and Intl using Alpine's package manager
RUN apk update && apk add --no-cache \
    libpq-dev \
    postgresql-dev \
    icu-dev

# 2. Configure and install the PHP extensions all in one efficient layer
RUN docker-php-ext-configure intl \
    && docker-php-ext-install intl pdo pdo_pgsql pgsql

# 3. Set the working directory
WORKDIR /var/www/html

# (Optional) If you ever want to run composer inside the container, 
# uncomment the lines below to bake composer right into it:
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer