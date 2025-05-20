/**
 * Income Prediction Model
 * 
 * Stores predictions and historical income trend data for users.
 * This model helps track income trends, store prediction configurations,
 * and maintain historical accuracy metrics.
 * 
 * Relationships:
 * - Belongs to a User (userId)
 */
module.exports = (sequelize, DataTypes) => {
  const IncomePrediction = sequelize.define('incomePrediction', {
    // Unique identifier for each prediction record
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // Reference to the user this prediction belongs to
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Income category or source (e.g., 'Salary', 'Freelance', 'Investment')
    incomeSource: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Monthly predicted income amount
    predictedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    // Prediction confidence score (0-100%)
    confidenceScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    // Date when the prediction is applicable (typically future month)
    predictionForDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // Methodology used for prediction (e.g., 'average', 'linearRegression', 'seasonalAdjusted')
    predictionMethod: {
      type: DataTypes.STRING,
      defaultValue: 'average'
    },
    // Historical data used for this prediction (array of past months)
    historicalDataPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      comment: 'Number of past months used for prediction'
    },
    // Actual income recorded for this period (null until the period passes)
    actualAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    // Date when the actual amount was recorded
    actualRecordedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Accuracy of prediction (percentage difference between predicted and actual)
    accuracyPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Null until actual amount is recorded'
    },
    // Notes or metadata about this prediction
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'incomeSource', 'predictionForDate'],
        unique: true
      }
    ]
  });

  return IncomePrediction;
};
