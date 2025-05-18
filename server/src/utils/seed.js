const { Category } = require('../models');
const { sequelize } = require('../models');

// Default categories for the application
const defaultCategories = [
  {
    name: 'Groceries',
    icon: 'shopping-cart',
    color: '#4caf50',
    isDefault: true
  },
  {
    name: 'Dining',
    icon: 'restaurant',
    color: '#ff9800',
    isDefault: true
  },
  {
    name: 'Transportation',
    icon: 'car',
    color: '#2196f3',
    isDefault: true
  },
  {
    name: 'Utilities',
    icon: 'lightbulb',
    color: '#9c27b0',
    isDefault: true
  },
  {
    name: 'Entertainment',
    icon: 'movie',
    color: '#e91e63',
    isDefault: true
  },
  {
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#00bcd4',
    isDefault: true
  },
  {
    name: 'Housing',
    icon: 'home',
    color: '#795548',
    isDefault: true
  },
  {
    name: 'Healthcare',
    icon: 'medical-services',
    color: '#f44336',
    isDefault: true
  },
  {
    name: 'Education',
    icon: 'school',
    color: '#673ab7',
    isDefault: true
  },
  {
    name: 'Income',
    icon: 'account-balance',
    color: '#4caf50',
    isDefault: true
  },
  {
    name: 'Uncategorized',
    icon: 'help',
    color: '#9e9e9e',
    isDefault: true
  }
];

// Function to seed the database with default categories
const seedCategories = async () => {
  try {
    // Check if default categories already exist
    const existingCategories = await Category.findAll({
      where: {
        isDefault: true
      }
    });
    
    // If default categories already exist, skip seeding
    if (existingCategories.length > 0) {
      console.log('Default categories already exist. Skipping seed.');
      return;
    }
    
    // Create default categories
    await Category.bulkCreate(defaultCategories);
    console.log('Default categories created successfully');
  } catch (error) {
    console.error('Error seeding default categories:', error);
  }
};

module.exports = { seedCategories };
