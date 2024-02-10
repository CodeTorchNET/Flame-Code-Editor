# Use an official PHP runtime as a parent image
FROM php:8.3-apache

# Set the working directory in the container
WORKDIR /var/www/html

# Copy the current directory contents into the container at /var/www/html
COPY . /var/www/html

# Enable Apache modules
RUN a2enmod rewrite

# Expose port 80 to the outside world
EXPOSE 8080

# Start Apache when the container launches
CMD ["apache2-foreground"]
