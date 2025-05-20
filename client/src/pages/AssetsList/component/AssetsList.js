/**
 * AssetsList Component
 * 
 * This component renders the list of assets in the Assets page.
 * It's part of the component structure within the Assets page folder.
 */
import React from 'react';
import { Grid, Typography, Card, CardContent, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAssetTypeName, getTrendIcon } from '../../../constants/assetConstants';

const AssetsList = ({ assets, assetsByType, onAssetClick }) => {
  const navigate = useNavigate();

  const handleAssetClick = (assetId) => {
    if (onAssetClick) {
      onAssetClick(assetId);
    } else {
      navigate(`/assets/${assetId}`);
    }
  };

  // Group assets by type for display
  const renderAssetsByType = () => {
    return Object.entries(assetsByType || {}).map(([type, typeAssets]) => (
      <Box key={type} mb={3}>
        <Typography variant="h6" gutterBottom>
          {getAssetTypeName(type)}
        </Typography>
        <Grid container spacing={2}>
          {typeAssets.map(asset => (
            <Grid item xs={12} sm={6} md={4} key={asset.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 6,
                    transition: 'box-shadow 0.3s ease-in-out'
                  }
                }}
                onClick={() => handleAssetClick(asset.id)}
              >
                <CardContent>
                  <Typography variant="h6" component="div">
                    {asset.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {getAssetTypeName(asset.type)}
                  </Typography>
                  <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                      <Typography variant="body1" component="div">
                        ${parseFloat(asset.currentValue).toLocaleString('en-US', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </Typography>
                    </Grid>
                    <Grid item>
                      {getTrendIcon(asset.initialValue, asset.currentValue)}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    ));
  };

  return (
    <Box>
      {renderAssetsByType()}
    </Box>
  );
};

export default AssetsList;
