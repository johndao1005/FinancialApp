# SmartSpend - Personal Finance Tracker

SmartSpend helps users **track, categorize, and understand their spending habits** by importing bank statements and visualizing financial trends over time. Designed to simplify personal finance management, this app reduces the need for manual budgeting and provides users with a clear picture of where their money goes.

![SmartSpend Logo](client/public/logo192.png)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [UI Components](#ui-components)
- [Development Status](#development-status)
- [Future Improvements](#future-improvements)

## Overview

SmartSpend is a comprehensive personal finance management application that allows users to:
- Track expenses and income across multiple accounts
- Import transactions from bank statement CSV files
- Categorize transactions automatically
- View interactive charts and analytics on spending patterns
- Set budget goals and track progress

Many people struggle to budget or monitor their expenses due to:
- Inconsistent banking interfaces
- Lack of automated categorization
- No centralized view across accounts

**SmartSpend addresses this by offering:**

* Unified transaction tracking
* Automated expense classification
* Visual insights for smarter financial decisions

This type of app is valuable for:

* **Young professionals** trying to manage monthly budgets
* **Freelancers/contractors** with multiple income sources
* **Households** wanting to visualize group expenses
* **Small financial advisory firms** looking to offer clients spending dashboards

---

## 🔧 Key Features

| Feature                            | Description                                                              |
| ---------------------------------- | ------------------------------------------------------------------------ |
| 📥 Bank Statement Import           | CSV or OFX upload support; handles multiple bank formats                 |
| 🏷️ Automated Categorization       | Categorize expenses using a Python engine with customizable rules        |
| 📊 Interactive Dashboards          | Recharts-powered visualizations for monthly trends, top categories, etc. |
| 💰 Budget Management               | Create and track category-specific and overall budget limits             |
| 🎯 Financial Goals                 | Set saving, debt, investment and other financial goals with tracking     |
| 🔐 Secure User Management          | Login, encrypted data storage, token-based sessions                      |
| 💱 Multi-Currency Support (Future) | Convert transactions into base currency                                  |
| 🧠 Learning Engine (Future)        | Learns from user overrides and improves classification accuracy          |

---

## 🏗️ System Architecture

```
[ React Frontend ]
  |
  --> [ Redux Store ]
  |
  --> [ Node.js API (Express) ]
          |
    +-----+----------------------------+
    | PostgreSQL DB (Dockerized)      |
    | Python Categorization Service   |
    +---------------------------------+
```

* **Frontend**: React with Redux to manage user input and display charts (via Recharts)
* **Backend**: Node.js/Express API handles user auth, file upload, data CRUD
* **Database**: PostgreSQL to store users, transactions, and category rules
* **Python Module**: Pandas-based service (initially Tkinter prototype) to process CSV and apply classification rules
* **Containerized via Docker** for easy deployment and local dev parity

---

## 🚀 Implementation Roadmap

### 📍 Phase 1: Foundation Setup (MVP)

* Set up monorepo with Dockerized backend and frontend containers
* Build user registration/login with hashed passwords (JWT or session)
* Create UI for uploading bank statements (.csv)
* Store transactions in PostgreSQL and parse metadata

### 🔨 Phase 2: Categorization & Analytics

* Integrate Python module for expense categorization (via REST or child process)
* Design Redux store for storing categorized transactions
* Build dashboard UI: pie chart (category distribution), line chart (monthly spend), top merchants
* Enable basic filtering by date range, category, etc.

### 🧪 Phase 3: Feedback Loop & UX Polish

* Allow users to **reassign incorrect categories**
* Store user preferences to improve future predictions
* Add validation, error messages, and success toasts
* Export data to CSV for user backup

### 📈 Phase 4: Premium Feature Integration (Business Tier)

* OAuth-based **bank account connection** (via Plaid or TrueLayer API)
* Create "Smart Categorization Rules" (e.g., if merchant = Uber, category = Transport)
* Add **budget planning module** (set monthly limits per category)
* Enable **multi-currency conversion** with exchange rate API

### 🏦 Phase 5: Go-Live & Monetization

* Deploy using Docker + PostgreSQL on Render, Railway, or AWS ECS
* Add billing via Stripe for premium features
* Offer self-hosted version for financial coaches or consultants

---

## 💡 Future Enhancements & Business Models

| Feature / Direction                 | Description                                                                |
| ----------------------------------- | -------------------------------------------------------------------------- |
| 🔄 AI Learning Loop                 | Use user corrections to fine-tune ML model for expense prediction          |
| 📱 Mobile App                       | React Native version for on-the-go tracking                                |
| 🏢 White-label Solution             | Offer to small financial advisors or budgeting coaches as a private portal |
| 🛒 Marketplace for Budget Templates | Allow community-created budget templates to be reused                      |
| 💳 Credit Score Monitoring (API)    | Integrate with credit reporting services for full financial picture        |

---

## 💵 Monetization Model

| Plan                | Features                                                          |
| ------------------- | ----------------------------------------------------------------- |
| Free                | Manual upload, categorization, dashboards                         |
| Premium (\$5–10/mo) | Smart rules, multi-account sync, bank integration, multi-currency |
| Business            | White-label option, team dashboards, export tools                 |

---

## 🎯 Summary

SmartSpend combines practical financial tools with clean UX and powerful data analytics. With React, Redux, PostgreSQL, and Python as the foundation, it’s perfect both as:

* A **portfolio project** demonstrating full-stack proficiency
* A **foundation for a real SaaS** business in the personal finance space

Would you like a **starter repo layout**, **UI mockups**, or a **pitch deck** next?

## Project Progress

### Current Status: Phase 2 - Budget Management and Financial Goals (Completed)

The SmartSpend project has successfully completed Phase 2 implementation, adding significant new functionality to help users manage their finances more effectively.

#### Phase 1 Achievements (Completed)

1. **Project Structure**
   - Monorepo setup with client and server folders
   - Docker containerization for development environment
   - CI/CD workflow with GitHub Actions

2. **Backend Progress**
   - Express server with RESTful API structure
   - User authentication with JWT token-based security
   - Transaction management endpoints with filtering and pagination
   - PostgreSQL database models with proper relationships
   - Python script for CSV parsing and intelligent transaction categorization

3. **Frontend Progress**
   - React application with React Router for navigation
   - Redux store with comprehensive state management slices
   - Form validation and error handling
   - Protected routes for authenticated users
   - Responsive UI components with clean CSS styling

#### Phase 2 Achievements (Completed)

1. **Budget Management**
   - Created comprehensive budget model with support for different time periods (daily, weekly, monthly, yearly, custom)
   - Implemented budget controller with full CRUD operations
   - Added budget progress tracking functionality
   - Developed intuitive UI for budget creation and monitoring
   - Integrated category-specific budgeting to track spending by category
   - Added visual progress indicators showing budget utilization
   - Implemented budget filtering and search capabilities

2. **Financial Goals**
   - Created goal model with support for different goal types (saving, debt, investment, expense, other)
   - Implemented goal contribution tracking system
   - Developed UI for goal creation, editing, and monitoring
   - Added progress visualization with completion percentage and timeline
   - Implemented contribution management with add/delete functionality
   - Created goal status tracking (in progress, completed, abandoned)
   - Added target date projections based on contribution history

3. **Backend Enhancements**
   - Added new models: `Budget`, `Goal`, and `GoalContribution`
   - Created controllers with comprehensive business logic for budget and goal management
   - Implemented API endpoints for budget progress tracking
   - Added contribution management for financial goals
   - Updated database relationships to support new features

4. **Frontend Improvements**
   - Added new Redux slices for budget and goal state management
   - Created dedicated pages for Budget and Goal management
   - Implemented data visualization with Progress components
   - Added form validation for budget and goal creation/editing
   - Updated navigation to include new features
   - Implemented responsive layouts for all new components

#### Current Work in Progress: Phase 3 Implementation

1. **Enhanced Reporting**
   - Improving data visualization with more chart types
   - Adding time-based filtering options
   - Developing comparative analysis tools

2. **Multiple Account Support**
   - Adding account models and management functionality
   - Implementing UI for multi-account dashboards

3. **Machine Learning Improvements**
   - Refining transaction categorization accuracy
   - Implementing spending pattern detection
   - Adding anomaly detection for unusual transactions

## Tech Stack

### Frontend

- **React**: UI library for building the user interface
- **Redux Toolkit**: State management
- **Ant Design (antd)**: UI component library for a modern look and feel
- **Recharts**: Data visualization library for charts and graphs
- **Axios**: HTTP client for API requests

### Backend

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Sequelize**: ORM for database interactions
- **SQLite**: Database (for development)
- **PostgreSQL**: Database (for production)
- **JWT**: Authentication mechanism
- **Python**: Used for data processing and ML-based categorization

## Development Status

### Current Status: Phase 2 Completed, Moving to Phase 3

#### Recently Completed Phase 2 Implementations

1. **Backend API Enhancements**
   - Added missing logout function to auth controller
   - Implemented Category controller with full CRUD operations
   - Created Category routes for API endpoints
   - Fixed model relationships for user-created categories and subcategories
   - Added default categories seeding functionality
   - Changed server port from 5000 to 5001 to avoid conflicts
   - Configured CORS properly to allow client requests

2. **Frontend Improvements**
   - Configured axios utility for centralized API request handling
   - Fixed token handling in all Redux slices
   - Updated Redux slices to use the configured axios instance
   - Updated API request endpoints to match backend changes

3. **Database Changes**
   - Fixed field definitions in models (userId in Category, userId and categoryId in Transaction)
   - Installed SQLite for database development

4. **Phase 2 Implementation Achievements**
   - Created budget and goal models with comprehensive fields and relationships
   - Implemented controllers for budget and goal management with full CRUD operations
   - Added API endpoints for budget and goal tracking
   - Created Redux slices for budget and goal state management
   - Developed UI components for budget and goal visualization
   - Implemented contribution tracking for financial goals
   - Added progress indicators for budget utilization

#### Current Work in Progress: Phase 3 Implementation

1. **Enhanced Reporting**
   - Improving data visualization with more chart types
   - Adding time-based filtering options
   - Developing comparative analysis tools

2. **Multiple Account Support**
   - Adding account models and management functionality
   - Implementing UI for multi-account dashboards

3. **Machine Learning Improvements**
   - Refining transaction categorization accuracy
   - Implementing spending pattern detection
   - Adding anomaly detection for unusual transactions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Python 3.8+ (for ML categorization)
- Git

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/FinancialApp.git
cd FinancialApp
```

#### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

#### 3. Set up environment variables

Create a `.env` file in the server directory:

```bash
# server/.env
PORT=5001
JWT_SECRET=your_jwt_secret_key
DB_PATH=./database.sqlite
NODE_ENV=development
```

#### 4. Seed the database

```bash
cd server
npm run seed
```

#### 5. Start the application

```bash
# Start both client and server using concurrently
npm run dev

# Or start them separately
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm start
```

The client will run on `http://localhost:3000` and the server on `http://localhost:5001`.

### Using Docker (Optional)

If you prefer using Docker, you can use the provided Docker configuration:

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down
```

## API Documentation

The backend provides the following RESTful API endpoints:

### Authentication API

| Method | Endpoint             | Description                        | Request Body                               | Response                          |
|--------|----------------------|------------------------------------|-------------------------------------------|-----------------------------------|
| POST   | /api/auth/register   | Register a new user                | `{name, email, password}`                  | `{token, user}`                   |
| POST   | /api/auth/login      | Login with existing credentials    | `{email, password}`                        | `{token, user}`                   |
| POST   | /api/auth/logout     | Logout the current user            | None                                       | `{message: 'Logout successful'}`  |
| GET    | /api/auth/user       | Get the authenticated user data    | None (requires auth token)                 | `{user}`                          |

### Transactions API

| Method | Endpoint                      | Description                           | Request Body / Params                      | Response                          |
|--------|-------------------------------|---------------------------------------|-------------------------------------------|-----------------------------------|
| GET    | /api/transactions             | Get all user transactions             | Query params: `limit`, `offset`, `sortBy`  | `{transactions, count}`           |
| GET    | /api/transactions/:id         | Get a specific transaction            | URL param: `id`                            | `{transaction}`                   |
| POST   | /api/transactions             | Create a new transaction              | `{amount, description, date, categoryId}`  | `{transaction}`                   |
| PUT    | /api/transactions/:id         | Update an existing transaction        | `{amount, description, date, categoryId}`  | `{transaction}`                   |
| DELETE | /api/transactions/:id         | Delete a transaction                  | URL param: `id`                            | `{message: 'Transaction deleted'}`|

### Categories API

| Method | Endpoint                     | Description                           | Request Body / Params                      | Response                          |
|--------|------------------------------|---------------------------------------|-------------------------------------------|-----------------------------------|
| GET    | /api/categories              | Get all categories                    | None (requires auth token)                 | `{categories}`                    |
| GET    | /api/categories/:id          | Get a specific category               | URL param: `id`                            | `{category}`                      |
| POST   | /api/categories              | Create a new category                 | `{name, icon, color}`                      | `{category}`                      |
| PUT    | /api/categories/:id          | Update an existing category           | `{name, icon, color}`                      | `{category}`                      |
| DELETE | /api/categories/:id          | Delete a category                     | URL param: `id`                            | `{message: 'Category deleted'}`   |

### User API

| Method | Endpoint                  | Description                          | Request Body / Params                       | Response                         |
|--------|---------------------------|--------------------------------------|-------------------------------------------|----------------------------------|
| GET    | /api/users/profile        | Get user profile                     | None (requires auth token)                 | `{user}`                         |
| PUT    | /api/users/profile        | Update user profile                  | `{name, email, ...profileData}`            | `{user}`                         |
| PUT    | /api/users/password       | Change user password                 | `{currentPassword, newPassword}`           | `{message: 'Password updated'}`  |

### Budget API

| Method | Endpoint                  | Description                          | Request Body / Params                      | Response                         |
|--------|---------------------------|--------------------------------------|-------------------------------------------|----------------------------------|
| GET    | /api/budgets              | Get all budgets                      | None (requires auth token)                 | `{budgets}`                      |
| GET    | /api/budgets/:id          | Get a specific budget                | URL param: `id`                            | `{budget}`                       |
| GET    | /api/budgets/:id/progress | Get budget spending progress         | URL param: `id`                            | `{progress, total, percentage}`  |
| POST   | /api/budgets              | Create a new budget                  | `{name, amount, period, categoryId}`       | `{budget}`                       |
| PUT    | /api/budgets/:id          | Update an existing budget            | `{name, amount, period, categoryId}`       | `{budget}`                       |
| DELETE | /api/budgets/:id          | Delete a budget                      | URL param: `id`                            | `{message: 'Budget deleted'}`    |

### Goals API

| Method | Endpoint                           | Description                           | Request Body / Params                      | Response                          |
|--------|-----------------------------------|---------------------------------------|-------------------------------------------|-----------------------------------|
| GET    | /api/goals                        | Get all goals                         | None (requires auth token)                 | `{goals}`                         |
| GET    | /api/goals/:id                    | Get a specific goal                   | URL param: `id`                            | `{goal}`                          |
| POST   | /api/goals                        | Create a new goal                     | `{name, targetAmount, type, targetDate}`   | `{goal}`                          |
| PUT    | /api/goals/:id                    | Update an existing goal               | `{name, targetAmount, type, targetDate}`   | `{goal}`                          |
| DELETE | /api/goals/:id                    | Delete a goal                         | URL param: `id`                            | `{message: 'Goal deleted'}`       |
| POST   | /api/goals/:id/contributions      | Add a contribution to a goal          | `{amount, date, notes}`                    | `{contribution}`                  |
| DELETE | /api/goals/:id/contributions/:cId | Delete a contribution                 | URL params: `id`, `contributionId`         | `{message: 'Contribution deleted'}` |

## UI Components

The frontend utilizes Ant Design (antd) components to create a modern and responsive user interface. Key UI components include:

### Authentication Pages

- **Login**: Allows users to authenticate with their email and password
- **Register**: Enables new users to create an account

### Dashboard Components

- **Summary Cards**: Display key financial metrics (income, expenses, balance)
- **Transaction Chart**: Visualizes spending patterns over time
- **Category Distribution**: Pie chart showing spending by category
- **Recent Transactions**: List of most recent financial activities

### Transaction Management

- **Transaction List**: Interactive table with filtering and sorting
- **Transaction Form**: Modal for adding and editing transaction details
- **CSV Import**: Tool for importing transactions from bank statements

### Category Management

- **Category List**: View and manage expense categories
- **Category Form**: Create and edit categories with color coding and icons

### Budget Management

- **Budget Dashboard**: Overview of all active budgets with progress indicators
- **Budget Form**: Create and edit budgets with category selection and period options
- **Budget Progress**: Visual representation of spending against budget limits
- **Budget Filtering**: Filter budgets by category, time period, or status

### Goal Management

- **Goal Dashboard**: Visual overview of financial goals with progress tracking
- **Goal Form**: Create and edit goals with target amounts and dates
- **Contribution Management**: Add and track contributions towards goals
- **Goal Timeline**: Projected completion dates based on contribution history

## Phase 2 Implementation - Completed

The following key features from Phase 2 have been successfully implemented:

### 1. Budget Management System ✅

- **Budget Creation**: Users can now set monthly or custom period budgets
- **Category Budgets**: Spending limits can be set for specific categories
- **Budget Tracking**: Visual progress bars show budget usage in real-time
- **Budget Periods**: Support for daily, weekly, monthly, yearly, and custom budget periods

### 2. Financial Goals Tracking ✅

- **Goal Setting**: Users can create short and long-term financial goals
- **Goal Categories**: Support for saving, debt reduction, investment, and expense goals
- **Progress Tracking**: Visual representation of progress towards goals
- **Contribution Management**: Track individual contributions towards goals
- **Timeline Projections**: Calculate estimated completion dates based on contribution history

## Upcoming Phase 3 Features

### 1. Enhanced Reporting and Analytics

- **Custom Date Ranges**: View financial data across any time period
- **Comparative Analysis**: Compare spending between different periods
- **Spending Insights**: AI-generated observations about spending patterns
- **Export Options**: Generate PDF reports and spreadsheet exports

### 2. Multiple Account Management

- **Account Creation**: Add and manage multiple financial accounts
- **Account Types**: Checking, savings, credit cards, investments
- **Consolidated View**: See combined financial position across accounts
- **Account-specific Reporting**: Filter analysis by specific accounts

### 3. Machine Learning Enhancements

- **Advanced Categorization**: Improve accuracy of transaction categorization
- **Spending Prediction**: Forecast future expenses based on patterns
- **Anomaly Detection**: Identify unusual spending patterns
- **Personalized Recommendations**: Suggest budgeting improvements

## Contribution Guidelines

We welcome contributions to the SmartSpend project! Here's how you can contribute:

### 1. Fork the Repository

Start by forking the repository and then clone your fork:

```bash
git clone https://github.com/your-username/FinancialApp.git
cd FinancialApp
```

### 2. Create a Branch

Create a branch for your feature or bugfix:

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

Implement your changes, following these guidelines:

- Follow the existing code style
- Write clear, commented, and clean code
- Test your changes thoroughly

### 4. Commit and Push

Commit your changes with a descriptive message:

```bash
git commit -m "Add feature: your feature description"
git push origin feature/your-feature-name
```

### 5. Submit a Pull Request

Go to the original repository and submit a pull request from your feature branch to the main branch.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Contact

For questions or support, please reach out to the project maintainers or open an issue on GitHub.

---

Last updated: May 18, 2025
