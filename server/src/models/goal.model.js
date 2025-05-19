/**
 * Goal Model
 * 
 * Defines the database schema for financial goals within the application.
 * Goals can be used to track savings targets, debt repayment, investments,
 * and other financial objectives with progress tracking over time.
 * 
 * Features:
 * - Multiple goal types (saving, debt, investment, expense, other)
 * - Progress tracking with current amount toward target
 * - Timeframe tracking with target dates
 * - Priority levels and status tracking
 * - Visual customization options
 * 
 * Relationships:
 * - Belongs to a User (userId)
 * - Optionally belongs to a Category (categoryId)
 * - Has many GoalContributions tracking additions to the goal
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Goal = sequelize.define('Goal', {
    // Display name of the financial goal
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Detailed description of the goal and its purpose
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Total monetary amount needed to complete the goal
    targetAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0  // Target amount must be positive
      }
    },
    // Current progress toward the target amount
    currentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0  // Current amount must be positive
      }
    },
    // Date by which the goal should be completed
    targetDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Date when the goal was created or tracking started
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Type/category of goal (saving, debt payoff, etc.)
    type: {
      type: DataTypes.ENUM('saving', 'debt', 'investment', 'expense', 'other'),
      allowNull: false,
      defaultValue: 'saving'
    },
    // Current progress status of the goal
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
      allowNull: false,
      defaultValue: 'in_progress'
    },
    // Reference to the user who owns this goal
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Optional reference to a financial category
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    // Importance level of the goal
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    },
    // Visual customization - color for display
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#1677ff'  // Default blue color
    },
    // Visual customization - icon identifier
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Additional user notes about the goal
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true  // Enables createdAt and updatedAt fields
  });

  // Define model associations
  Goal.associate = (models) => {
    // Each goal belongs to exactly one user
    Goal.belongsTo(models.User, { foreignKey: 'userId' });
    // Each goal can optionally belong to one category
    Goal.belongsTo(models.Category, { foreignKey: 'categoryId' });
    // Each goal can have multiple contributions tracking progress
    Goal.hasMany(models.GoalContribution, { foreignKey: 'goalId', as: 'contributions' });
  };

  return Goal;
};
