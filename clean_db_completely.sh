#!/bin/bash

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Print header
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}      Complete Database Cleanup         ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed.${NC}"
  echo -e "${YELLOW}Please install Node.js and try again.${NC}"
  exit 1
fi

# Check for required modules
echo -e "${YELLOW}Checking for required Node modules...${NC}"
if ! node -e "try{require('sqlite3');}catch(e){process.exit(1)}" &> /dev/null; then
  echo -e "${YELLOW}Installing sqlite3 module...${NC}"
  npm install sqlite3 --no-save
fi

# Run the cleanup script
echo -e "${CYAN}Running comprehensive database cleanup...${NC}"
node clean_db_completely.js

# Final message
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Database cleanup completed successfully!${NC}"
  echo -e "${YELLOW}Try restarting your server now with:${NC}"
  echo -e "cd server && npm start"
else
  echo -e "${RED}Database cleanup encountered errors.${NC}"
  echo -e "${YELLOW}Check the output above for details.${NC}"
fi
