#!/bin/bash
hugo
sudo cp -r ./public/* /var/www/html/
echo "----------------------------------------------------"
echo "Site updated! Go to swaelchli.com to view the updates."
echo "----------------------------------------------------"
