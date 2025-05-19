#!/bin/bash

# Database Cleaning Script for FinancialApp
# This script provides a user-friendly way to clean the database

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Print header
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}    FinancialApp Database Cleaner       ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo

# Function to check if server directory exists
check_environment() {
  if [ ! -d "$(dirname "$0")/../../../server" ]; then
    echo -e "${RED}Error: Cannot find server directory. Make sure you're running this script from the correct location.${NC}"
    exit 1
  fi
}

# Change to the server directory
cd_to_server() {
  cd "$(dirname "$0")/../../../server" || exit 1
  echo -e "${GREEN}Working directory: $(pwd)${NC}"
  echo
}

# Show menu and get user choice
show_menu() {
  echo -e "${CYAN}Choose an option:${NC}"
  echo "1) Clean specific tables"
  echo "2) Reset entire database (recreate schema)"
  echo "3) Clean all user data (preserve system records)"
  echo "4) Exit"
  echo
  read -p "Enter your choice (1-4): " choice
  echo
  
  case $choice in
    1)
      clean_specific_tables
      ;;
    2)
      reset_entire_database
      ;;
    3)
      clean_user_data
      ;;
    4)
      echo -e "${GREEN}Exiting.${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please enter a number between 1 and 4.${NC}"
      echo
      show_menu
      ;;
  esac
}

# Clean specific tables
clean_specific_tables() {
  echo -e "${YELLOW}Available tables:${NC}"
  echo "- transactions"
  echo "- budgets"
  echo "- goals"
  echo "- categories"
  echo "- users"
  echo "- goalContributions"
  echo
  read -p "Enter table names (comma-separated): " tables
  echo
  
  if [ -z "$tables" ]; then
    echo -e "${RED}No tables specified. Returning to menu.${NC}"
    echo
    show_menu
    return
  fi
  
  echo -e "${YELLOW}About to clean tables: $tables${NC}"
  read -p "Are you sure? (yes/no): " confirm
  echo
  
  if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Operation canceled. Returning to menu.${NC}"
    echo
    show_menu
    return
  fi
  
  echo -e "${CYAN}Cleaning tables...${NC}"
  node src/utils/clean_database.js --tables="$tables"
  echo
  
  read -p "Press Enter to return to the menu..."
  echo
  show_menu
}

# Reset entire database
reset_entire_database() {
  echo -e "${RED}WARNING: This will delete ALL data and recreate the schema.${NC}"
  read -p "Are you absolutely sure? Type 'RESET' to confirm: " confirm
  echo
  
  if [ "$confirm" != "RESET" ]; then
    echo -e "${YELLOW}Operation canceled. Returning to menu.${NC}"
    echo
    show_menu
    return
  fi
  
  echo -e "${CYAN}Resetting database...${NC}"
  node src/utils/clean_database.js --all
  echo
  
  read -p "Press Enter to return to the menu..."
  echo
  show_menu
}

# Clean user data
clean_user_data() {
  echo -e "${YELLOW}This will clean all user data while preserving system records.${NC}"
  read -p "Are you sure? (yes/no): " confirm
  echo
  
  if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Operation canceled. Returning to menu.${NC}"
    echo
    show_menu
    return
  fi
  
  echo -e "${CYAN}Cleaning user data...${NC}"
  node src/utils/clean_database.js --user-data
  echo
  
  read -p "Press Enter to return to the menu..."
  echo
  show_menu
}

# Main function
main() {
  check_environment
  cd_to_server
  show_menu
}

# Run the script
main
