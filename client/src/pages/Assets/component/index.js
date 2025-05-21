/**
 * Asset Components
 * 
 * This is a legacy file that redirects to the new component organization.
 * New code should import directly from AssetsList/component or AssetDetail/component.
 */

// Re-export from the specific component folders
export { AssetsList, AssetsStats, AssetsTabs } from '../../AssetsList/component';
export { 
  AssetMetrics, 
  AssetTransactions, 
  AssetDetailHeader, 
  AssetDetails, 
  AssetValueHistory, 
  AssetEditDialog, 
  AssetTransactionDialog 
} from '../../AssetDetail/component';
export { default as AddAssetDialog } from './AddAssetDialog';
export { default as NetWorthChart } from './NetWorthChart';
export { default as PortfolioPerformance } from './PortfolioPerformance';
export { default as AssetAllocationChart } from './AssetAllocationChart';
