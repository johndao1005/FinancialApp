const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Goal = sequelize.define('Goal', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    targetAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    type: {
      type: DataTypes.ENUM('saving', 'debt', 'investment', 'expense', 'other'),
      allowNull: false,
      defaultValue: 'saving'
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
      allowNull: false,
      defaultValue: 'in_progress'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#1677ff'
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  Goal.associate = (models) => {
    Goal.belongsTo(models.User, { foreignKey: 'userId' });
    Goal.belongsTo(models.Category, { foreignKey: 'categoryId' });
    Goal.hasMany(models.GoalContribution, { foreignKey: 'goalId', as: 'contributions' });
  };

  return Goal;
};
