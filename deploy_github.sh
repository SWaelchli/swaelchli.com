#!/bin/bash

# 1. Pull latest source code from GitHub
echo "Pulling latest changes from GitHub..."
git pull origin master

# 2. Build the Hugo static site
echo "Generating site with Hugo..."
hugo

# 3. Copy the public folder to Nginx root
echo "Syncing files to Nginx web root..."
sudo cp -r ./public/* /var/www/html/

echo "----------------------------------------------------"
echo "Site updated! Go to swaelchli.com to view the updates."
echo "----------------------------------------------------"