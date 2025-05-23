const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all categories
router.get('/', categoryController.getCategories);

// Get a single category
router.get('/:id', categoryController.getCategory);

// Create a new category
router.post('/', categoryController.createCategory);

// Update a category
router.put('/:id', categoryController.updateCategory);

// Delete a category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
