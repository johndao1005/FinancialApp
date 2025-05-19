/**
 * Category Model
 * 
 * Defines the database schema for transaction categories within the application.
 * Categories are used to organize and group transactions for better financial insight
 * and reporting. The system supports both default categories (available to all users)
 * and user-defined custom categories.
 * 
 * Features:
 * - Default system categories (maintained by admin)
 * - User-created custom categories
 * - Hierarchical category structure (parent-child relationships)
 * - Visual customization (icon and color)
 * 
 * Relationships:
 * - May belong to a User (user-specific categories)
 * - May have a parent Category (hierarchical structure)
 * - Has many Transactions (through categoryId)
 * - Has many Budgets (through categoryId)
 */
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('category', {
    // Unique identifier for each category
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // Display name of the category
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Icon identifier for visual representation
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Color code (hex) for visual representation
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Whether this is a system default category (true) or user-created (false)
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Optional reference to parent category for hierarchical structure
    parentCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    // Reference to the user who created this category (null for default categories)
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    timestamps: true  // Enables createdAt and updatedAt fields
  });

  return Category;
};
