/**
 * Migration script to add the settings column to users table
 */
const { sequelize } = require('../models');

async function addSettingsColumn() {
  try {
    console.log('Adding settings column to users table...');
    
    // Check if column exists first
    const columns = await sequelize.query(
      "PRAGMA table_info(users);",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    const settingsColumnExists = columns.some(col => col.name === 'settings');
    
    if (settingsColumnExists) {
      console.log('Settings column already exists. No changes needed.');
      return;
    }
    
    // Add settings column
    await sequelize.query(
      "ALTER TABLE users ADD COLUMN settings TEXT;"
    );
    
    console.log('Settings column added successfully!');
  } catch (error) {
    console.error('Error adding settings column:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addSettingsColumn();
