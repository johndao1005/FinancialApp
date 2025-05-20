/**
 * AssetDetails Component
 * 
 * Displays detailed information about an asset.
 */
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider
} from '@mui/material';
import { getAssetTypeName } from '../../../constants/assetConstants';
import { formatDate } from '../utils/assetPageUtils';

const AssetDetails = ({ asset }) => {
  if (!asset) return null;

  // Get acquisition date in readable format
  const acquisitionDate = formatDate(asset.acquisitionDate, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Asset Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Asset Name
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {asset.name}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Asset Type
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {getAssetTypeName(asset.assetType)}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Acquisition Date
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {acquisitionDate}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Currency
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {asset.currency}
                </Typography>
              </Grid>
              
              {asset.quantity && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Quantity
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {parseFloat(asset.quantity).toLocaleString('en-US', {
                        maximumFractionDigits: 8
                      })}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {asset.symbol && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Symbol
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {asset.symbol}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {asset.location && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Location
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {asset.location}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {asset.isInvestment && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Annual Rate of Return
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {asset.annualRateOfReturn ? `${asset.annualRateOfReturn}%` : 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
            
            {!asset.isActive && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Sale Date
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {formatDate(asset.soldDate)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Sale Value
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      ${parseFloat(asset.saleValue).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body1">
                  {asset.notes || 'No notes available'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AssetDetails;
