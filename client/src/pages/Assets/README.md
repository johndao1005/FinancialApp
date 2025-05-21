# Asset Pages Component Organization

This directory contains components specific to the Assets pages, organized as follows:

## Component Structure

- `AssetsList` - The main Assets list page components
- `AssetDetail` - The individual asset detail page components
- `Dashboard/component/AssetSummary.js` - Asset summary component for the dashboard

## Reorganized Components

As part of the code refactoring:

1. Component-specific functions were moved from utils files into their respective components
2. Non-reusable components were relocated from the main components directory to their appropriate screen components
3. Previously, asset components were stored in `src/components/Assets/` but have been reorganized to follow a feature-based organization where components are placed with the pages they're used in.

## Import Guidelines

Always import components from their specific page directories, not from a generic components directory.
