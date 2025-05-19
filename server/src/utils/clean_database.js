/**
 * Database Cleaning Utility
 * 
 * This script provides options to:
 * 1. Clean specific tables in the database
 * 2. Reset the entire database while maintaining structure
 * 3. Delete all user data while preserving system records
 * 
 * Usage:
 * - Run with no args to see help: node clean_database.js
 * - Clean specific tables: node clean_database.js --tables=transactions,budgets
 * - Reset entire database: node clean_database.js --all
 * - Reset user data only: node clean_database.js --user-data
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Import models
const db = require('../models');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to prompt for confirmation
const confirmAction = (message) => {
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      resolve(answer.toLowerCase() === 'yes');
    });
  });
};

// Clean specific tables
const cleanTables = async (tableNames) => {
  console.log(`Preparing to clean tables: ${tableNames.join(', ')}`);
  
  try {
    // Start a transaction
    const transaction = await db.sequelize.transaction();
    
    try {
      for (const tableName of tableNames) {
        // Check if table exists in our models
        const model = db[tableName.charAt(0).toUpperCase() + tableName.slice(1)];
        
        if (!model) {
          console.log(`Warning: Table '${tableName}' not found in models. Skipping.`);
          continue;
        }
        
        console.log(`Deleting all records from ${tableName}...`);
        await model.destroy({ 
          where: {}, 
          truncate: true,
          cascade: true, 
          transaction 
        });
      }
      
      // Commit the transaction
      await transaction.commit();
      console.log('Successfully cleaned specified tables.');
    } catch (error) {
      // If any operation fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error cleaning tables:', error);
  }
};

// Reset entire database
const resetDatabase = async () => {
  console.log('Preparing to reset entire database...');
  
  try {
    // Drop all tables and recreate them
    await db.sequelize.sync({ force: true });
    console.log('Successfully reset database. All tables have been recreated.');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
};

// Clean only user data
const cleanUserData = async () => {
  console.log('Preparing to clean all user data...');
  
  try {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Delete user-specific data in the correct order to prevent foreign key errors
      console.log('Deleting transactions...');
      await db.Transaction.destroy({ where: {}, truncate: true, cascade: true, transaction });
      
      console.log('Deleting goal contributions...');
      await db.GoalContribution.destroy({ where: {}, truncate: true, cascade: true, transaction });
      
      console.log('Deleting goals...');
      await db.Goal.destroy({ where: {}, truncate: true, cascade: true, transaction });
      
      console.log('Deleting budgets...');
      await db.Budget.destroy({ where: {}, truncate: true, cascade: true, transaction });
      
      console.log('Deleting user-created categories...');
      await db.Category.destroy({ 
        where: { isDefault: false }, 
        transaction 
      });
      
      console.log('Deleting users...');
      await db.User.destroy({ where: {}, truncate: true, cascade: true, transaction });
      
      // Commit the transaction
      await transaction.commit();
      console.log('Successfully cleaned all user data while preserving system records.');
    } catch (error) {
      // If any operation fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error cleaning user data:', error);
  }
};

// Backup the database before making changes
const backupDatabase = () => {
  const dbPath = path.resolve(__dirname, '../../database.sqlite');
  const backupPath = path.resolve(__dirname, `../../database_backup_${Date.now()}.sqlite`);
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`Database backed up to ${backupPath}`);
    return true;
  } catch (error) {
    console.error('Error backing up database:', error);
    return false;
  }
};

// Main function
const main = async () => {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Database Cleaning Utility

Options:
  --tables=table1,table2   Clean specific tables (comma-separated)
  --all                    Reset entire database (recreate schema)
  --user-data              Clean all user data but preserve system records
  --help                   Display this help message
    `);
    rl.close();
    return;
  }
  
  // Check for help flag
  if (args.includes('--help')) {
    console.log(`
Database Cleaning Utility

Options:
  --tables=table1,table2   Clean specific tables (comma-separated)
  --all                    Reset entire database (recreate schema)
  --user-data              Clean all user data but preserve system records
  --help                   Display this help message
    `);
    rl.close();
    return;
  }
  
  // Create backup before proceeding
  console.log('Creating database backup...');
  const backupSuccess = backupDatabase();
  
  if (!backupSuccess) {
    const proceed = await confirmAction('Failed to create backup. Do you want to proceed anyway?');
    if (!proceed) {
      console.log('Operation canceled.');
      rl.close();
      return;
    }
  }
  
  // Execute the appropriate clean operation
  for (const arg of args) {
    if (arg.startsWith('--tables=')) {
      const tables = arg.replace('--tables=', '').split(',').map(t => t.trim());
      const proceed = await confirmAction(`Are you sure you want to clean the following tables: ${tables.join(', ')}?`);
      
      if (proceed) {
        await cleanTables(tables);
      } else {
        console.log('Operation canceled.');
      }
    } else if (arg === '--all') {
      const proceed = await confirmAction('Are you sure you want to reset the ENTIRE database? This will delete ALL data and recreate the schema.');
      
      if (proceed) {
        await resetDatabase();
      } else {
        console.log('Operation canceled.');
      }
    } else if (arg === '--user-data') {
      const proceed = await confirmAction('Are you sure you want to clean all user data while preserving system records?');
      
      if (proceed) {
        await cleanUserData();
      } else {
        console.log('Operation canceled.');
      }
    }
  }
  
  rl.close();
  process.exit(0);
};

// Start the script
main().catch(error => {
  console.error('Unhandled error:', error);
  rl.close();
  process.exit(1);
});
