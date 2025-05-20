/**
 * UserCategoryOverride Model
 * 
 * Stores user preferences for transaction categorization to improve
 * future auto-categorization accuracy. When a user manually changes
 * a transaction's category, this model records:
 * 
 * 1. The user who made the change
 * 2. The transaction pattern (merchant or description)
 * 3. The preferred category
 * 4. Match type (exact or pattern)
 * 5. Optional amount for matching recurring transactions
 * 
 * This data is used to automatically categorize future transactions
 * that match the same patterns.
 */
module.exports = (sequelize, DataTypes) => {
  const UserCategoryOverride = sequelize.define('userCategoryOverride', {
    // Unique identifier for each override
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    // User who created this override
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    
    // Category ID to apply
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    
    // Pattern to match - could be merchant name or transaction description
    pattern: {
      type: DataTypes.STRING,
      allowNull: false
    },
    
    // Which field to match against (merchant or description)
    matchField: {
      type: DataTypes.ENUM('merchant', 'description'),
      defaultValue: 'merchant',
      allowNull: false
    },
    
    // Match type (exact = exact match, pattern = contains)
    matchType: {
      type: DataTypes.ENUM('exact', 'pattern'),
      defaultValue: 'exact',
      allowNull: false
    },
    
    // Optional amount for matching recurring transactions
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    
    // Match priority (amount matching is lower priority)
    matchPriority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'high',
      allowNull: false
    },
    
    // Whether this override is active
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    
    // Number of times this override was applied
    useCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    
    // Last time this override was applied
    lastApplied: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return UserCategoryOverride;
};