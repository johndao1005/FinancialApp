#!/bin/bash

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Print header
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}    Fix Database Constraint Error       ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo

# Change to the server directory
cd "$(dirname "$0")/server" || {
  echo -e "${RED}Error: Cannot find server directory.${NC}"
  exit 1
}

echo -e "${GREEN}Working directory: $(pwd)${NC}"
echo

# Check if sqlite3 is installed
if ! npm list sqlite3 | grep -q sqlite3; then
  echo -e "${YELLOW}Installing sqlite3 module...${NC}"
  npm install sqlite3 --save
fi

# Run the fix script
echo -e "${CYAN}Running database fix script...${NC}"
node src/utils/fix_email_constraint.js

echo
echo -e "${GREEN}Repair process completed.${NC}"
echo -e "${YELLOW}Try restarting your server now with:${NC}"
echo -e "cd \"$(pwd)\" && npm start"
