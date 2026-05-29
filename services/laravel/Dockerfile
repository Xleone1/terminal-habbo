FROM php:8.4-fpm-alpine

# 1. Install system dependencies for PostgreSQL
RUN apk update && apk add --no-cache \
    libpq-dev \
    postgresql-dev

# 2. Install PHP PostgreSQL extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql

# 3. Set the working directory
WORKDIR /var/www/html

# (Optional) If you ever want to run composer inside the container, 
# uncomment the lines below to bake composer right into it:
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer