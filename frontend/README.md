# ExpenseTracker

A full-stack expense tracking web application (frontend + backend) that helps users record and visualise income and expenses. The frontend is a React single-page app (JSX components + pages). The backend follows a simple controllers/models layout for handling expenses, income and dashboard logic.

## Features
- Record income and expenses
- Dashboard with visualisations and metrics
- Time-frame filtering for transactions
- Authentication UI components (Login / Signup) included in the frontend
- Sample testing data available in the backend

## Stack
- Language(s): JavaScript (frontend JSX + backend JS)
- Framework / runtime: React (frontend), Node.js-style backend (controllers + models)
- Notable files:
  - frontend/src/pages/* — Dashboard, Expense, Income, Profile (main app pages)
  - frontend/src/components/* — UI components like Add, GaugeCard, Layout, Login, Signup, Sidebar, Navbar, TransactionItem
  - backend/controllers/* — dashboardController.js, expenseController.js, incomeController.js
  - backend/models/* — expenseModel.js, incomeModel.js
  - backend/utils/dateFilter.js — utility for filtering by date
  - backend/testingDATA — sample/test data file
