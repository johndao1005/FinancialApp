/**
 * User Seed Utility
 * 
 * This script creates a test user for development purposes.
 */
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Create a test user
const seedTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({
      where: {
        email: 'test@example.com'
      }
    });
    
    if (existingUser) {
      console.log('Test user already exists. Skipping user seed.');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create test user
    await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: hashedPassword,
      baseCurrency: 'USD',
      isActive: true,
      isPremium: false
    });
    
    console.log('Test user created successfully:');
    console.log('- Email: test@example.com');
    console.log('- Password: password123');
  } catch (error) {
    console.error('Error seeding test user:', error);
  }
};

// Run the seed function when called directly
if (require.main === module) {
  seedTestUser()
    .then(() => {
      console.log('User seed completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error in user seed:', err);
      process.exit(1);
    });
} else {
  // Export for use in other modules
  module.exports = { seedTestUser };
}
