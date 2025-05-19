/**
 * Category Controller
 * 
 * Manages the API endpoints for transaction categories in the application.
 * Handles CRUD operations for both system default categories and user-defined
 * custom categories. Ensures proper access control so users can only access
 * default categories and their own custom categories.
 * 
 * Key features:
 * - Retrieval of available categories (both default and user-created)
 * - Creation of custom user categories
 * - Category update and deletion (with constraints)
 * - Category usage statistics
 */
const { Category } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all categories available to the user
 * 
 * @route GET /api/categories
 * @access Private - Requires authentication
 * @returns {Array} List of system default categories and user's custom categories
 */
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get default and user-created categories
    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { isDefault: true },     // System default categories available to all users
          { userId }               // User's custom categories
        ]
      },
      order: [['name', 'ASC']]     // Alphabetical ordering
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single category by ID
 * 
 * @route GET /api/categories/:id
 * @access Private - Requires authentication
 * @param {string} req.params.id - Category ID to retrieve
 * @returns {Object} Category details
 */
exports.getCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { isDefault: true },    // Either a system default category
          { userId }              // Or a category created by this user
        ]
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, icon, color, parentCategoryId } = req.body;
    
    // If parent category is provided, verify it exists
    if (parentCategoryId) {
      const parentCategory = await Category.findOne({
        where: {
          id: parentCategoryId,
          [Op.or]: [
            { isDefault: true },
            { userId }
          ]
        }
      });
      
      if (!parentCategory) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }
    
    const category = await Category.create({
      name,
      icon,
      color,
      parentCategoryId,
      userId,
      isDefault: false
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, icon, color, parentCategoryId } = req.body;
    
    // Find the category
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found or you do not have permission to edit it' });
    }
    
    // Check if it's a default category
    if (category.isDefault) {
      return res.status(403).json({ message: 'Default categories cannot be modified' });
    }
    
    // If parent category is provided, verify it exists
    if (parentCategoryId) {
      const parentCategory = await Category.findOne({
        where: {
          id: parentCategoryId,
          [Op.or]: [
            { isDefault: true },
            { userId }
          ]
        }
      });
      
      if (!parentCategory) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }
    
    // Update the category
    await category.update({
      name,
      icon,
      color,
      parentCategoryId
    });
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the category
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found or you do not have permission to delete it' });
    }
    
    // Check if it's a default category
    if (category.isDefault) {
      return res.status(403).json({ message: 'Default categories cannot be deleted' });
    }
    
    // Delete the category
    await category.destroy();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
