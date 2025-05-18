const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GoalContribution = sequelize.define('GoalContribution', {
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    goalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Goals',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    transactionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Transactions',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  GoalContribution.associate = (models) => {
    GoalContribution.belongsTo(models.User, { foreignKey: 'userId' });
    GoalContribution.belongsTo(models.Goal, { foreignKey: 'goalId' });
    GoalContribution.belongsTo(models.Transaction, { foreignKey: 'transactionId' });
  };

  return GoalContribution;
};
