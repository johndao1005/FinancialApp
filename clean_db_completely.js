/**
 * Complete SQLite Database Cleanup
 * 
 * This script performs a thorough cleaning of the SQLite database:
 * 1. Removes all backup tables
 * 2. Fixes constraint issues with users table
 * 3. Removes duplicate email entries
 * 4. Cleans up any metadata tables causing issues
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.resolve(__dirname, 'server/database.sqlite');

// Create backup before cleaning
const createBackup = () => {
  const backupPath = path.resolve(__dirname, `server/database_backup_${Date.now()}.sqlite`);
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`Database backed up to ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Error backing up database:', error.message);
    return null;
  }
};

// Main function to clean the database
const cleanDatabase = () => {
  console.log('\n=== Complete Database Cleanup ===\n');
  
  // Create backup
  const backupPath = createBackup();
  if (!backupPath) {
    console.error('Failed to create backup. Aborting cleanup.');
    process.exit(1);
  }
  
  // Connect to database
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
      process.exit(1);
    }
    console.log('Connected to SQLite database');
  });

  // Disable foreign keys and begin transaction
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = OFF;');
    db.run('BEGIN TRANSACTION;');
    
    // 1. Get list of all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
      if (err) {
        console.error('Error getting tables:', err.message);
        rollbackAndExit(db);
        return;
      }
      
      console.log(`Found ${tables.length} tables in database`);
      
      // 2. Identify and drop backup tables
      const backupTables = tables
        .map(t => t.name)
        .filter(name => 
          name.includes('_backup') || 
          name.includes('_temp') || 
          name.includes('_old') || 
          name.endsWith('_new')
        );
      
      console.log('Found backup tables:', backupTables.length ? backupTables.join(', ') : 'None');
      
      let droppedTables = 0;
      
      // Drop backup tables if any exist
      if (backupTables.length > 0) {
        backupTables.forEach(tableName => {
          db.run(`DROP TABLE IF EXISTS ${tableName};`, err => {
            if (err) {
              console.error(`Error dropping ${tableName}:`, err.message);
            } else {
              console.log(`Dropped table: ${tableName}`);
            }
            
            droppedTables++;
            if (droppedTables === backupTables.length) {
              // Continue with fixing email constraints
              fixEmailConstraints();
            }
          });
        });
      } else {
        // No backup tables, proceed directly
        fixEmailConstraints();
      }
      
      // 3. Fix email constraints in users table
      function fixEmailConstraints() {
        console.log('\nFixing email constraints in users table...');
        
        // Check if users table exists
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", (err, result) => {
          if (err || !result) {
            console.log('Users table not found or error:', err ? err.message : 'Table doesn\'t exist');
            reviewSequelizeMeta();
            return;
          }
          
          // Check for duplicate emails
          db.all(`
            SELECT email, COUNT(*) as count 
            FROM users 
            GROUP BY email 
            HAVING count > 1;
          `, (err, duplicates) => {
            if (err) {
              console.error('Error checking for duplicate emails:', err.message);
              reviewSequelizeMeta();
              return;
            }
            
            if (duplicates && duplicates.length > 0) {
              console.log(`Found ${duplicates.length} emails with duplicates`);
              
              // Create temporary table with correct constraints
              db.run(`CREATE TABLE users_clean (
                id INTEGER PRIMARY KEY,
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                baseCurrency VARCHAR(255) DEFAULT 'USD',
                isActive BOOLEAN DEFAULT 1,
                isPremium BOOLEAN DEFAULT 0,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                settings TEXT
              );`, err => {
                if (err) {
                  console.error('Error creating clean users table:', err.message);
                  reviewSequelizeMeta();
                  return;
                }
                
                // Copy non-duplicate entries first (keeping the first one of each duplicate)
                db.run(`
                  INSERT INTO users_clean
                  SELECT u.* FROM users u
                  JOIN (
                    SELECT email, MIN(id) as id
                    FROM users
                    GROUP BY email
                  ) first ON u.id = first.id;
                `, err => {
                  if (err) {
                    console.error('Error copying unique users:', err.message);
                    reviewSequelizeMeta();
                    return;
                  }
                  
                  console.log('Copied unique users to new table');
                  
                  // Replace users table
                  db.run(`DROP TABLE users;`, err => {
                    if (err) {
                      console.error('Error dropping users table:', err.message);
                      reviewSequelizeMeta();
                      return;
                    }
                    
                    db.run(`ALTER TABLE users_clean RENAME TO users;`, err => {
                      if (err) {
                        console.error('Error renaming cleaned table:', err.message);
                        reviewSequelizeMeta();
                        return;
                      }
                      
                      console.log('Successfully fixed users table');
                      reviewSequelizeMeta();
                    });
                  });
                });
              });
            } else {
              console.log('No duplicate emails found in users table');
              reviewSequelizeMeta();
            }
          });
        });
      }
      
      // 4. Reset SequelizeMeta if needed
      function reviewSequelizeMeta() {
        console.log('\nReviewing SequelizeMeta table...');
        
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='SequelizeMeta';", (err, result) => {
          if (err) {
            console.error('Error checking for SequelizeMeta:', err.message);
            cleanupOtherTables();
            return;
          }
          
          if (result) {
            // Check if there are any entries for users_backup or problematic migrations
            db.all("SELECT * FROM SequelizeMeta WHERE name LIKE '%users_backup%' OR name LIKE '%users-email%';", (err, migrations) => {
              if (err) {
                console.error('Error checking SequelizeMeta entries:', err.message);
                cleanupOtherTables();
                return;
              }
              
              if (migrations && migrations.length > 0) {
                console.log(`Found ${migrations.length} problematic migrations to remove`);
                
                let removedCount = 0;
                migrations.forEach(migration => {
                  db.run(`DELETE FROM SequelizeMeta WHERE name = ?`, [migration.name], err => {
                    if (err) {
                      console.error(`Error removing migration ${migration.name}:`, err.message);
                    } else {
                      console.log(`Removed migration: ${migration.name}`);
                    }
                    
                    removedCount++;
                    if (removedCount === migrations.length) {
                      cleanupOtherTables();
                    }
                  });
                });
              } else {
                console.log('No problematic migrations found');
                cleanupOtherTables();
              }
            });
          } else {
            console.log('SequelizeMeta table not found');
            cleanupOtherTables();
          }
        });
      }
      
      // 5. Clean up other tables that might have references to removed users
      function cleanupOtherTables() {
        console.log('\nCleaning up other tables...');
        
        // Get list of tables with userId columns 
        db.all(`
          SELECT name FROM sqlite_master 
          WHERE type='table' 
          AND sql LIKE '%userId%' 
          AND name != 'users' 
          AND name NOT LIKE 'sqlite_%';
        `, (err, tables) => {
          if (err) {
            console.error('Error finding tables with userId:', err.message);
            completeCleaning();
            return;
          }
          
          if (tables && tables.length > 0) {
            console.log(`Found ${tables.length} tables with userId references`);
            let processedTables = 0;
            
            tables.forEach(table => {
              // Get all valid user IDs
              db.all(`SELECT id FROM users;`, (err, users) => {
                if (err) {
                  console.error('Error getting valid users:', err.message);
                  processedTables++;
                  if (processedTables === tables.length) {
                    completeCleaning();
                  }
                  return;
                }
                
                const validUserIds = users.map(u => u.id);
                
                // Remove rows with invalid user IDs
                db.run(`DELETE FROM ${table.name} WHERE userId NOT IN (${validUserIds.join(',')});`, err => {
                  if (err) {
                    console.error(`Error cleaning up table ${table.name}:`, err.message);
                  } else {
                    console.log(`Cleaned up table: ${table.name}`);
                  }
                  
                  processedTables++;
                  if (processedTables === tables.length) {
                    completeCleaning();
                  }
                });
              });
            });
          } else {
            console.log('No tables with userId references found');
            completeCleaning();
          }
        });
      }
      
      // 6. Final steps and completion
      function completeCleaning() {
        console.log('\nCompleting cleanup process...');
        
        // Commit transaction and re-enable foreign keys
        db.run('COMMIT;', err => {
          if (err) {
            console.error('Error committing changes:', err.message);
            rollbackAndExit(db);
            return;
          }
          
          db.run('PRAGMA foreign_keys = ON;');
          
          // Vacuum database
          db.run('VACUUM;', err => {
            if (err) {
              console.error('Error vacuuming database:', err.message);
            } else {
              console.log('Database vacuumed successfully');
            }
            
            // Close database connection
            db.close(err => {
              if (err) {
                console.error('Error closing database:', err.message);
              }
              
              console.log('\n=== Database cleanup completed! ===');
              console.log(`Original database backed up to: ${backupPath}`);
              console.log('You can now restart your server.');
              process.exit(0);
            });
          });
        });
      }
    });
  });
};

// Helper function for transaction rollback
function rollbackAndExit(db) {
  db.run('ROLLBACK;', () => {
    db.close(() => {
      console.error('Cleanup failed, changes rolled back');
      process.exit(1);
    });
  });
}

// Run the clean function
cleanDatabase();
