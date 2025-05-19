const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, baseCurrency, settings } = req.body;
    
    // Update user data
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (baseCurrency) updateData.baseCurrency = baseCurrency;
    
    // Additional settings stored in JSON field if available
    if (settings) {
      const user = await User.findByPk(req.user.id);
      if (user) {
        const currentSettings = user.settings || {};
        updateData.settings = JSON.stringify({
          ...currentSettings,
          ...settings
        });
      }
    }
    
    // Update user
    const [updated] = await User.update(
      updateData,
      { where: { id: req.user.id } }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get updated user data
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await User.update(
      { password: hashedPassword },
      { where: { id: req.user.id } }
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
