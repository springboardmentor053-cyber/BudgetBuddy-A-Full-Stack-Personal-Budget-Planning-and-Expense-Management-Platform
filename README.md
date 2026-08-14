```markdown
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
- 📄 Export Reports (PDF, Excel, CSV)
- 🔐 Securely Authenticate using JWT
- 🌐 Access data through REST APIs

The project is built using **React (Vite)** for the frontend, **Django REST Framework** for the backend, and **PostgreSQL** as the relational database.

---

# 🎯 Project Objectives

The primary objectives of BudgetBuddy are:

- Develop a secure authentication system using JWT.
- Simplify personal financial management.
- Enable efficient income and expense tracking.
- Support monthly budget planning.
- Track savings goals and financial progress.
- Provide interactive dashboard analytics and charts.
- Generate and export monthly financial reports (PDF, Excel, CSV).
- Send budget alerts and email notifications.
- Provide a responsive and modern user interface.
- Store financial records securely using PostgreSQL.
- Build scalable REST APIs for future enhancements.

---

# ✨ Features

## ✅ Completed Features (Milestone 3)

### 🔐 Authentication & Security

- User Registration
- User Login
- JWT Authentication
- Secure Password Encryption
- Protected API Access

---

### 💸 Core Financial Modules

- **Income Management:** Add, View, Edit, and Delete Income
- **Expense Management:** Add, View, Edit, and Delete Expenses
- **Budget Management:** Create, View, Update, and Delete Budgets
- **Savings Goal Management:** Create, Track, Update, and Delete Savings Goals

---

### 📊 Analytics & Reports

- Dashboard Analytics & Financial Summaries
- Monthly Expense Trends & Category-wise Analysis
- Reports Module for Monthly Financial Insights
- PDF, Excel, and CSV Report Export

---

### 🔔 Notifications & Email Integration

- In-app Notification Center
- Budget Alert Notifications
- Email Notifications for Generated Reports

---

### 🖥️ Dashboard & Frontend

- Dashboard Interface with Quick Navigation & Responsive Sidebar
- React + Vite with React Router and Axios API Integration
- Modern Responsive Layout

---

### ⚙️ Backend

- Django REST Framework APIs
- Comprehensive CRUD Operations
- PostgreSQL Integration
- Django Admin Panel
- RESTful API Design

---

# 🚧 Upcoming Features

- 🤖 AI-Based Spending Analysis
- 📈 Expense Prediction using Machine Learning
- 💡 Smart Budget Recommendations
- ☁️ Cloud Deployment
- 📱 Mobile Application
- 🌐 Multi-language Support
- 🔄 Recurring Transactions Management

---

# 🛠️ Technology Stack

## Frontend

<p>

<img src="https://skillicons.dev/icons?i=react,vite,js,html,css"/>

</p>

- React 19
- Vite
- JavaScript (ES6+)
- HTML5
- CSS3
- React Router DOM
- Axios
- React Icons

---

## Backend

<p>

<img src="https://skillicons.dev/icons?i=python,django"/>

</p>

- Python
- Django
- Django REST Framework
- Simple JWT Authentication

---

## Database

<p>

<img src="https://skillicons.dev/icons?i=postgres"/>

</p>

- PostgreSQL

---

## Development Tools

<p>

<img src="https://skillicons.dev/icons?i=git,github,vscode"/>

</p>

- Git
- GitHub
- Visual Studio Code
- Postman
- pgAdmin

---

# 🏗️ System Architecture

```text
                    +---------------------------+
                    |      React Frontend       |
                    |     (React + Vite)        |
                    +---------------------------+
                                │
                                │ HTTP Requests
                                ▼
                    +---------------------------+
                    | Django REST Framework API |
                    +---------------------------+
                                │
                       JWT Authentication
                                │
                                ▼
                    +---------------------------+
                    |     PostgreSQL Database   |
                    +---------------------------+

```

---

# 📌 Project Highlights

* ✅ Full-Stack Web Application
* ✅ REST API Architecture
* ✅ JWT Authentication
* ✅ PostgreSQL Database
* ✅ Complete CRUD Operations
* ✅ Savings Goal Tracking
* ✅ Financial Reports & Analytics (PDF, Excel, CSV)
* ✅ Budget Alerts & Email Notifications
* ✅ Responsive User Interface
* ✅ Scalable Modular Design

---

# 📂 Project Structure

```text
BudgetBuddy/
│
├── backend/
│   ├── budgets/
│   ├── expenses/
│   ├── income/
│   ├── savings/
│   ├── reports/
│   ├── notifications/
│   ├── users/
│   ├── backend/
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
│   ├── MILESTONE_1_REPORT.md
│   ├── MILESTONE_2_REPORT.md
│   ├── MILESTONE_3_REPORT.md
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
git clone [https://github.com/YOUR_USERNAME/BudgetBuddy.git](https://github.com/YOUR_USERNAME/BudgetBuddy.git)

cd BudgetBuddy

```

---

# 🖥️ Backend Setup

Navigate to the backend folder.

```bash
cd backend

```

Create a virtual environment.

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

Install the required dependencies.

```bash
pip install -r requirements.txt

```

Apply database migrations.

```bash
python manage.py makemigrations

python manage.py migrate

```

Create a superuser.

```bash
python manage.py createsuperuser

```

Run the backend server.

```bash
python manage.py runserver

```

Server:

```
[http://127.0.0.1:8000/](http://127.0.0.1:8000/)

```

---

# 🌐 Frontend Setup

Open another terminal.

```bash
cd frontend

```

Install dependencies.

```bash
npm install

```

Start the React development server.

```bash
npm run dev

```

Frontend:

```
http://localhost:5173/

```

---

# 🔐 Authentication

BudgetBuddy uses **JWT (JSON Web Token)** Authentication.

Authentication Flow

```text
User Login
      │
      ▼
JWT Access Token
      │
      ▼
Store Token
(Local Storage)
      │
      ▼
Protected APIs

```

---

# 🌐 REST API Endpoints

## 👤 Authentication APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/users/register/` | Register a new user |
| POST | `/api/token/` | User Login |
| POST | `/api/token/refresh/` | Refresh JWT Token |

---

## 💸 Expense APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/expenses/` | Get All Expenses |
| POST | `/api/expenses/` | Add Expense |
| PUT | `/api/expenses/{id}/` | Update Expense |
| DELETE | `/api/expenses/{id}/` | Delete Expense |

---

## 💰 Income APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/income/` | Get All Income |
| POST | `/api/income/` | Add Income |
| PUT | `/api/income/{id}/` | Update Income |
| DELETE | `/api/income/{id}/` | Delete Income |

---

## 📊 Budget APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/budgets/` | Get All Budgets |
| POST | `/api/budgets/` | Create Budget |
| PUT | `/api/budgets/{id}/` | Update Budget |
| DELETE | `/api/budgets/{id}/` | Delete Budget |

---

## 🎯 Savings Goal APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/savings/` | Get All Savings Goals |
| POST | `/api/savings/` | Create Savings Goal |
| PUT | `/api/savings/{id}/` | Update Savings Goal |
| DELETE | `/api/savings/{id}/` | Delete Savings Goal |

---

## 📈 Reports & Analytics APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/reports/summary/` | Get Financial Summary |
| GET | `/api/reports/analytics/` | Get Dashboard Analytics |
| GET | `/api/reports/trends/` | Get Monthly Expense Trends |
| GET | `/api/reports/export/` | Export Reports (PDF, Excel, CSV) |

---

## 🔔 Notification APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/notifications/` | Get User Notifications |
| PUT | `/api/notifications/{id}/read/` | Mark Notification as Read |
| DELETE | `/api/notifications/{id}/` | Delete Notification |

---

# 🗄️ Database

BudgetBuddy uses **PostgreSQL** as its primary relational database.

### Database Features

* Secure relational database
* Django ORM Integration
* Foreign Key Relationships
* Normalized Database Design
* Fast CRUD Operations
* High Scalability
* Data Integrity

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected REST APIs
* User-based Data Access
* Secure Database Storage
* Django Authentication System
* CSRF & CORS Configuration

---

# 📋 Implemented Modules

| Module | Status |
| --- | --- |
| User Authentication | ✅ Completed |
| Dashboard | ✅ Completed |
| Expense Management | ✅ Completed |
| Income Management | ✅ Completed |
| Budget Management | ✅ Completed |
| Savings Goal Management | ✅ Completed |
| Reports & Analytics | ✅ Completed |
| Notifications & Alerts | ✅ Completed |
| Email Notifications | ✅ Completed |
| PDF, Excel & CSV Export | ✅ Completed |
| PostgreSQL Integration | ✅ Completed |
| REST APIs | ✅ Completed |
| Django Admin | ✅ Completed |
| API Testing | ✅ Completed |

---

# 📊 Project Progress

## Milestone Status

| Milestone | Duration | Status |
| --- | --- | --- |
| Milestone 1 | Week 1 – Week 2 | ✅ Completed |
| Milestone 2 | Week 3 – Week 4 | ✅ Completed |
| Milestone 3 | Week 5 – Week 6 | ✅ Completed |

---

## Overall Project Progress

| Module | Status |
| --- | --- |
| Requirement Analysis | ✅ Completed |
| Project Planning | ✅ Completed |
| Backend Development | ✅ Completed |
| Frontend Development | ✅ Completed |
| PostgreSQL Integration | ✅ Completed |
| JWT Authentication | ✅ Completed |
| User Registration & Login | ✅ Completed |
| Dashboard | ✅ Completed |
| Income, Expense & Budget Management | ✅ Completed |
| Savings Goal Management | ✅ Completed |
| Reports & Analytics Module | ✅ Completed |
| Notification Center & Alerts | ✅ Completed |
| Email Notifications | ✅ Completed |
| PDF, Excel & CSV Report Generation | ✅ Completed |
| REST APIs & API Testing | ✅ Completed |
| AI-Based Spending Analysis | 🚧 Planned |
| Cloud Deployment | 🚧 Planned |

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

### ✅ Phase 3 — Advanced Features & Milestone 3

* Savings Goal Management
* Reports & Analytics Dashboard
* Monthly Expense Trends & Charts
* Notification Center & Budget Alerts
* Email Notifications
* PDF, Excel & CSV Report Exports

---

### 🚀 Phase 4 — Future Enhancements & Deployment

* AI-Based Spending Analysis
* Expense Prediction using Machine Learning
* Smart Budget Recommendations
* Cloud Deployment
* Mobile Application Optimization

---

# 🎯 Future Enhancements

The following features are planned for future releases:

* 🤖 AI-Based Spending Analysis
* 📈 Expense Prediction using Machine Learning
* 💡 Smart Budget Recommendations
* ☁️ Cloud Deployment
* 📱 Progressive Web App (PWA) / Mobile Application
* 🌐 Multi-language Support
* 🔄 Recurring Transactions Management

---

# 📚 Learning Outcomes

This project helped in gaining practical experience with:

* Django REST Framework
* React with Vite
* PostgreSQL Database
* JWT Authentication
* REST API Development & CRUD Operations
* Financial Reports & Data Export (PDF/Excel/CSV)
* Email & Notification Integrations
* Frontend–Backend Integration via Axios
* API Testing using Postman
* Git & GitHub Version Control
* Responsive Web Design

---

# 📖 Documentation

The project includes the following documentation:

* 📄 README.md
* 📄 PROJECT_SCOPE.md
* 📄 DATABASE_SCHEMA.md
* 📄 SYSTEM_ANALYSIS.md
* 📄 MILESTONE_1_REPORT.md
* 📄 MILESTONE_2_REPORT.md
* 📄 MILESTONE_3_REPORT.md

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

* GitHub: https://github.com/Karuna-1512/
* LinkedIn: https://www.linkedin.com/in/koppadi-karuna-560230333/

> Replace the links above with your actual GitHub and LinkedIn profiles.

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