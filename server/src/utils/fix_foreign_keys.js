/**
 * Database Foreign Key Fix Utility
 * 
 * This script is designed to fix SQLite foreign key constraint issues
 * by identifying and addressing problematic relationships between tables.
 * 
 * The script:
 * 1. Creates a backup of the current database
 * 2. Identifies all foreign key relationships
 * 3. Temporarily disables foreign key constraints
 * 4. Recreates the users table with the correct structure
 * 5. Re-enables foreign key constraints
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Backup current database
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

// Execute SQL with promise
const executeSql = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Query SQL with promise
const querySql = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Fix foreign key constraints
const fixForeignKeyConstraints = async () => {
  // Create backup first
  const backupSuccess = backupDatabase();
  if (!backupSuccess) {
    const proceed = await new Promise(resolve => {
      rl.question('Failed to create backup. Do you want to proceed anyway? (yes/no): ', answer => {
        resolve(answer.toLowerCase() === 'yes');
      });
    });
    
    if (!proceed) {
      console.log('Operation canceled.');
      rl.close();
      return;
    }
  }
  
  // Connect to database
  const dbPath = path.resolve(__dirname, '../../database.sqlite');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, err => {
    if (err) {
      console.error('Error connecting to database:', err);
      rl.close();
      return;
    }
    console.log('Connected to the SQLite database.');
  });
  
  try {
    // Get database schema
    console.log('Analyzing database schema...');
    
    // Turn off foreign key constraints temporarily
    await executeSql(db, 'PRAGMA foreign_keys = OFF;');
    
    // Get table info
    const tables = await querySql(db, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`);
    console.log(`Found ${tables.length} tables in the database.`);
    
    // Get users table schema
    const userColumns = await querySql(db, `PRAGMA table_info(users);`);
    console.log(`Users table has ${userColumns.length} columns.`);
    
    // Save users data
    const users = await querySql(db, `SELECT * FROM users;`);
    console.log(`Found ${users.length} user records to preserve.`);
    
    // Find all tables that reference users
    let referencingTables = [];
    
    for (const table of tables) {
      if (table.name === 'users') continue;
      
      const fks = await querySql(db, `PRAGMA foreign_key_list('${table.name}');`);
      const userFks = fks.filter(fk => fk.table === 'users');
      
      if (userFks.length > 0) {
        referencingTables.push({
          tableName: table.name,
          foreignKeys: userFks
        });
      }
    }
    
    console.log(`Found ${referencingTables.length} tables with foreign keys to users table.`);
    
    // Create transaction
    await executeSql(db, 'BEGIN TRANSACTION;');
    
    try {
      // Create backup table for user data
      await executeSql(db, `CREATE TABLE users_temp AS SELECT * FROM users;`);
      
      // Drop users table
      await executeSql(db, `DROP TABLE users;`);
      
      // Recreate users table with proper schema
      await executeSql(db, `
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
      `);
      
      // Restore user data
      await executeSql(db, `INSERT INTO users SELECT * FROM users_temp;`);
      
      // Restore foreign key constraints
      for (const table of referencingTables) {
        console.log(`Fixing references in table: ${table.tableName}`);
        
        // Verify data integrity for each foreign key
        for (const fk of table.foreignKeys) {
          const fkColumn = fk.from;
          const orphans = await querySql(db, `
            SELECT COUNT(*) as count 
            FROM ${table.tableName} t 
            LEFT JOIN users u ON t.${fkColumn} = u.id 
            WHERE t.${fkColumn} IS NOT NULL AND u.id IS NULL;
          `);
          
          if (orphans[0].count > 0) {
            console.log(`Warning: Found ${orphans[0].count} orphaned records in ${table.tableName}.${fkColumn}`);
            
            // Fix or delete orphaned records based on table importance
            if (['categories', 'budgets', 'goals'].includes(table.tableName)) {
              console.log(`Deleting orphaned records in ${table.tableName}...`);
              await executeSql(db, `
                DELETE FROM ${table.tableName}
                WHERE ${fkColumn} IS NOT NULL 
                AND ${fkColumn} NOT IN (SELECT id FROM users);
              `);
            }
          }
        }
      }
      
      // Drop temporary table
      await executeSql(db, `DROP TABLE users_temp;`);
      
      // Commit changes
      await executeSql(db, 'COMMIT;');
      console.log('All changes committed successfully.');
      
    } catch (error) {
      // Rollback on error
      await executeSql(db, 'ROLLBACK;');
      console.error('Error fixing database, changes rolled back:', error);
    }
    
    // Re-enable foreign key constraints
    await executeSql(db, 'PRAGMA foreign_keys = ON;');
    
    console.log('Database fix completed. You can now try to restart your server.');
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    // Close connection
    db.close();
    console.log('Database connection closed.');
    rl.close();
  }
};

// Run the fix
fixForeignKeyConstraints();
