#!/bin/bash

# Script to create a test user for development

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}       CREATING TEST USER ACCOUNT        ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo

# Change to the server directory
cd "$(dirname "$0")/server" || exit 1
echo -e "${GREEN}Working directory: $(pwd)${NC}"
echo

# Run the seed user script
echo -e "${YELLOW}Creating test user...${NC}"
node src/utils/seed_user.js

echo
echo -e "${GREEN}Process completed.${NC}"
echo -e "${YELLOW}If successful, you can now log in with:${NC}"
echo -e "  ${GREEN}Email: test@example.com${NC}"
echo -e "  ${GREEN}Password: password123${NC}"
