#!/bin/bash

# Foreign Key Fix Script for FinancialApp
# This script addresses foreign key constraint issues in the SQLite database

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Print header
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}    Fix Database Foreign Key Constraints  ${NC}"
echo -e "${CYAN}==========================================${NC}"
echo

# Change to the server directory
cd "$(dirname "$0")/server" || {
  echo -e "${RED}Error: Cannot find server directory.${NC}"
  exit 1
}

echo -e "${GREEN}Working directory: $(pwd)${NC}"
echo

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  echo
fi

# Run the foreign key fix script
echo -e "${CYAN}Running database fix script...${NC}"
node src/utils/fix_foreign_keys.js

echo
echo -e "${GREEN}Fix process completed.${NC}"
echo -e "${YELLOW}Try restarting your server now with:${NC}"
echo -e "cd \"$(pwd)\" && npm start"
