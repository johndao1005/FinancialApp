/**
 * Asset Transaction Routes
 * 
 * Defines API endpoints for managing asset transactions:
 * - Record value changes and updates
 * - Track contributions, withdrawals, and sales
 * - Monitor historical performance
 */
const express = require('express');
const router = express.Router();
const assetTransactionController = require('../controllers/assetTransaction.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateAssetTransaction } = require('../middlewares/asset.validation');

// Apply authentication middleware to all asset transaction routes
router.use(authMiddleware);

// Transaction CRUD operations
router.post('/', validateAssetTransaction, assetTransactionController.createAssetTransaction);
router.get('/asset/:assetId', assetTransactionController.getAssetTransactions);
router.put('/:id', validateAssetTransaction, assetTransactionController.updateAssetTransaction);
router.delete('/:id', assetTransactionController.deleteAssetTransaction);

// Get historical asset value
router.get('/history/:assetId', assetTransactionController.getAssetHistory);

module.exports = router;
