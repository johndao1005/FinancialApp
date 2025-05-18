const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Use SQLite instead of PostgreSQL for development without a separate DB server
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
});

// Initialize models
const User = require('./user.model')(sequelize, DataTypes);
const Transaction = require('./transaction.model')(sequelize, DataTypes);
const Category = require('./category.model')(sequelize, DataTypes);

// Define relationships
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Transaction, { foreignKey: 'categoryId', as: 'transactions' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User-created categories
User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Self-reference for subcategories
Category.hasMany(Category, { foreignKey: 'parentCategoryId', as: 'subCategories' });
Category.belongsTo(Category, { foreignKey: 'parentCategoryId', as: 'parentCategory' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Transaction,
  Category
};
