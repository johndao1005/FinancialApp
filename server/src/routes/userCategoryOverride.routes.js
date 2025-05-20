/**
 * UserCategoryOverride Routes
 * 
 * API routes for managing user category overrides:
 * - Creating, updating, and deleting override rules
 * - Applying rules to transactions
 * - Getting user's override rules
 * - Auto-generating rules from transaction patterns
 */
const express = require('express');
const router = express.Router();
const userCategoryOverrideController = require('../controllers/userCategoryOverride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new category override rule
router.post('/', userCategoryOverrideController.createCategoryOverride);

// Get all category overrides for a user
router.get('/', userCategoryOverrideController.getCategoryOverrides);

// Update a category override
router.put('/:id', userCategoryOverrideController.updateCategoryOverride);

// Delete a category override
router.delete('/:id', userCategoryOverrideController.deleteCategoryOverride);

// Apply category overrides to transactions
router.post('/apply', userCategoryOverrideController.applyCategoryOverrides);

// Create rules from transaction patterns
router.post('/generate-from-patterns', userCategoryOverrideController.createRulesFromPatterns);

module.exports = router;