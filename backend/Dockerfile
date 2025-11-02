FROM php:8.2-fpm

WORKDIR /var/www/html

# les dépendances pour PostgreSQL + autres outils
RUN apt-get update \
    && apt-get install -y \
        libpq-dev \
        unzip \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY . /var/www/html

# Installer Composer ou autres
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

EXPOSE 80
CMD ["php-fpm"]
