/**
 * Asset Model Enhancement for Depreciation/Appreciation Tracking
 * 
 * This migration adds new fields to the Asset model to support
 * advanced depreciation and appreciation tracking features.
 */
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('assets', 'depreciationMethod', {
      type: DataTypes.ENUM('straight-line', 'double-declining', 'none'),
      defaultValue: 'none',
      comment: 'Depreciation calculation method for this asset'
    });
    
    await queryInterface.addColumn('assets', 'usefulLifeYears', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated useful life span in years (for depreciation)'
    });
    
    await queryInterface.addColumn('assets', 'salvageValue', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Estimated salvage/residual value at end of useful life'
    });
    
    await queryInterface.addColumn('assets', 'appreciationType', {
      type: DataTypes.ENUM('compound', 'linear', 'none'),
      defaultValue: 'none',
      comment: 'Type of appreciation calculation for this asset'
    });
    
    await queryInterface.addColumn('assets', 'valuationMethod', {
      type: DataTypes.ENUM('manual', 'scheduled', 'automatic'),
      defaultValue: 'manual',
      comment: 'Method used to update asset valuation'
    });
    
    await queryInterface.addColumn('assets', 'nextValuationDate', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Scheduled date for next valuation update'
    });
    
    // Update the attributes JSON field to include depreciation/appreciation data
    // for existing assets
    const assets = await queryInterface.sequelize.query(
      `SELECT id, "assetType", "initialValue", "currentValue", "acquisitionDate", "annualRateOfReturn", attributes 
       FROM assets`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    for (const asset of assets) {
      let attributes = asset.attributes || {};
      const assetType = asset.assetType;
      
      // Set default values based on asset type
      if (assetType === 'property') {
        // Properties typically appreciate
        await queryInterface.sequelize.query(
          `UPDATE assets SET 
           "appreciationType" = 'compound', 
           "valuationMethod" = 'scheduled',
           "nextValuationDate" = NOW() + INTERVAL '3 months'
           WHERE id = :id`,
          { 
            replacements: { id: asset.id },
            type: queryInterface.sequelize.QueryTypes.UPDATE 
          }
        );
      } 
      else if (assetType === 'stock' || assetType === 'crypto') {
        // Investments typically have market-based valuation
        await queryInterface.sequelize.query(
          `UPDATE assets SET 
           "appreciationType" = 'compound', 
           "valuationMethod" = 'automatic'
           WHERE id = :id`,
          { 
            replacements: { id: asset.id },
            type: queryInterface.sequelize.QueryTypes.UPDATE 
          }
        );
      }
      else if (assetType === 'term_deposit') {
        // Term deposits typically have fixed returns
        await queryInterface.sequelize.query(
          `UPDATE assets SET 
           "appreciationType" = 'linear', 
           "valuationMethod" = 'scheduled',
           "nextValuationDate" = NOW() + INTERVAL '1 month'
           WHERE id = :id`,
          { 
            replacements: { id: asset.id },
            type: queryInterface.sequelize.QueryTypes.UPDATE 
          }
        );
      }
      else {
        // Other assets may depreciate
        if (asset.currentValue < asset.initialValue) {
          // If current value is less than initial, it's likely depreciating
          const acquisitionDate = new Date(asset.acquisitionDate);
          const now = new Date();
          const yearsHeld = (now - acquisitionDate) / (1000 * 60 * 60 * 24 * 365);
          
          if (yearsHeld > 0) {
            // Estimate useful life based on current depreciation rate
            const currentDepreciation = (asset.initialValue - asset.currentValue) / asset.initialValue;
            const annualRate = currentDepreciation / yearsHeld;
            const estimatedUsefulLife = Math.round(1 / annualRate);
            const estimatedSalvage = asset.initialValue * 0.1; // 10% of initial value
            
            await queryInterface.sequelize.query(
              `UPDATE assets SET 
               "depreciationMethod" = 'straight-line', 
               "usefulLifeYears" = :usefulLife,
               "salvageValue" = :salvageValue
               WHERE id = :id`,
              { 
                replacements: { 
                  id: asset.id,
                  usefulLife: Math.min(Math.max(estimatedUsefulLife, 3), 30), // Between 3 and 30 years
                  salvageValue: estimatedSalvage
                },
                type: queryInterface.sequelize.QueryTypes.UPDATE 
              }
            );
          }
        }
      }
    }
    
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('assets', 'depreciationMethod');
    await queryInterface.removeColumn('assets', 'usefulLifeYears');
    await queryInterface.removeColumn('assets', 'salvageValue');
    await queryInterface.removeColumn('assets', 'appreciationType');
    await queryInterface.removeColumn('assets', 'valuationMethod');
    await queryInterface.removeColumn('assets', 'nextValuationDate');
    
    return Promise.resolve();
  }
};
