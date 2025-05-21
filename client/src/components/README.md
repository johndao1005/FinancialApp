# Components Directory

This directory contains reusable components that are used across multiple pages in the application.

## Recent Refactoring

All component files related to specific pages have been moved to their respective page directories:

- Asset-related components moved to:
  - `/pages/Assets/component/`
  - `/pages/AssetDetail/component/`
  - `/pages/Dashboard/component/`
  - `/pages/AssetsList/component/`

The `AssetNotifications.js` component remains in this directory as it is app-wide functionality used in App.js and not tied to a specific page.
