const { Category } = require('../models');
const { Op } = require('sequelize');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get default and user-created categories
    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { isDefault: true },
          { userId }
        ]
      },
      order: [['name', 'ASC']]
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single category
exports.getCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { isDefault: true },
          { userId }
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
