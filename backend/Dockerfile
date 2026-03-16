# Image PHP + Apache pour Symfony
FROM php:8.2-apache

# Dossier de travail de l'application
WORKDIR /var/www/html

# Paquets systeme + extensions PHP requises
RUN apt-get update \
    && apt-get install -y \
        libpq-dev \
        unzip \
    && docker-php-ext-install pdo pdo_pgsql \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Copie du code
COPY . /var/www/html

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Apache doit servir le dossier public/
RUN sed -i 's#/var/www/html#/var/www/html/public#g' /etc/apache2/sites-available/000-default.conf

# Permissions pour cache/log en production
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var \
    && chmod -R ug+rwX var

# Port HTTP expose
EXPOSE 80
# Demarrage Apache
CMD ["apache2-foreground"]
