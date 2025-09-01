# Usar la imagen oficial de PHP 8.2 con Apache
FROM php:8.2-apache

# Instalar dependencias y extensiones PHP
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libsqlite3-dev \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    unzip \
    && docker-php-ext-configure gd \
    && docker-php-ext-install pdo_sqlite zip gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configuración esencial de Apache para PHP
RUN a2enmod rewrite && \
    a2dismod -f autoindex && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf && \
    echo "<Directory /var/www/html>" >> /etc/apache2/apache2.conf && \
    echo "  Options FollowSymLinks" >> /etc/apache2/apache2.conf && \
    echo "  AllowOverride All" >> /etc/apache2/apache2.conf && \
    echo "  Require all granted" >> /etc/apache2/apache2.conf && \
    echo "</Directory>" >> /etc/apache2/apache2.conf

# Configuración especial para Render y mayúsculas/minúsculas
RUN echo "AddType application/x-httpd-php .php .PHP" >> /etc/apache2/apache2.conf && \
    echo "<FilesMatch \"\.(php|PHP)$\">" > /etc/apache2/conf-available/php-handler.conf && \
    echo "  SetHandler application/x-httpd-php" >> /etc/apache2/conf-available/php-handler.conf && \
    echo "</FilesMatch>" >> /etc/apache2/conf-available/php-handler.conf && \
    a2enconf php-handler

# Configuración específica para la carpeta php
RUN echo "<Directory /var/www/html/php>" >> /etc/apache2/apache2.conf && \
    echo "  Options +ExecCGI" >> /etc/apache2/apache2.conf && \
    echo "  AllowOverride All" >> /etc/apache2/apache2.conf && \
    echo "</Directory>" >> /etc/apache2/apache2.conf

# Crear y configurar permisos para el directorio de imágenes
RUN mkdir -p /var/www/html/image/usuarios && \
    chown -R www-data:www-data /var/www/html/image && \
    chmod -R 775 /var/www/html/image

# Establecer DocumentRoot
ENV APACHE_DOCUMENT_ROOT=/var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar archivos de la aplicación
COPY . /var/www/html/

# Configurar permisos (optimizados para Render)
RUN chown -R www-data:www-data /var/www/html && \
    find /var/www/html -type d -exec chmod 755 {} \; && \
    find /var/www/html -type f -exec chmod 644 {} \; && \
    chmod -R 775 /var/www/html/archivos && \
    chmod -R 775 /var/www/html/image && \
    chmod +x /var/www/html/php/sesion/sesion-alumn.*

# Verificación de sintaxis de Apache
RUN apache2ctl configtest

# Health check para Render
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/phpinfo.php || exit 1

EXPOSE 80
CMD ["apache2-foreground"]