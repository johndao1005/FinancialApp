/**
 * Income Prediction Routes
 * 
 * API routes for income prediction and trend analysis
 * - GET /api/income/predictions - Get income predictions
 * - POST /api/income/predictions - Generate new predictions
 * - GET /api/income/trends - Get income trend analysis
 * - GET /api/income/sources - Get income sources
 * - PUT /api/income/predictions/:id/actual - Update prediction with actual data
 */
const router = require('express').Router();
const incomePredictionController = require('../controllers/incomePrediction.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Income prediction routes
router.get('/predictions', incomePredictionController.getIncomePredictions);
router.post('/predictions', incomePredictionController.generateIncomePredictions);
router.put('/predictions/:predictionId/actual', incomePredictionController.updatePredictionActuals);

// Income trend analysis
router.get('/trends', incomePredictionController.getIncomeTrends);

// Income sources
router.get('/sources', incomePredictionController.getIncomeSources);

module.exports = router;
