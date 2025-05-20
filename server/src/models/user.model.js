/**
 * User Model
 * 
 * Defines the database schema for application users.
 * This model stores user account information, authentication details,
 * and user preferences. It serves as the central entity that ties
 * together all user-specific data in the application.
 * 
 * Features:
 * - Basic user profile information
 * - Authentication credentials
 * - Currency preferences
 * - Account status tracking
 * - Premium features flag
 * 
 * Relationships:
 * - Has many Transactions
 * - Has many Categories (custom categories)
 * - Has many Budgets
 * - Has many Goals
 */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    // Unique identifier for each user
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // User's first name
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // User's last name
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },    // User's email address - used for login and notifications
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'This email is already registered'
      },
      validate: {
        isEmail: {
          msg: 'Please enter a valid email address'
        }
      }
    },
    // Hashed password for authentication
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Default currency for displaying monetary values
    baseCurrency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    // Whether the account is active or disabled
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Whether user has premium subscription
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // User settings stored as JSON string
    settings: {
      type: DataTypes.TEXT,
      get() {
        const value = this.getDataValue('settings');
        return value ? JSON.parse(value) : {};
      },
      set(value) {
        this.setDataValue('settings', JSON.stringify(value));
      }
    }
  }, {
    timestamps: true  // Enables createdAt and updatedAt fields
  });

  return User;
};
