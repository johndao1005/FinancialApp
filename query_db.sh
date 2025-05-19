#!/bin/bash

# Database Query Script for FinancialApp
# This script provides a user-friendly way to query the database

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Change to the server directory
cd "$(dirname "$0")/server" || exit 1
echo -e "${GREEN}Working directory: $(pwd)${NC}"
echo

# Execute the query
echo -e "${CYAN}Running database query...${NC}"
echo

# Pass all arguments to the Node.js script
node src/utils/db_query.js "$@"

# Display help if no arguments provided
if [ $# -eq 0 ]; then
  echo -e "${YELLOW}Usage examples:${NC}"
  echo -e "  ${GREEN}./query_db.sh --model=User --action=find${NC}"
  echo -e "  ${GREEN}./query_db.sh --model=Transaction --action=count${NC}"
  echo -e "  ${GREEN}./query_db.sh --model=User --action=findOne --where='{\"email\":\"example@example.com\"}'${NC}"
  echo -e "  ${GREEN}./query_db.sh --model=Transaction --action=find --where='{\"isExpense\":true}' --limit=10${NC}"
  echo -e "  ${GREEN}./query_db.sh --model=Category --action=find --include='[\"Transaction\"]'${NC}"
  echo
  echo -e "${YELLOW}Available actions:${NC}"
  echo -e "  find     - Find multiple records"
  echo -e "  findOne  - Find a single record"
  echo -e "  count    - Count records"
  echo -e "  create   - Create a new record (requires --data)"
  echo -e "  update   - Update records (requires --data and --where)"
  echo -e "  delete   - Delete records (requires --where)"
  echo
  echo -e "${YELLOW}Available models:${NC}"
  echo -e "  User"
  echo -e "  Transaction"
  echo -e "  Category"
  echo -e "  Budget"
  echo -e "  Goal"
  echo -e "  GoalContribution"
fi
