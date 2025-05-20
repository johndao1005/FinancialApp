#!/bin/bash

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Print header
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}      Fix Email Unique Constraint        ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed.${NC}"
  echo -e "${YELLOW}Please install Node.js and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}Working directory: $(pwd)${NC}"

# Check if sqlite3 module is installed
if ! node -e "try{require('sqlite3');}catch(e){process.exit(1)}" &> /dev/null; then
  echo -e "${YELLOW}Installing sqlite3 module...${NC}"
  npm install sqlite3 --no-save
fi

# Run the fix script
echo -e "${CYAN}Running database fix script...${NC}"
node fix_unique_constraint.js

echo -e "${GREEN}Fix process completed.${NC}"
echo -e "${YELLOW}Try restarting your server now with:${NC}"
echo -e "cd server && npm start"
