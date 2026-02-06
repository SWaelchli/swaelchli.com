#!/bin/bash

# 1. Build the Hugo static site
echo "Generating site with Hugo..."
hugo --cleanDestinationDir

# 2. Copy the public folder to Nginx root
echo "Syncing files to /var/www/html..."
# -a: archive mode, -v: verbose, --delete: remove old files not in 'public'
rsync -av --delete ./public/ /var/www/html/

echo "----------------------------------------------------"
echo "Site updated! Go to swaelchli.com to view the updates."
echo "----------------------------------------------------"
