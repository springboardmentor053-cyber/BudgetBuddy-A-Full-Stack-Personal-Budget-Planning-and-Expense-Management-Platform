# 💰 BudgetBuddy

### A Full-Stack Personal Budget Planning and Expense Management Platform

BudgetBuddy is a full-stack personal finance management platform designed to help students manage pocket money, track daily expenses, manage income, create budgets, set savings goals, monitor spending habits, receive budget alerts, and generate financial reports.

The application provides a centralized dashboard with financial analytics and notifications to help users develop better financial awareness and money-management habits.

---

## 🚀 Key Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Protected API endpoints
- User-specific financial data
- Secure user data isolation

### 💸 Expense Management
- Add expenses
- Edit expenses
- Delete expenses
- Expense categorization
- Daily transaction history
- Automatic budget utilization calculation

### 💵 Income Management
- Add income
- Update income
- Delete income
- Pocket money tracking
- Scholarship income tracking
- Freelance income tracking

### 📊 Budget Planning
- Create monthly budgets
- Category-wise budget allocation
- Budget utilization tracking
- Remaining budget calculation
- Overspending detection

### 🚨 Budget Alerts & Notifications
BudgetBuddy provides threshold-based budget alerts:

| Threshold | Notification | Priority |
|-----------|--------------|----------|
| 80% | Budget Reached 80% | LOW |
| 90% | Budget Reached 90% | MEDIUM |
| 100%+ | Budget Exceeded Limit | HIGH |

Features:
- In-app notifications
- Global notification bell
- Real-time unread notification count
- Mark notification as read
- Mark all notifications as read
- Duplicate alert prevention
- SMTP email alerts
- Email alerts sent to the registered user's email address

### 🎯 Savings Goals
- Create savings goals
- Set target amounts
- Track saved amount
- Progress visualization
- Target date management
- Goal completion tracking
- Goal achievement notifications

### 📈 Analytics Dashboard
The dashboard provides:
- Total Income
- Total Expenses
- Current Balance
- Total Savings
- Total Budget
- Remaining Budget
- Category-wise spending
- Monthly expense trends
- Recent transactions
- Active savings goals
- Latest notifications

### 📑 Reports & Export

BudgetBuddy supports:

- JSON reports
- PDF reports
- Excel reports

#### PDF Report
Includes:
- Financial Summary
- Expense History
- Savings Goal Progress
- Recent Transactions

#### Excel Report
Contains multiple worksheets:
1. Financial Summary
2. Income
3. Expenses
4. Budgets
5. Savings Goals
6. Notifications

### 📧 Email Notifications
Budget alerts are delivered through Gmail SMTP.

Email notifications are triggered when:
- Budget reaches 80%
- Budget reaches 90%
- Budget reaches 100% or more

The email recipient is dynamically taken from the registered user's email address.

---

## 🏗️ System Architecture

```text
┌───────────────────────────┐
│       React Frontend      │
│                           │
│ Dashboard                │
│ Expenses                 │
│ Income                   │
│ Budgets                  │
│ Savings Goals            │
│ Notifications            │
│ Analytics                │
│ Reports                  │
└─────────────┬─────────────┘
              │
              │ REST API / JWT
              ▼
┌───────────────────────────┐
│      Django Backend       │
│                           │
│ Authentication           │
│ Expense Management       │
│ Income Management        │
│ Budget Management        │
│ Savings Goals            │
│ Notifications            │
│ Analytics                │
│ Reports & Export         │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│       Database            │
│                           │
│ SQLite - Development     │
│ PostgreSQL - Production  │
└───────────────────────────┘

              │
              ▼
┌───────────────────────────┐
│      External Services    │
│                           │
│ Gmail SMTP                │
│ Email Budget Alerts      │
└───────────────────────────┘
