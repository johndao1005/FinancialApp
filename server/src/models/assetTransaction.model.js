/**
 * Asset Transaction Model
 * 
 * Tracks changes to asset values over time. This includes:
 * - Value updates (appreciation/depreciation)
 * - Partial sales or acquisitions
 * - Investment contributions or withdrawals
 * - Dividend or interest payments
 * 
 * This model helps maintain a historical record of asset value changes
 * and provides data for performance analysis.
 * 
 * Relationships:
 * - Belongs to a User (userId)
 * - Belongs to an Asset (assetId)
 */
module.exports = (sequelize, DataTypes) => {
  const AssetTransaction = sequelize.define('assetTransaction', {
    // Unique identifier for each asset transaction
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    // Reference to the asset this transaction relates to
    assetId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      }
    },
    // Date when the transaction occurred
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // Type of asset transaction
    transactionType: {
      type: DataTypes.ENUM(
        'valuation_update',    // Regular update to estimated value
        'purchase',            // Initial or additional acquisition
        'sale',                // Full or partial sale
        'dividend',            // Dividend payment
        'interest',            // Interest earned
        'contribution',        // Additional investment
        'withdrawal',          // Removal of funds
        'split',               // Stock split
        'fee'                  // Management or maintenance fee
      ),
      allowNull: false
    },
    // Amount of the transaction
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Positive for additions, negative for deductions'
    },
    // Quantity affected (if applicable, e.g., number of shares)
    quantity: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      comment: 'Quantity of units affected by this transaction'
    },
    // Transaction price per unit (if applicable)
    pricePerUnit: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      comment: 'Price per unit for this transaction'
    },
    // Value of the asset after this transaction
    valueAfterTransaction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Total asset value after this transaction'
    },
    // Currency of the transaction
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    // Notes or description of the transaction
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Related document (e.g., receipt, statement)
    documentReference: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference to a related document or receipt'
    },
    // Additional metadata stored as JSON
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional transaction details specific to asset type'
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['assetId', 'date']
      },
      {
        fields: ['userId', 'date']
      },
      {
        fields: ['assetId', 'transactionType']
      }
    ]
  });

  return AssetTransaction;
};
