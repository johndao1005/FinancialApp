#!/bin/bash

# Reset Database Script for FinancialApp
# This script completely resets the database by:
# 1. Creating a backup of the current database
# 2. Deleting the current database
# 3. Creating a new, empty database
# 4. Running initial seeds if desired

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Print header
echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}    DATABASE COMPLETE RESET UTILITY      ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo

# Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"
DB_PATH="$SERVER_DIR/database.sqlite"
BACKUP_PATH="$SERVER_DIR/database_backup_$(date +%s).sqlite"

# Check if server directory exists
if [ ! -d "$SERVER_DIR" ]; then
  echo -e "${RED}Error: Server directory not found at $SERVER_DIR${NC}"
  exit 1
fi

# Change to the server directory
cd "$SERVER_DIR" || {
  echo -e "${RED}Error: Cannot change to server directory.${NC}"
  exit 1
}

echo -e "${GREEN}Working directory: $(pwd)${NC}"
echo

# Check if database file exists
if [ -f "$DB_PATH" ]; then
  # Create backup
  echo -e "${YELLOW}Creating backup of existing database...${NC}"
  cp "$DB_PATH" "$BACKUP_PATH"
  echo -e "${GREEN}Database backed up to: ${BACKUP_PATH}${NC}"
  
  # Ask for confirmation
  echo
  echo -e "${RED}WARNING: This will delete all data in your database!${NC}"
  read -p "Are you absolutely sure you want to proceed? Type 'RESET' to confirm: " confirmation
  
  if [ "$confirmation" != "RESET" ]; then
    echo -e "${YELLOW}Operation cancelled. No changes were made.${NC}"
    exit 0
  fi
  
  # Delete the database file
  echo
  echo -e "${YELLOW}Deleting current database...${NC}"
  rm "$DB_PATH"
  echo -e "${GREEN}Current database deleted.${NC}"
else
  echo -e "${YELLOW}No existing database found. Creating new database.${NC}"
fi

# Create empty database with schema
echo
echo -e "${CYAN}Initializing new database...${NC}"

# Check if node_modules directory exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  echo
fi

# Create a temporary JS file to initialize database
TMP_JS=$(mktemp)
cat > "$TMP_JS" << 'EOL'
const { Sequelize } = require('sequelize');
const path = require('path');

console.log('Creating new database with schema...');

// Create new database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

// Import models
const db = require('../src/models');

// Initialize database with sync
async function initDb() {
  try {
    // Create tables
    await db.sequelize.sync({ force: true });
    console.log('Database schema created successfully.');
    
    // Check if seed flag was passed
    const shouldSeed = process.argv.includes('--seed');
    
    if (shouldSeed) {
      console.log('Running initial seed data...');
      // Import seed function if it exists
      try {
        const seed = require('../src/utils/seed');
        await seed();
        console.log('Seed data inserted successfully.');
      } catch (seedError) {
        console.error('Error running seed:', seedError.message);
        console.log('Database created but without seed data.');
      }
    }
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initDb();
EOL

# Run the temporary script to initialize database
node "$TMP_JS" "$@"

# Remove the temporary file
rm "$TMP_JS"

# Ask if user wants to seed data
echo
read -p "Do you want to include initial seed data? (y/n): " seed_choice

if [[ $seed_choice == "y" || $seed_choice == "Y" ]]; then
  echo
  echo -e "${CYAN}Seeding initial data...${NC}"
  
  # Create a temporary seed script if it doesn't exist
  if [ ! -f "$SERVER_DIR/src/utils/seed.js" ]; then
    echo -e "${YELLOW}Creating basic seed script...${NC}"
    
    mkdir -p "$SERVER_DIR/src/utils"
    cat > "$SERVER_DIR/src/utils/seed.js" << 'EOL'
/**
 * Database Seed Utility
 * 
 * Provides initial data for the application database.
 * This includes default categories and a test user.
 */
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

// Seed default categories
const seedCategories = async () => {
  // Default expense categories
  const expenseCategories = [
    { name: 'Food & Dining', icon: 'restaurant', color: '#FF5722', isDefault: true },
    { name: 'Bills & Utilities', icon: 'payment', color: '#03A9F4', isDefault: true },
    { name: 'Transportation', icon: 'directions_car', color: '#3F51B5', isDefault: true },
    { name: 'Shopping', icon: 'shopping_cart', color: '#E91E63', isDefault: true },
    { name: 'Entertainment', icon: 'movie', color: '#9C27B0', isDefault: true },
    { name: 'Health & Fitness', icon: 'fitness_center', color: '#4CAF50', isDefault: true },
    { name: 'Travel', icon: 'flight', color: '#FF9800', isDefault: true },
    { name: 'Education', icon: 'school', color: '#795548', isDefault: true },
    { name: 'Personal Care', icon: 'spa', color: '#607D8B', isDefault: true },
    { name: 'Gifts & Donations', icon: 'card_giftcard', color: '#FFC107', isDefault: true },
  ];
  
  // Default income categories
  const incomeCategories = [
    { name: 'Salary', icon: 'work', color: '#4CAF50', isDefault: true },
    { name: 'Freelance', icon: 'computer', color: '#2196F3', isDefault: true },
    { name: 'Investments', icon: 'trending_up', color: '#673AB7', isDefault: true },
    { name: 'Gifts', icon: 'redeem', color: '#FF5722', isDefault: true },
  ];
  
  const categories = [...expenseCategories, ...incomeCategories];
  
  for (const category of categories) {
    await db.Category.create({
      id: uuidv4(),
      ...category
    });
  }
  
  console.log(`Created ${categories.length} default categories`);
};

// Seed a test user
const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await db.User.create({
    id: uuidv4(),
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: hashedPassword,
    baseCurrency: 'USD',
    isActive: true,
    isPremium: false
  });
  
  console.log(`Created test user: ${user.email} (password: password123)`);
};

// Main seed function
module.exports = async () => {
  try {
    await seedCategories();
    await seedUsers();
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
EOL
  fi
  
  # Run the seed script
  node -e "require('./src/utils/seed')()
    .then(() => console.log('Seeding completed'))
    .catch(err => console.error('Seed error:', err))
    .finally(() => process.exit());"
    
  echo -e "${GREEN}Seed data added successfully.${NC}"
else
  echo -e "${YELLOW}Skipping seed data. Database created with empty tables.${NC}"
fi

echo
echo -e "${GREEN}Database has been completely reset!${NC}"
echo -e "${YELLOW}You can now start your server with:${NC}"
echo -e "cd \"$SERVER_DIR\" && npm start"
