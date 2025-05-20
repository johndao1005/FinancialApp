/**
 * Asset Model
 * 
 * Defines the database schema for assets owned by users.
 * This model stores various types of assets including property, stocks,
 * cryptocurrency, and term deposits.
 * 
 * The model supports:
 * - Multiple asset types (property, stocks, crypto, term deposits)
 * - Initial and current valuation
 * - Acquisition details
 * - Asset-specific attributes
 * 
 * Relationships:
 * - Belongs to a User (userId)
 * - Has many AssetTransactions (transactions tracking value changes)
 */
module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('asset', {
    // Unique identifier for each asset
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // Reference to the owner of this asset
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Name of the asset (e.g., "Primary Residence", "AAPL Shares", "Bitcoin")
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type of asset
    assetType: {
      type: DataTypes.ENUM('property', 'stock', 'crypto', 'term_deposit', 'other'),
      allowNull: false
    },
    // Initial purchase/acquisition value
    initialValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    // Current estimated value (updated periodically)
    currentValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    // Date when the asset was acquired
    acquisitionDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // Currency of the asset valuation
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    // Quantity or units owned (e.g., number of shares, crypto tokens)
    quantity: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      comment: 'Number of units owned (for applicable asset types)'
    },
    // Symbol or identifier (e.g., stock ticker, crypto symbol)
    symbol: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Ticker symbol or identifier for the asset'
    },
    // Location information (relevant for property)
    location: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Physical location or storage information'
    },
    // Notes about the asset
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Whether this is part of active investment portfolio
    isInvestment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indicates if this asset is part of investment portfolio'
    },
    // Annual appreciation/depreciation rate (if applicable)
    annualRateOfReturn: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Expected or historical annual rate of return as percentage'
    },
    // Asset-specific details stored as JSON
    attributes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional asset type-specific attributes'
    },
    // Whether the asset is liquidated/sold
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'False if asset has been sold or liquidated'
    },
    // Date when the asset was sold (if applicable)
    soldDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Final sale value (if sold)
    saleValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    // Date when current value was last updated
    lastValueUpdateDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'assetType']
      },
      {
        fields: ['userId', 'isActive']
      }
    ]
  });

  return Asset;
};
