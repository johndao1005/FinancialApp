const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const { seedCategories } = require('./utils/seed');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Using environment variable or default to 5000

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your React app
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const budgetRoutes = require('./routes/budget.routes');
const goalRoutes = require('./routes/goal.routes');
const userCategoryOverrideRoutes = require('./routes/userCategoryOverride.routes');
const incomePredictionRoutes = require('./routes/incomePrediction.routes');
const assetRoutes = require('./routes/asset.routes');
const assetTransactionRoutes = require('./routes/assetTransaction.routes');

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/category-overrides', userCategoryOverrideRoutes);
app.use('/api/income', incomePredictionRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/asset-transactions', assetTransactionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SmartSpend API' });
});

// Start server
async function startServer() {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    // Seed default categories
    await seedCategories();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();
