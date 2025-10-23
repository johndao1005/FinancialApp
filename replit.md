# FinanceFlow - Smart Financial Management App

## Overview
FinanceFlow is a comprehensive financial management application that helps users track their income, expenses, investments, budgets, and financial goals. It features an AI-powered financial assistant for personalized advice.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: In-memory storage (MemStorage)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Charts**: Recharts

## Project Structure

### Frontend Pages
- **Dashboard** (`/`) - Overview of financial health with key metrics and charts
- **Transactions** (`/transactions`) - Track income and expenses with categorization
- **Investments** (`/investments`) - Monitor investment portfolio and performance
- **AI Assistant** (`/assistant`) - Chat with AI for financial advice
- **Budget & Goals** (`/budget-goals`) - Manage budgets and track financial goals

### Data Models
- **Transactions**: Income and expense tracking with categories
- **Investments**: Portfolio tracking with gains/losses
- **Budgets**: Category-based spending limits
- **Goals**: Financial goal tracking with progress
- **AI Messages**: Chat history with AI assistant

### Key Features
- Real-time financial metrics dashboard
- Transaction categorization (income/expense)
- Investment portfolio tracking with ROI
- AI-powered financial advice (OpenAI integration)
- Budget monitoring with alerts
- Financial goal tracking with progress visualization
- Interactive charts and data visualization
- Dark/Light theme support
- Responsive design

## API Endpoints

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction

### Investments
- `GET /api/investments` - List all investments
- `POST /api/investments` - Add new investment

### Budgets
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create new budget

### Goals
- `GET /api/goals` - List all financial goals
- `POST /api/goals` - Create new goal
- `PATCH /api/goals/:id` - Update goal progress

### AI Assistant
- `GET /api/ai/messages` - Get chat history
- `POST /api/ai/chat` - Send message to AI assistant

## Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for AI assistant (optional)
- `SESSION_SECRET` - Session secret for authentication

## Development
The app runs on port 5000 with hot-reload enabled. The backend API and frontend are served from the same Express server.

## Design System
Follows Material Design-inspired principles with:
- Professional color palette (trustworthy blue primary)
- Financial-specific colors (green for income/gains, red for expenses/losses)
- Consistent spacing and typography
- Accessible contrast ratios
- Smooth animations and interactions

## Recent Changes
- Initial project setup with all core features
- Complete frontend implementation with 5 pages
- Data models and API structure defined
- Dark mode support added
- Responsive sidebar navigation implemented
