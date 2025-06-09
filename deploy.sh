#!/bin/bash

# Function to show loading animation
show_loading() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while ps -p $pid > /dev/null; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Starting deployment process..."

# Step 1: Clean the target directory
echo "🗑️  Cleaning /var/www/frontend..."
rm -rf /var/www/frontend/* &
show_loading $!
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Clean completed${NC}"
else
    echo -e "${RED}✗ Clean failed${NC}"
    exit 1
fi

# Step 2: Build the project
echo "🔨 Building project..."
npm run build &
show_loading $!
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Step 3: Copy dist contents
echo "📦 Copying files to /var/www/frontend..."
cp -r ./dist/* /var/www/frontend/ &
show_loading $!
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Copy completed${NC}"
else
    echo -e "${RED}✗ Copy failed${NC}"
    exit 1
fi

# Step 4: Reload Nginx
echo "🔄 Reloading Nginx..."
sudo nginx -s reload &
show_loading $!
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}✗ Nginx reload failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}✨ Deployment completed successfully!${NC}" 