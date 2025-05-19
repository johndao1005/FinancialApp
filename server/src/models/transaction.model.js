/**
 * Transaction Model
 * 
 * Defines the database schema for financial transactions within the application.
 * This model stores all user transaction data including regular purchases,
 * income, transfers, and recurring transactions.
 * 
 * The model supports:
 * - One-time and recurring transactions
 * - Categorization of transactions
 * - Multiple currencies
 * - Transaction sources (bank imports, manual entry)
 * - Original and modified descriptions for better readability
 * 
 * Relationships:
 * - Belongs to a User (userId)
 * - Belongs to a Category (categoryId)
 */
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('transaction', {
    // Unique identifier for each transaction
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,  // Auto-generate UUID v4
      primaryKey: true
    },
    // Date when the transaction occurred
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // Transaction amount - supports 2 decimal places with up to 10 digits
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    // User-friendly description of the transaction
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Store of merchant/vendor where transaction occurred
    merchant: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Transaction currency code - defaults to USD
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    // Whether this is an expense (true) or income (false)
    isExpense: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Original description from bank statement before any cleanup
    originalDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Where the transaction data came from (e.g., 'Chase', 'Manual', 'CSV import')
    source: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Bank name or import source'
    },
    // Additional user notes about the transaction
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Reference to the owner of this transaction
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Optional reference to a category for this transaction
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    // Flag indicating if this is a recurring transaction
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // How often this recurring transaction repeats
    recurringFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'),
      allowNull: true
    },
    // How many times this recurring transaction should repeat (null = indefinite)
    recurringDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of occurrences for recurring transactions'
    },
    // Date when the recurring transaction should stop
    recurringEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true  // Enables createdAt and updatedAt fields
  });

  return Transaction;
};
