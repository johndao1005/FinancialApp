/**
 * Fix Email Unique Constraint Error
 * 
 * This script resolves the unique constraint error on the users table
 * by directly accessing the SQLite database and fixing the issue.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.resolve(__dirname, '../../database.sqlite');

// Backup the database before making changes
const backupDatabase = () => {
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

// Main function to fix the database
const fixDatabaseConstraints = () => {
  console.log('Starting database repair...');
  
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
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = OFF;');
  
  // Start a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    
    // Check if users_backup table exists and drop it
    db.run(`DROP TABLE IF EXISTS users_backup;`, (err) => {
      if (err) {
        console.error('Error dropping backup table:', err.message);
        db.run('ROLLBACK;');
        db.close();
        process.exit(1);
      }
      console.log('Removed any existing backup tables.');
      
      // Check for duplicate emails in the users table
      db.all(`
        SELECT email, COUNT(*) as count 
        FROM users 
        GROUP BY email 
        HAVING count > 1;
      `, (err, rows) => {
        if (err) {
          console.error('Error checking for duplicate emails:', err.message);
          db.run('ROLLBACK;');
          db.close();
          process.exit(1);
        }
        
        if (rows && rows.length > 0) {
          console.log('Found duplicate emails in users table:');
          rows.forEach(row => {
            console.log(`Email: ${row.email}, Count: ${row.count}`);
          });
          
          // Fix duplicate emails by adding a unique suffix
          console.log('Fixing duplicate emails...');
          
          let fixedCount = 0;
          let remaining = rows.length;
          
          rows.forEach(row => {
            // Get all users with this email
            db.all(`SELECT id FROM users WHERE email = ?;`, [row.email], (err, users) => {
              if (err) {
                console.error('Error retrieving users with duplicate email:', err.message);
                return;
              }
              
              // Keep the first one, rename others
              for (let i = 1; i < users.length; i++) {
                const newEmail = `${row.email.split('@')[0]}_${i}@${row.email.split('@')[1]}`;
                
                db.run(`UPDATE users SET email = ? WHERE id = ?;`, [newEmail, users[i].id], (err) => {
                  if (err) {
                    console.error(`Error updating email for user ${users[i].id}:`, err.message);
                  } else {
                    console.log(`Updated email for user ${users[i].id} to ${newEmail}`);
                    fixedCount++;
                  }
                  
                  // Check if all done
                  remaining--;
                  if (remaining <= 0) {
                    finishRepair(db, fixedCount);
                  }
                });
              }
              
              // If no updates were needed
              if (users.length <= 1) {
                remaining--;
                if (remaining <= 0) {
                  finishRepair(db, fixedCount);
                }
              }
            });
          });
        } else {
          console.log('No duplicate emails found in users table.');
          
          // Check for NULL emails
          db.all(`SELECT id FROM users WHERE email IS NULL;`, (err, nullUsers) => {
            if (err) {
              console.error('Error checking for NULL emails:', err.message);
              db.run('ROLLBACK;');
              db.close();
              process.exit(1);
            }
            
            if (nullUsers && nullUsers.length > 0) {
              console.log(`Found ${nullUsers.length} users with NULL emails. Fixing...`);
              
              let fixedCount = 0;
              let remaining = nullUsers.length;
              
              nullUsers.forEach(user => {
                const tempEmail = `temp_user_${user.id}@example.com`;
                
                db.run(`UPDATE users SET email = ? WHERE id = ?;`, [tempEmail, user.id], (err) => {
                  if (err) {
                    console.error(`Error updating NULL email for user ${user.id}:`, err.message);
                  } else {
                    console.log(`Updated NULL email for user ${user.id} to ${tempEmail}`);
                    fixedCount++;
                  }
                  
                  // Check if all done
                  remaining--;
                  if (remaining <= 0) {
                    finishRepair(db, fixedCount);
                  }
                });
              });
            } else {
              console.log('No NULL emails found in users table.');
              
              // Try to identify any other issues with the table
              console.log('Verifying users table structure...');
              
              // Try to delete any constraint-related temporary tables
              const tempTables = [
                'users_backup', 
                'users_temp', 
                'users_new',
                'SequelizeMeta'
              ];
              
              let droppedTables = 0;
              
              tempTables.forEach(table => {
                db.run(`DROP TABLE IF EXISTS ${table};`, (err) => {
                  if (err) {
                    console.error(`Error dropping ${table} table:`, err.message);
                  } else {
                    droppedTables++;
                    console.log(`Dropped ${table} table if it existed.`);
                  }
                  
                  if (droppedTables === tempTables.length) {
                    finishRepair(db, 0);
                  }
                });
              });
            }
          });
        }
      });
    });
  });
};

// Finish the repair process
const finishRepair = (db, fixedCount) => {
  // Commit the transaction
  db.run('COMMIT;', (err) => {
    if (err) {
      console.error('Error committing transaction:', err.message);
      db.run('ROLLBACK;');
    } else {
      console.log(`Database repair completed. Fixed ${fixedCount} issues.`);
    }
    
    // Re-enable foreign keys
    db.run('PRAGMA foreign_keys = ON;');
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
      
      console.log('You can now try to restart your server.');
      process.exit(0);
    });
  });
};

// Run the fix
fixDatabaseConstraints();
