/**
 * Fix Users Table Unique Constraint Error
 * 
 * This script fixes the SQLITE_CONSTRAINT error by identifying and 
 * resolving duplicate email entries in the database.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.resolve(__dirname, 'server/database.sqlite');

// Backup the database before making changes
const backupDatabase = () => {
  const backupPath = path.resolve(__dirname, `server/database_backup_${Date.now()}.sqlite`);
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`Database backed up to ${backupPath}`);
    return true;
  } catch (error) {
    console.error('Error backing up database:', error);
    return false;
  }
};

// Main function to fix the database
const fixUniqueConstraint = () => {
  console.log('Starting unique constraint fix...');
  
  // Create backup
  if (!backupDatabase()) {
    console.log('Warning: Failed to create backup. Proceeding anyway...');
  }
  
  // Open database connection
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the SQLite database.');
  });
  
  // Disable foreign keys
  db.run('PRAGMA foreign_keys = OFF;');
  
  // Start a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    
    // 1. Check and drop existing backup tables to start clean
    console.log('Removing any existing backup tables...');
    const tablesToDrop = ['users_backup', 'users_temp', 'users_fixed'];
    
    let droppedCount = 0;
    tablesToDrop.forEach(table => {
      db.run(`DROP TABLE IF EXISTS ${table};`, (err) => {
        if (err) {
          console.error(`Error dropping ${table}:`, err.message);
        } else {
          droppedCount++;
          if (droppedCount === tablesToDrop.length) {
            continueWithFix();
          }
        }
      });
    });
    
    // Continue with the fix after dropping tables
    function continueWithFix() {
      // 2. Create a new users_fixed table with proper constraints
      db.run(`
        CREATE TABLE users_fixed (
          id INTEGER PRIMARY KEY,
          firstName VARCHAR(255) NOT NULL,
          lastName VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          baseCurrency VARCHAR(255) DEFAULT 'USD',
          isActive BOOLEAN DEFAULT 1,
          isPremium BOOLEAN DEFAULT 0,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          settings TEXT
        );
      `, (err) => {
        if (err) {
          console.error('Error creating users_fixed table:', err.message);
          rollbackAndExit();
          return;
        }
        
        // 3. Insert data from users, skipping duplicates
        db.run(`
          INSERT OR IGNORE INTO users_fixed
          SELECT * FROM users
          WHERE email IN (
            SELECT MIN(email) FROM users GROUP BY email
          );
        `, (err) => {
          if (err) {
            console.error('Error copying unique users:', err.message);
            rollbackAndExit();
            return;
          }
          
          // 4. Find duplicate emails
          db.all(`
            SELECT email, COUNT(*) as count 
            FROM users 
            GROUP BY email 
            HAVING count > 1;
          `, (err, duplicates) => {
            if (err) {
              console.error('Error finding duplicates:', err.message);
              rollbackAndExit();
              return;
            }
            
            if (duplicates && duplicates.length > 0) {
              console.log(`Found ${duplicates.length} duplicate email(s):`);
              duplicates.forEach(dup => {
                console.log(`Email: ${dup.email}, Count: ${dup.count}`);
              });
              
              // 5. Handle duplicates - give them unique emails and insert
              let remainingDuplicates = duplicates.length;
              
              duplicates.forEach(dup => {
                db.all(`SELECT * FROM users WHERE email = ? ORDER BY id`, [dup.email], (err, users) => {
                  if (err) {
                    console.error(`Error getting users with email ${dup.email}:`, err.message);
                    remainingDuplicates--;
                    
                    if (remainingDuplicates === 0) {
                      finishRepair();
                    }
                    return;
                  }
                  
                  // Insert the first instance (should already be in the table from step 3)
                  
                  // Handle the duplicates (index 1 and beyond)
                  let processedDuplicates = 0;
                  
                  // Skip first user (already in the users_fixed table)
                  for (let i = 1; i < users.length; i++) {
                    const user = users[i];
                    const uniqueEmail = `${user.email.split('@')[0]}_${i}@${user.email.split('@')[1]}`;
                    
                    // Insert with modified email
                    db.run(
                      `INSERT INTO users_fixed (id, firstName, lastName, email, password, baseCurrency, isActive, isPremium, createdAt, updatedAt, settings) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                      [user.id, user.firstName, user.lastName, uniqueEmail, user.password, 
                       user.baseCurrency, user.isActive, user.isPremium, user.createdAt, 
                       user.updatedAt, user.settings],
                      (err) => {
                        if (err) {
                          console.error(`Error inserting fixed user for ${uniqueEmail}:`, err.message);
                        } else {
                          console.log(`Fixed duplicate: ${user.email} → ${uniqueEmail}`);
                        }
                        
                        processedDuplicates++;
                        if (processedDuplicates === users.length - 1) {
                          remainingDuplicates--;
                          
                          if (remainingDuplicates === 0) {
                            finishRepair();
                          }
                        }
                      }
                    );
                  }
                  
                  // Handle case where there are no duplicates to process
                  if (users.length <= 1) {
                    remainingDuplicates--;
                    if (remainingDuplicates === 0) {
                      finishRepair();
                    }
                  }
                });
              });
            } else {
              console.log('No duplicate emails found in users table.');
              finishRepair();
            }
          });
        });
      });
    }
    
    function finishRepair() {
      // Replace the original users table
      db.run(`DROP TABLE IF EXISTS users_old;`, (err) => {
        if (err) {
          console.error('Error dropping users_old table:', err.message);
          rollbackAndExit();
          return;
        }
        
        db.run(`ALTER TABLE users RENAME TO users_old;`, (err) => {
          if (err) {
            console.error('Error renaming users table:', err.message);
            rollbackAndExit();
            return;
          }
          
          db.run(`ALTER TABLE users_fixed RENAME TO users;`, (err) => {
            if (err) {
              console.error('Error renaming users_fixed to users:', err.message);
              rollbackAndExit();
              return;
            }
            
            // Commit transaction
            db.run('COMMIT;', (err) => {
              if (err) {
                console.error('Error committing transaction:', err.message);
                rollbackAndExit();
                return;
              }
              
              // Enable foreign keys
              db.run('PRAGMA foreign_keys = ON;');
              console.log('Database fix completed successfully!');
              
              // Close connection
              db.close((err) => {
                if (err) console.error('Error closing database:', err.message);
                console.log('You can now restart your server.');
                process.exit(0);
              });
            });
          });
        });
      });
    }
    
    function rollbackAndExit() {
      db.run('ROLLBACK;', () => {
        db.close();
        console.error('Fix failed, transaction rolled back');
        process.exit(1);
      });
    }
  });
};

// Run the fix
fixUniqueConstraint();
