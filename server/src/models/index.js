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
const Budget = require('./budget.model')(sequelize, DataTypes);
const Goal = require('./goal.model')(sequelize, DataTypes);
const GoalContribution = require('./goalContribution.model')(sequelize, DataTypes);
const UserCategoryOverride = require('./userCategoryOverride.model')(sequelize, DataTypes);
const IncomePrediction = require('./incomePrediction.model')(sequelize, DataTypes);

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

// Budget relationships
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Budget, { foreignKey: 'categoryId', as: 'budgets' });
Budget.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Goal relationships
User.hasMany(Goal, { foreignKey: 'userId', as: 'goals' });
Goal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Goal, { foreignKey: 'categoryId', as: 'goals' });
Goal.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Goal Contribution relationships
User.hasMany(GoalContribution, { foreignKey: 'userId', as: 'goalContributions' });
GoalContribution.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Goal.hasMany(GoalContribution, { foreignKey: 'goalId', as: 'contributions' });
GoalContribution.belongsTo(Goal, { foreignKey: 'goalId', as: 'goal' });

Transaction.hasMany(GoalContribution, { foreignKey: 'transactionId', as: 'goalContributions' });
GoalContribution.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// User Category Override relationships
User.hasMany(UserCategoryOverride, { foreignKey: 'userId', as: 'categoryOverrides' });
UserCategoryOverride.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(UserCategoryOverride, { foreignKey: 'categoryId', as: 'categoryOverrides' });
UserCategoryOverride.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Income Prediction relationships
User.hasMany(IncomePrediction, { foreignKey: 'userId', as: 'incomePredictions' });
IncomePrediction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Transaction,
  Category,
  Budget,
  Goal,
  GoalContribution,
  UserCategoryOverride,
  IncomePrediction
};
