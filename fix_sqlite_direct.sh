#!/bin/bash

# Direct SQLite Fix Script for FinancialApp
# This script directly uses SQLite3 to fix database issues

# Colors for better readability
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Print header
echo -e "${CYAN}==========================================${NC}"
echo -e "${CYAN}    Direct SQLite Database Fix Tool       ${NC}"
echo -e "${CYAN}==========================================${NC}"
echo

# Check if sqlite3 is installed
if ! command -v sqlite3 &> /dev/null; then
    echo -e "${RED}Error: sqlite3 command not found.${NC}"
    echo -e "${YELLOW}Please install SQLite by running:${NC}"
    echo "brew install sqlite"
    exit 1
fi

# Database path
DB_PATH="$(dirname "$0")/server/database.sqlite"
BACKUP_PATH="$(dirname "$0")/server/database_backup_$(date +%s).sqlite"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}Error: Database file not found at $DB_PATH${NC}"
    exit 1
fi

# Create backup
echo -e "${YELLOW}Creating database backup...${NC}"
cp "$DB_PATH" "$BACKUP_PATH"
echo -e "${GREEN}Database backed up to: $BACKUP_PATH${NC}"
echo

# Run SQLite commands
echo -e "${CYAN}Applying fixes to database...${NC}"

# Create temporary SQL file
TMP_SQL=$(mktemp)

cat > "$TMP_SQL" << 'EOL'
-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Begin transaction
BEGIN TRANSACTION;

-- Check if backup tables exist and drop them
DROP TABLE IF EXISTS users_backup;
DROP TABLE IF EXISTS users_temp;
DROP TABLE IF EXISTS users_new;
DROP TABLE IF EXISTS SequelizeMeta;

-- Fix broken users table references
CREATE TABLE IF NOT EXISTS users_fixed (
    id CHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    baseCurrency VARCHAR(255) DEFAULT 'USD',
    isActive BOOLEAN DEFAULT 1,
    isPremium BOOLEAN DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Copy data if users table exists
INSERT OR IGNORE INTO users_fixed 
SELECT id, firstName, lastName, email, password, baseCurrency, isActive, isPremium, createdAt, updatedAt 
FROM users;

-- Verify uniqueness of email
DELETE FROM users_fixed 
WHERE rowid NOT IN (
    SELECT MIN(rowid) 
    FROM users_fixed 
    GROUP BY email
);

-- Drop and recreate users table
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    baseCurrency VARCHAR(255) DEFAULT 'USD',
    isActive BOOLEAN DEFAULT 1,
    isPremium BOOLEAN DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Copy data back
INSERT INTO users SELECT * FROM users_fixed;

-- Clean up
DROP TABLE users_fixed;

-- Reset any sequences
UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'users';

-- Complete transaction
COMMIT;

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Vacuum database
VACUUM;
EOL

# Execute SQL script
sqlite3 "$DB_PATH" < "$TMP_SQL"

# Check if successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database fix applied successfully!${NC}"
else
    echo -e "${RED}Error applying database fix.${NC}"
    echo -e "${YELLOW}Restoring from backup...${NC}"
    cp "$BACKUP_PATH" "$DB_PATH"
    echo -e "${GREEN}Database restored from backup.${NC}"
    rm "$TMP_SQL"
    exit 1
fi

# Clean up
rm "$TMP_SQL"

echo
echo -e "${GREEN}Database fix completed.${NC}"
echo -e "${YELLOW}Try restarting your server now with:${NC}"
echo -e "cd \"$(dirname "$0")/server\" && npm start"
