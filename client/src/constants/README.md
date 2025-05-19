# Constants Folder

This folder contains centralized constants used throughout the FinancialApp application. Organizing constants in this way provides several advantages:

## Benefits

1. **Single Source of Truth**: All constants are defined in one place, making changes simple and consistent
2. **Maintainability**: Constants are grouped logically by feature/domain
3. **Code Reusability**: Prevents duplication of hardcoded values across components
4. **Type Safety**: Constants provide standardized values with descriptive names
5. **Easy Imports**: The index.js barrel file simplifies imports

## Structure

- **index.js**: Barrel file that re-exports all constants for easy importing
- **apiConstants.js**: API endpoint paths and related constants
- **appConstants.js**: Application-wide settings like supported currencies, languages
- **navConstants.js**: Navigation routes, paths, and menu structure
- **themeConstants.js**: UI design constants like colors, sizes, breakpoints
- **transactionConstants.js**: Transaction-related constants (types, status values)
- **budgetConstants.js**: Budget-related constants (periods, types, status)
- **goalConstants.js**: Goal-related constants (types, status, frequencies)

## Usage

Import constants from the centralized location:

```javascript
// Import all needed constants from a single import
import { 
  ROUTES, 
  API_ENDPOINTS, 
  PRIMARY_COLORS,
  TRANSACTION_TYPES 
} from '../constants';

// Use constants
<Route path={ROUTES.DASHBOARD.path} element={<Dashboard />} />
```

## Best Practices

1. Always use constants instead of hardcoded values when the value might:
   - Be used in multiple places
   - Change in the future
   - Benefit from a descriptive name

2. Organize constants by feature domain
3. Use clear, descriptive naming with uppercase for constants
4. Group related constants in objects (e.g., `ROUTES.DASHBOARD.path`)
5. Consider adding JSDoc comments for complex constants

## Adding New Constants

1. Identify which existing constants file is most appropriate for your new constant
2. If your constant doesn't fit in any existing file, create a new constants file
3. Export your new constant from the file
4. Add your new file to the exports in index.js (if you created a new file)
