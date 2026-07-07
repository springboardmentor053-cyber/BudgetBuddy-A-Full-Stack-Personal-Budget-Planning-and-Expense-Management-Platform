# 📊 System Analysis

# BudgetBuddy – Personal Budget Planning & Expense Management Platform

## 1. Introduction

BudgetBuddy is a web-based application developed to simplify personal financial management. It enables users to securely register, log in, and manage their financial data through an intuitive interface. The application is built using Django REST Framework for the backend and React (Vite) for the frontend.

The primary goal of the project is to provide users with a centralized platform to monitor income, expenses, budgets, savings goals, and financial reports.

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

Milestone 1 establishes the project's foundation by implementing authentication, backend configuration, and frontend integration.

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

## Financial Modules (Planned)

- Income Management
- Expense Management
- Budget Management
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

```
+----------------------+
|   React Frontend     |
+----------------------+
           |
           | HTTP Requests
           ▼
+----------------------+
| Django REST API      |
+----------------------+
           |
           ▼
+----------------------+
| SQLite Database      |
+----------------------+
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

- SQLite / PostgerSql

## Development Tools

- Git
- GitHub
- Visual Studio Code
- Postman

---

# 8. Current Implementation (Milestone 1)

The following features have been completed:

- Project setup
- Django backend configuration
- React frontend setup
- SQLite database configuration
- JWT authentication
- User registration API
- User login API
- Dashboard page
- Django Admin configuration
- API testing with Postman

---

# 9. Modules Under Development

The following modules will be implemented in upcoming milestones:

- Income Management
- Expense Management
- Budget Management
- Savings Goals
- Reports & Analytics
- Notifications
- User Profile Management

---

# 10. Advantages of BudgetBuddy

- Secure authentication
- Easy-to-use interface
- Organized financial records
- Scalable architecture
- Modular backend
- RESTful API design
- Future-ready for analytics and reporting

---

# 11. Future Enhancements

The application will be extended with:

- Complete CRUD operations
- Interactive charts
- Monthly financial reports
- Budget alerts
- Email notifications
- PDF and Excel report export
- Cloud deployment
- Mobile responsive design

---

# 12. Conclusion

BudgetBuddy provides a strong foundation for a modern personal finance management system. Milestone 1 successfully establishes the project architecture, authentication mechanism, backend APIs, and frontend integration. Future milestones will focus on implementing complete financial management features and enhancing the user experience.
