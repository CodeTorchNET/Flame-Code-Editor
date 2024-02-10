# Use an official PHP runtime as a parent image
FROM php:8.3-apache

# Copy the Apache virtual host configuration file
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Enable Apache modules
RUN a2enmod rewrite

# Set the working directory
WORKDIR /var/www/html

# Copy application source from /src to /var/www/html
COPY src/ /var/www/html

# Set file ownership
RUN chown -R www-data:www-data /var/www/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Apache (this is the default CMD of the php:8.3-apache image)
CMD ["apache2-foreground"]
