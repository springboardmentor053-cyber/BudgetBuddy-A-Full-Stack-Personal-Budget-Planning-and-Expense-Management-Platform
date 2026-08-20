````markdown
<h1 align="center"> 💰 BudgetBuddy</h1>

<h3 align="center">
Personal Budget Planning & Expense Management Platform
</h3>

<p align="center">
A modern Full-Stack Web Application built using <b>React</b>, <b>Django REST Framework</b>, and <b>PostgreSQL</b> to help users efficiently manage their personal finances.
</p>

<p align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>

<img src="https://img.shields.io/badge/Django-REST-092E20?style=for-the-badge&logo=django&logoColor=white"/>

<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>

<img src="https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white"/>

<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>

<img src="https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-black?style=for-the-badge"/>

<img src="https://img.shields.io/badge/License-Academic-green?style=for-the-badge"/>

</p>

---

# 📖 Project Overview

BudgetBuddy is a **Full-Stack Personal Budget Planning and Expense Management Platform** developed to help users manage their daily finances in a secure, organized, and user-friendly environment.

The application enables users to:

- 💰 Track Income
- 💸 Track Expenses
- 📊 Manage Monthly Budgets
- 🎯 Track Savings Goals
- 📈 Monitor Financial Reports & Analytics
- 🔔 Receive Notifications & Budget Alerts
- 📄 Export Reports in PDF, Excel, and CSV formats
- 🔐 Securely Authenticate using JWT
- 🌐 Access data through REST APIs
- ☁️ Use the application through a production deployment

The project is built using **React (Vite)** for the frontend, **Django REST Framework** for the backend, and **PostgreSQL** as the production relational database.

---

# 🎯 Project Objectives

The primary objectives of BudgetBuddy are:

- Develop a secure authentication system using JWT.
- Simplify personal financial management.
- Enable efficient income and expense tracking.
- Support monthly budget planning.
- Track savings goals and financial progress.
- Provide interactive dashboard analytics and charts.
- Generate and export monthly financial reports.
- Support PDF, Excel, and CSV report exports.
- Send budget alerts and email notifications.
- Provide a responsive and modern user interface.
- Store financial records securely using PostgreSQL.
- Build scalable REST APIs.
- Deploy the complete application to a production environment.
- Provide an end-to-end financial management workflow.

---

# ✨ Features

## ✅ Completed Features

### 🔐 Authentication & Security

- User Registration
- User Login
- JWT Authentication
- Secure Password Hashing
- Protected API Access
- User-specific Financial Data
- Secure Logout

---

### 💸 Core Financial Modules

- **Income Management**
  - Add Income
  - View Income
  - Edit Income
  - Delete Income
  - Income History

- **Expense Management**
  - Add Expenses
  - View Expenses
  - Edit Expenses
  - Delete Expenses
  - Expense Categorization
  - Expense History

- **Budget Management**
  - Create Budgets
  - View Budgets
  - Update Budgets
  - Delete Budgets
  - Budget Utilization Tracking
  - Budget Alerts

- **Savings Goal Management**
  - Create Savings Goals
  - Track Savings Progress
  - Update Savings Goals
  - Delete Savings Goals
  - Target Amount Tracking
  - Goal Completion Tracking

---

### 📊 Analytics & Reports

- Dashboard Analytics
- Financial Summary
- Total Income Calculation
- Total Expense Calculation
- Current Balance Calculation
- Budget Utilization
- Savings Overview
- Monthly Expense Trends
- Category-wise Expense Analysis
- Financial Insights
- Monthly Financial Reports

---

### 📄 Report Export

BudgetBuddy provides multiple report export formats:

- PDF Reports
- Excel Reports
- CSV Reports
- Monthly Financial Reports
- Expense History Reports
- Financial Summary Reports

---

### 🔔 Notifications & Email Integration

- In-app Notification Center
- Budget Warning Alerts
- Budget Limit Notifications
- Savings-related Notifications
- Report Notifications
- Mark Notification as Read
- Email Notifications

---

### 🖥️ Dashboard & Frontend

- Responsive Dashboard
- Financial Summary Cards
- Interactive Charts
- Monthly Trend Visualization
- Quick Navigation
- Responsive Sidebar
- Responsive Forms
- React Router Navigation
- Axios API Integration
- Modern Responsive UI

---

### ⚙️ Backend

- Django REST Framework APIs
- RESTful API Architecture
- Comprehensive CRUD Operations
- JWT Authentication
- PostgreSQL Integration
- Analytics APIs
- Reports APIs
- Notification APIs
- Savings APIs
- Budget Alert Logic
- Django Admin Panel

---

# ☁️ Production Deployment

BudgetBuddy has been successfully deployed as a full-stack production application.

## 🌐 Frontend – Vercel

The React + Vite frontend is deployed using **Vercel**.

### Live Application

👉 **https://budgetbuddy-frontend-flax.vercel.app/**

The deployed frontend provides access to:

- Landing Page
- Registration
- Login
- Dashboard
- Income Management
- Expense Management
- Budget Management
- Savings Goals
- Reports
- Analytics
- Notifications
- Profile
- Settings

---

## 🐍 Backend – Render

The Django REST Framework backend is deployed using **Render**.

### Live Backend API

👉 **https://budgetbuddy-backend-h7j9.onrender.com**

The backend provides:

- Authentication APIs
- Income APIs
- Expense APIs
- Budget APIs
- Savings APIs
- Analytics APIs
- Reports APIs
- Notification APIs

---

## 🗄️ Production Database

BudgetBuddy uses **PostgreSQL** for production data storage.

The production database stores:

- User information
- Income records
- Expense records
- Budgets
- Savings Goals
- Notifications
- Financial transactions
- Application-related data

---

# 🏗️ Production System Architecture

```text
                              INTERNET
                                  │
                                  ▼
                       ┌────────────────────┐
                       │    User Browser    │
                       └─────────┬──────────┘
                                 │
                                 │ HTTPS
                                 ▼
             ┌────────────────────────────────────┐
             │              VERCEL                │
             │                                    │
             │        React + Vite Frontend       │
             │                                    │
             │  BudgetBuddy User Interface        │
             └────────────────┬───────────────────┘
                              │
                              │ REST API / HTTPS
                              │ Axios
                              ▼
             ┌────────────────────────────────────┐
             │              RENDER                │
             │                                    │
             │       Django REST Framework        │
             │             Backend                │
             │                                    │
             │  JWT Authentication                │
             │  Analytics                         │
             │  Reports                           │
             │  Notifications                     │
             └────────────────┬───────────────────┘
                              │
                              │ SQL
                              ▼
             ┌────────────────────────────────────┐
             │          POSTGRESQL                │
             │                                    │
             │        Production Database         │
             └────────────────────────────────────┘
````

---

# 🔄 Application Data Flow

```text
User
  │
  ▼
React Frontend
  │
  │ Axios / HTTPS
  ▼
Django REST API
  │
  ├── JWT Authentication
  │
  ├── Income Management
  │
  ├── Expense Management
  │
  ├── Budget Management
  │
  ├── Savings Goals
  │
  ├── Analytics
  │
  ├── Reports
  │
  └── Notifications
  │
  ▼
PostgreSQL Database
```

---

# 🛠️ Technology Stack

## Frontend

<p>

<img src="https://skillicons.dev/icons?i=react,vite,js,html,css"/>

</p>

* React
* Vite
* JavaScript (ES6+)
* HTML5
* CSS3
* Tailwind CSS
* React Router DOM
* Axios
* React Icons
* Recharts

---

## Backend

<p>

<img src="https://skillicons.dev/icons?i=python,django"/>

</p>

* Python
* Django
* Django REST Framework
* Simple JWT
* Celery

---

## Database

<p>

<img src="https://skillicons.dev/icons?i=postgres"/>

</p>

* PostgreSQL

---

## Reporting & Analytics

* Pandas
* ReportLab
* OpenPyXL
* Matplotlib
* Recharts

---

## Development Tools

<p>

<img src="https://skillicons.dev/icons?i=git,github,vscode"/>

</p>

* Git
* GitHub
* Visual Studio Code
* Postman
* pgAdmin

---

## Deployment

* Vercel – Frontend Hosting
* Render – Backend Hosting
* PostgreSQL – Production Database

---

# 📂 Project Structure

```text
BudgetBuddy/
│
├── backend/
│   ├── users/
│   ├── expenses/
│   ├── income/
│   ├── budget/
│   ├── savings/
│   ├── reports/
│   ├── analytics_app/
│   ├── notifications/
│   ├── config/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── Documentation/
│   ├── ANALYSIS.md
│   ├── DATABASE_SCHEMA.md
│   ├── PROJECT_SCOPE.md
│   ├── DEPLOYMENT.md
│   ├── MILESTONE_1_REPORT.md
│   ├── MILESTONE_2_REPORT.md
│   ├── MILESTONE_3_REPORT.md
│   ├── MILESTONE_4_REPORT.md
│   └── README.md
│
├── LICENSE
├── .gitignore
└── README.md
```

---

# ⚙️ Installation Guide

## 📥 Clone the Repository

```bash
git clone https://github.com/Karuna-1512/BudgetBuddy-A-Full-Stack-Personal-Budget-Planning-and-Expense-Management-Platform.git

cd BudgetBuddy-A-Full-Stack-Personal-Budget-Planning-and-Expense-Management-Platform
```

---

# 🖥️ Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Create a superuser:

```bash
python manage.py createsuperuser
```

Run the backend server:

```bash
python manage.py runserver
```

Local backend:

```text
http://127.0.0.1:8000/
```

---

# 🌐 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Local frontend:

```text
http://localhost:5173/
```

---

# 🔐 Authentication

BudgetBuddy uses **JWT (JSON Web Token)** Authentication.

### Authentication Flow

```text
User
 │
 ▼
Login Page
 │
 ▼
Django JWT API
 │
 ├── Access Token
 │
 └── Refresh Token
        │
        ▼
React Application
        │
        ▼
Authenticated API Requests
```

Protected API requests use:

```text
Authorization: Bearer <access_token>
```

---

# 🌐 REST API Endpoints

## 👤 Authentication APIs

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| POST   | `/api/users/register/` | Register a new user |
| POST   | `/api/token/`          | User Login          |
| POST   | `/api/token/refresh/`  | Refresh JWT Token   |

---

## 💸 Expense APIs

| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| GET    | `/api/expenses/`      | Get All Expenses |
| POST   | `/api/expenses/`      | Add Expense      |
| PUT    | `/api/expenses/{id}/` | Update Expense   |
| DELETE | `/api/expenses/{id}/` | Delete Expense   |

---

## 💰 Income APIs

| Method | Endpoint            | Description    |
| ------ | ------------------- | -------------- |
| GET    | `/api/income/`      | Get All Income |
| POST   | `/api/income/`      | Add Income     |
| PUT    | `/api/income/{id}/` | Update Income  |
| DELETE | `/api/income/{id}/` | Delete Income  |

---

## 📊 Budget APIs

| Method | Endpoint             | Description     |
| ------ | -------------------- | --------------- |
| GET    | `/api/budgets/`      | Get All Budgets |
| POST   | `/api/budgets/`      | Create Budget   |
| PUT    | `/api/budgets/{id}/` | Update Budget   |
| DELETE | `/api/budgets/{id}/` | Delete Budget   |

---

## 🎯 Savings Goal APIs

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | `/api/savings/`      | Get All Savings Goals |
| POST   | `/api/savings/`      | Create Savings Goal   |
| PUT    | `/api/savings/{id}/` | Update Savings Goal   |
| DELETE | `/api/savings/{id}/` | Delete Savings Goal   |

---

## 📈 Analytics APIs

| Method | Endpoint                        | Description            |
| ------ | ------------------------------- | ---------------------- |
| GET    | `/api/analytics/dashboard/`     | Dashboard Analytics    |
| GET    | `/api/analytics/summary/`       | Financial Summary      |
| GET    | `/api/analytics/category/`      | Category-wise Analysis |
| GET    | `/api/analytics/monthly-trend/` | Monthly Expense Trends |
| GET    | `/api/analytics/insights/`      | Financial Insights     |

---

## 📄 Reports APIs

| Method | Endpoint                 | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/api/analytics/export/` | Export Financial Reports |

Supported formats:

```text
PDF
Excel
CSV
```

---

## 🔔 Notification APIs

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| GET    | `/api/notifications/`           | Get User Notifications    |
| PUT    | `/api/notifications/{id}/read/` | Mark Notification as Read |
| DELETE | `/api/notifications/{id}/`      | Delete Notification       |

---

# 🗄️ Database

BudgetBuddy uses **PostgreSQL** as its production relational database.

### Database Features

* Secure relational database
* Django ORM Integration
* Foreign Key Relationships
* Normalized Database Design
* Data Integrity
* Transaction Management
* Production Database Support

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected REST APIs
* User-based Data Access
* Secure Database Storage
* Django Authentication System
* CORS Configuration
* Environment Variables
* HTTPS Production Deployment
* Sensitive Credentials excluded from Git

---

# 📋 Implemented Modules

| Module                  | Status      |
| ----------------------- | ----------- |
| User Authentication     | ✅ Completed |
| JWT Authentication      | ✅ Completed |
| Dashboard               | ✅ Completed |
| Expense Management      | ✅ Completed |
| Income Management       | ✅ Completed |
| Budget Management       | ✅ Completed |
| Savings Goal Management | ✅ Completed |
| Reports & Analytics     | ✅ Completed |
| Notifications & Alerts  | ✅ Completed |
| Email Notifications     | ✅ Completed |
| PDF Export              | ✅ Completed |
| Excel Export            | ✅ Completed |
| CSV Export              | ✅ Completed |
| PostgreSQL Integration  | ✅ Completed |
| REST APIs               | ✅ Completed |
| Django Admin            | ✅ Completed |
| API Testing             | ✅ Completed |
| Frontend Deployment     | ✅ Completed |
| Backend Deployment      | ✅ Completed |
| Production Integration  | ✅ Completed |

---

# 📊 Project Progress

## Milestone Status

| Milestone   | Duration        | Status      |
| ----------- | --------------- | ----------- |
| Milestone 1 | Week 1 – Week 2 | ✅ Completed |
| Milestone 2 | Week 3 – Week 4 | ✅ Completed |
| Milestone 3 | Week 5 – Week 6 | ✅ Completed |
| Milestone 4 | Week 7 – Week 8 | ✅ Completed |

---

## Overall Project Progress

| Module                    | Status      |
| ------------------------- | ----------- |
| Requirement Analysis      | ✅ Completed |
| Project Planning          | ✅ Completed |
| Database Design           | ✅ Completed |
| Backend Development       | ✅ Completed |
| Frontend Development      | ✅ Completed |
| PostgreSQL Integration    | ✅ Completed |
| JWT Authentication        | ✅ Completed |
| User Registration & Login | ✅ Completed |
| Dashboard                 | ✅ Completed |
| Income Management         | ✅ Completed |
| Expense Management        | ✅ Completed |
| Budget Management         | ✅ Completed |
| Savings Goal Management   | ✅ Completed |
| Reports & Analytics       | ✅ Completed |
| Notification Center       | ✅ Completed |
| Budget Alerts             | ✅ Completed |
| Email Notifications       | ✅ Completed |
| PDF/Excel/CSV Export      | ✅ Completed |
| REST APIs                 | ✅ Completed |
| API Testing               | ✅ Completed |
| Responsive UI             | ✅ Completed |
| Production Deployment     | ✅ Completed |
| End-to-End Integration    | ✅ Completed |

---

# 🚀 Project Roadmap

### ✅ Phase 1 — Foundation

* Project Planning
* Requirement Analysis
* Django Project Setup
* React Project Setup
* PostgreSQL Configuration
* JWT Authentication
* User Registration & Login

---

### ✅ Phase 2 — Core Financial Modules

* Expense CRUD
* Income CRUD
* Budget CRUD
* React Integration
* REST API Development
* Dashboard Navigation

---

### ✅ Phase 3 — Advanced Features

* Savings Goal Management
* Reports & Analytics Dashboard
* Monthly Expense Trends
* Category-wise Analysis
* Notification Center
* Budget Alerts
* Email Notifications
* PDF, Excel & CSV Report Exports

---

### ✅ Phase 4 — Testing & Deployment

* Dashboard Improvements
* Charts and Visualizations
* API Testing
* Application Validation
* Production Environment Configuration
* CORS Configuration
* PostgreSQL Production Database
* Frontend Deployment using Vercel
* Backend Deployment using Render
* End-to-End Testing
* Production Integration

---

# 🌐 Live Application

## Frontend

🔗 **BudgetBuddy Web Application**

[https://budgetbuddy-frontend-flax.vercel.app/](https://budgetbuddy-frontend-flax.vercel.app/)

---

## Backend

🔗 **BudgetBuddy Django REST API**

[https://budgetbuddy-backend-h7j9.onrender.com](https://budgetbuddy-backend-h7j9.onrender.com)

---

# 🧪 Production Verification

The deployed application was verified for the following workflows:

* User Registration
* User Login
* JWT Authentication
* Dashboard Access
* Income Management
* Expense Management
* Budget Management
* Savings Goal Management
* Analytics
* Financial Reports
* PDF Export
* Excel Export
* CSV Export
* Notifications
* Budget Alerts
* Email Integration
* Frontend–Backend Communication
* PostgreSQL Data Storage

---

# 🎯 Future Enhancements

The following features are planned for future releases:

* 🤖 AI-Based Spending Analysis
* 📈 Expense Prediction using Machine Learning
* 💡 Smart Budget Recommendations
* 📱 Mobile Application
* 🌐 Multi-language Support
* 🔄 Recurring Transactions Management
* 🔮 Advanced Financial Forecasting
* 🧠 Personalized Financial Insights

---

# 📚 Learning Outcomes

This project provided practical experience with:

* Django REST Framework
* React with Vite
* PostgreSQL Database
* JWT Authentication
* REST API Development
* CRUD Operations
* Financial Analytics
* Dashboard Development
* Chart Integration
* PDF/Excel/CSV Report Generation
* Email & Notification Systems
* Frontend–Backend Integration
* Axios API Integration
* API Testing using Postman
* Git & GitHub
* Production Deployment
* Vercel
* Render
* Environment Configuration
* CORS Configuration

---

# 📖 Documentation

The project includes the following documentation:

* 📄 README.md
* 📄 PROJECT_SCOPE.md
* 📄 DATABASE_SCHEMA.md
* 📄 SYSTEM_ANALYSIS.md
* 📄 DEPLOYMENT.md
* 📄 MILESTONE_1_REPORT.md
* 📄 MILESTONE_2_REPORT.md
* 📄 MILESTONE_3_REPORT.md
* 📄 MILESTONE_4_REPORT.md

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

If you'd like to contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 👩‍💻 Developer

**Karuna**

**B.Tech – Computer Science & Engineering (Artificial Intelligence & Machine Learning)**

**Malla Reddy University, Hyderabad**

### Connect with Me

* GitHub: [https://github.com/Karuna-1512/](https://github.com/Karuna-1512/)
* LinkedIn: [https://www.linkedin.com/in/koppadi-karuna-560230333/](https://www.linkedin.com/in/koppadi-karuna-560230333/)

---

# 📄 License

This project has been developed for **academic, internship, and learning purposes**.

You are free to use this project for educational purposes with proper attribution.

---

# ⭐ Support

If you found this project helpful:

* ⭐ Star this repository
* 🍴 Fork this repository
* 🛠️ Share your suggestions
* 🐞 Report issues if you find any

---

# 🏆 Final Project Status

```text
╔════════════════════════════════════════════════════╗
║                 BUDGETBUDDY                        ║
║                                                    ║
║  Milestone 1              ✅ COMPLETED             ║
║  Milestone 2              ✅ COMPLETED             ║
║  Milestone 3              ✅ COMPLETED             ║
║  Milestone 4              ✅ COMPLETED             ║
║                                                    ║
║  Frontend                  ✅ VERCEL               ║
║  Backend                   ✅ RENDER               ║
║  Database                  ✅ POSTGRESQL           ║
║  Authentication            ✅ JWT                  ║
║  Analytics                 ✅ COMPLETED            ║
║  Reports                   ✅ COMPLETED            ║
║  Notifications             ✅ COMPLETED            ║
║  API Testing               ✅ COMPLETED            ║
║  Production Integration    ✅ COMPLETED            ║
║                                                    ║
║  Overall Progress          🚀 100%                 ║
╚════════════════════════════════════════════════════╝
```

---

# 🎉 BudgetBuddy – Successfully Completed

BudgetBuddy is now a **fully integrated and production-deployed Full-Stack Personal Finance Management Platform**.

The application provides an end-to-end workflow for managing:

**Income → Expenses → Budgets → Savings → Analytics → Reports → Notifications**

with:

**React + Vite → Django REST Framework → PostgreSQL**

and production deployment using:

**Vercel → Render → PostgreSQL**

---

```

### One important correction, bro 👀

I also changed your old:

> `## ✅ Completed Features (Milestone 3)`

to simply:

> `## ✅ Completed Features`

because **Milestone 4 is now completed**.

And this old part:

> `Cloud Deployment 🚧 Planned`

is now removed from the future scope because **you already deployed it**. Your actual live deployment is now documented as:

- 🌐 **Frontend:** `https://budgetbuddy-frontend-flax.vercel.app/`
- 🐍 **Backend:** `https://budgetbuddy-backend-h7j9.onrender.com`
- 🗄️ **Database:** PostgreSQL
- 🚀 **Overall:** **100% completed**
```
