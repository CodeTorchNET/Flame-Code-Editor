# Use an official PHP runtime as a parent image
FROM php:8.3-apache

# Copy the Apache virtual host configuration file
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Copy the custom start script
# COPY start-apache /usr/local/bin/

# Enable Apache modules
RUN a2enmod rewrite

# Set the working directory
WORKDIR /var/www/html

# Copy application source from /src to /var/www/html
COPY src/ .

# Set file ownership
RUN chown -R www-data:www-data /var/www/html

# Start Apache
CMD ["start-apache"]