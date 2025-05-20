/**
 * Asset Routes
 * 
 * Defines API endpoints for managing assets:
 * - Create, read, update, delete operations for assets
 * - Net worth calculations
 * - Portfolio performance metrics
 */
const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateAsset } = require('../middlewares/asset.validation');

// Apply authentication middleware to all asset routes
router.use(authMiddleware);

// Asset CRUD operations
router.post('/', validateAsset, assetController.createAsset);
router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssetById);
router.put('/:id', validateAsset, assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

// Special endpoints for financial metrics
router.get('/user/net-worth', assetController.getNetWorth);
router.get('/user/portfolio-performance', assetController.getPortfolioPerformance);

module.exports = router;
