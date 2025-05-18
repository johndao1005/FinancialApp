const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all goals
router.get('/', goalController.getGoals);

// Get a single goal
router.get('/:id', goalController.getGoal);

// Create a new goal
router.post('/', goalController.createGoal);

// Update a goal
router.put('/:id', goalController.updateGoal);

// Delete a goal
router.delete('/:id', goalController.deleteGoal);

// Add a contribution to a goal
router.post('/:id/contributions', goalController.addContribution);

// Delete a contribution
router.delete('/:id/contributions/:contributionId', goalController.deleteContribution);

module.exports = router;
