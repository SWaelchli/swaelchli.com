#!/bin/bash

# 1. Build the Hugo static site
echo "Generating site with Hugo..."
hugo

# 2. Copy the public folder to Nginx root
echo "Syncing files to Nginx web root..."
sudo cp -r ./public/* /var/www/html/

echo "----------------------------------------------------"
echo "Site updated! Go to swaelchli.com to view the updates."
echo "----------------------------------------------------"
