# 📊 System Analysis

# BudgetBuddy – Personal Budget Planning & Expense Management Platform

## 1. Introduction

BudgetBuddy is a web-based application developed to simplify personal financial management. It enables users to securely register, log in, and manage their financial data through an intuitive interface. The application is built using Django REST Framework for the backend and React (Vite) for the frontend.

The primary goal of the project is to provide users with a centralized platform to securely manage income, expenses, and budgets while offering a responsive and user-friendly interface. The application now includes complete CRUD operations for Income, Expenses, and Budget Management, forming the core of a personal financial management system.

---

# 2. Problem Analysis

Many individuals still manage their finances manually using notebooks or spreadsheets. This approach often results in:

- Difficulty tracking daily expenses
- Poor budget planning
- Lack of financial insights
- Increased chances of calculation errors
- No centralized financial records

BudgetBuddy addresses these challenges by providing a secure digital platform for financial management.

---

# 3. Proposed Solution

BudgetBuddy offers a centralized system where users can:

- Create a secure account
- Log in using JWT authentication
- Access a dashboard
- Manage financial records
- View reports and analytics
- Track savings goals

BudgetBuddy now provides a complete financial management platform where authenticated users can securely manage their income, expenses, and monthly budgets. Users can perform Create, Read, Update, and Delete (CRUD) operations through a responsive React frontend integrated with Django REST APIs.

---

# 4. Functional Requirements

## User Authentication

- User Registration
- User Login
- JWT Authentication
- Secure Password Storage

---

## Dashboard

- Display user dashboard after successful login
- Future support for financial summaries and analytics

---

## Financial Modules

- Income Management
   - Add Income
   - View Income
   - Update Income
   - Delete Income
Expense Management
   - Add Expense
   - View Expenses
   - Update Expense
   - Delete Expense
Budget Management
   - Create Budget
   - View Budget
   - Update Budget
   - Delete Budget
Dashboard
   - User Dashboard
   - Quick Navigation
   - Authentication-based Access
- Savings Goals
- Notifications
- Reports

---

# 5. Non-Functional Requirements

## Security

- JWT Authentication
- Password Encryption
- Secure API Communication

## Performance

- Fast API responses
- Efficient database queries

## Scalability

- Modular Django applications
- Easy migration from SQLite to PostgreSQL

## Usability

- Responsive interface
- Simple navigation
- User-friendly design

---

# 6. System Architecture

```                 +---------------------------+
                    |      React Frontend       |
                    |        (Vite + React)     |
                    +---------------------------+
                               |
                               | HTTP / REST API
                               ▼
                    +---------------------------+
                    | Django REST Framework API |
                    +---------------------------+
                               |
                     JWT Authentication
                               |
                               ▼
                    +---------------------------+
                    |     PostgreSQL Database   |
                    +---------------------------+
```

---

# 7. Technology Stack

## Frontend

- React
- Vite
- HTML5
- CSS3
- JavaScript

## Backend

- Python
- Django
- Django REST Framework
- Simple JWT

## Database
- PostgerSql

## Development Tools

- Git
- GitHub
- Visual Studio Code
- Postman

---

# 8. Current Implementation (Milestone 1)

The following features have been completed:
The following features have been completed:

• Django project setup
• React frontend setup
• PostgreSQL database configuration
• JWT Authentication
• User Registration
• User Login
• Dashboard
• Expense CRUD
• Income CRUD
• Budget CRUD
• Django Admin
• REST APIs
• API Testing using Postman
• Responsive Sidebar Navigation

---

# 9. Modules Under Development

The following modules will be implemented in upcoming milestones:

-Savings Goal Management

-Reports & Analytics

-Notifications

-Profile Management

-Data Visualization

-PDF & Excel Export

---

# 10. Advantages of BudgetBuddy

- Secure authentication
- Easy-to-use interface
- Organized financial records
- Scalable architecture
- Modular backend
- RESTful API design
- Future-ready for analytics and reporting
-Complete CRUD functionality
-Secure JWT Authentication
-PostgreSQL Database Integration
-Responsive React User Interface
-RESTful API Architecture
-Easy Data Management
-Modular and Scalable Design

---

# 11. Future Enhancements

The application will be extended with:

-Interactive Charts and Graphs
-Monthly Financial Reports
-Budget Notifications
-Savings Goal Tracking
-PDF & Excel Report Export
-Email Notifications
-Cloud Deployment
-AI-based Spending Analysis
-Mobile Application

---

# 12. Conclusion
BudgetBuddy has successfully completed its second development milestone by implementing secure authentication along with complete CRUD functionality for Income, Expense, and Budget Management. The system is powered by Django REST Framework, PostgreSQL, and a React frontend, providing a secure, scalable, and user-friendly financial management platform. Future milestones will focus on advanced analytics, savings management, reporting, and intelligent financial insights.
