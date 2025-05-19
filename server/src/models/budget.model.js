/**
 * Budget Model
 * 
 * Defines the database schema for user budgets within the application.
 * This model tracks financial planning targets and spending limits
 * organized by category and time period.
 * 
 * The model supports:
 * - Different budget periods (daily, weekly, monthly, yearly, custom)
 * - Category-specific and overall budgets
 * - Budget date ranges with start/end dates
 * - Active/inactive status tracking
 * 
 * Relationships:
 * - Belongs to a User (userId)
 * - Optionally belongs to a Category (categoryId)
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Budget = sequelize.define('Budget', {
    // Descriptive name of the budget
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Target amount for this budget in decimal format
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0  // Budget amount must be positive
      }
    },
    // Time interval for budget (daily, weekly, monthly, yearly, custom)
    period: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom'),
      allowNull: false,
      defaultValue: 'monthly'
    },
    // Date when budget tracking begins
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Optional date when budget ends (null = ongoing)
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Reference to the user who owns this budget
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Optional reference to category this budget applies to
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    // Whether this budget is currently active
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
        // Additional notes or description for this budget
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true  // Enables createdAt and updatedAt fields
  });

  // Define model associations
  Budget.associate = (models) => {
    // Each budget belongs to exactly one user
    Budget.belongsTo(models.User, { foreignKey: 'userId' });
    // Each budget can optionally belong to one category
    Budget.belongsTo(models.Category, { foreignKey: 'categoryId' });
  };

  return Budget;
};
