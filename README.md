# BudgetBuddy 💰

**BudgetBuddy** is a full-stack personal budget planning and expense management application developed as part of the **Infosys Springboard Internship**.

It helps users manage income and expenses, monitor their financial summary, set budgets, track savings goals, receive notifications, and view financial reports and analytics from one dashboard.

## 🚀 Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Protected API endpoints
- User-specific financial data

### 💵 Income & Expense Management
- Add, view, update, and delete income records
- Add, view, update, and delete expense records
- Categorize transactions
- Track financial activity

### 📊 Dashboard & Financial Summary
- Total income
- Total expenses
- Current balance
- Dashboard cards and charts

### 🎯 Budget Management
- Create and manage budgets
- Monitor spending against budgets
- Budget alerts and notifications

### 💰 Savings Goals
- Create savings goals
- Track savings progress
- Monitor target and current amounts

### 🔔 Notifications
- In-app notifications
- Budget-related alerts
- Financial reminders and updates

### 📈 Analytics & Reports
- Income and expense analytics
- Category-wise expense analysis
- Financial reports
- Filtered report views
- Export/download support where implemented

### 📱 Responsive Interface
- React-based frontend
- Dashboard-oriented UI
- Responsive pages

## 🛠️ Technology Stack

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3

**Backend**
- Python
- Django
- Django REST Framework
- JWT Authentication

**Database**
- SQLite for development

**Tools**
- Postman
- Swagger/OpenAPI
- Git & GitHub

## 📁 Project Structure

```text
BudgetBuddy/
├── backend/
│   ├── config/
│   └── ...
├── frontend/
│   ├── src/
│   └── ...
├── screenshots/
├── README.md
└── .gitignore
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd BudgetBuddy
```

### 2. Backend setup

```bash
python -m venv venv
```

Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start the backend:

```bash
python manage.py runserver
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

Use the command specified in `package.json` if the project uses a different frontend start command.

## 🔑 Environment Variables

Sensitive values such as Django `SECRET_KEY`, passwords, API keys, tokens, database credentials, and email credentials must not be committed to GitHub.

Example:

```env
SECRET_KEY=your-secret-key
DEBUG=True
```

Keep real secrets in local environment configuration and outside version control.

## 🧪 API Testing

The backend REST APIs can be tested using **Postman**.

The project includes APIs for authentication, income, expenses, budgets, savings goals, notifications, financial summaries, reports, and analytics.

Swagger/OpenAPI documentation can also be used where enabled.

## 📌 Project Milestones

### Milestone 1
- Initial project setup
- Frontend and backend structure
- Core application foundation

### Milestone 2
- Income CRUD
- Financial Summary API
- JWT authentication
- API testing
- Postman evidence

### Milestone 3
- Savings Goals
- Notifications
- Analytics
- Reports
- Dashboard improvements
- Project evidence and documentation

## 🔒 Security

The project uses:
- JWT authentication
- Protected API endpoints
- User-specific data access
- `.gitignore` for files that should not be committed
- Environment-based handling of sensitive configuration

**Never commit real passwords, API keys, tokens, or secret keys.**

## 🎓 Internship Project

**Program:** Infosys Springboard Internship  
**Project:** BudgetBuddy  
**Domain:** Personal Budget Planning and Expense Management  
**Technology:** React.js + Django REST Framework + Python

## 👩‍💻 Developer

**Sai Harshitha**

B.Tech – Computer Science Engineering (AI & ML)  
Mohan Babu University, Tirupati

---

⭐ If you find this project useful, consider giving the repository a star!
