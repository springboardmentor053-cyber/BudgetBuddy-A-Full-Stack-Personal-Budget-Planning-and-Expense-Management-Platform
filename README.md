# 💰 BudgetBuddy – Personal Budget Planning & Expense Management Platform

A full-stack web application designed to help users efficiently manage their personal finances by tracking income, expenses, budgets, and savings goals. BudgetBuddy provides a secure, user-friendly interface with JWT authentication and a modern React frontend.

---

## 📌 Project Overview

BudgetBuddy is a Personal Budget Planning & Expense Management Platform developed using **Django REST Framework** for the backend and **React (Vite)** for the frontend.

The application enables users to securely register, log in, and manage their financial information while providing an organized dashboard for future expense analysis and budgeting.

---

## 🚀 Features

### ✅ Completed (Milestone 1)

- User Registration
- User Login
- JWT Authentication
- Secure Password Storage
- React Frontend
- Django REST API
- Dashboard (Basic)
- Django Admin Panel
- SQLite Database Integration
- REST API Testing with Postman

### 🔄 Upcoming Features

- Income Management
- Expense Management
- Budget Planning
- Savings Goals
- Monthly Reports
- Charts & Analytics
- Notifications
- Profile Management

---

## 🛠️ Technology Stack

### Frontend
- React 19
- Vite
- React Router DOM
- JavaScript
- HTML5
- CSS3

### Backend
- Python
- Django
- Django REST Framework
- JWT Authentication (Simple JWT)

### Database
- SQLite (Development)
- PostgreSQL (Future Deployment)

### Tools
- Git
- GitHub
- VS Code
- Postman

---

## 📂 Project Structure

```
BudgetBuddy/
│
├── backend/
│   ├── users/
│   ├── income/
│   ├── expenses/
│   ├── manage.py
│   └── db.sqlite3
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│
├── README.md
├── ANALYSIS.md
├── PROJECT_SCOPE.md
├── DATABASE_SCHEMA.md
├── MILESTONE_1_REPORT.md
└── LICENSE
```

---

## 🔐 Authentication

The project uses **JWT (JSON Web Tokens)** for secure authentication.

### Available Authentication APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/users/register/` | Register a new user |
| POST | `/api/token/` | User Login |
| POST | `/api/token/refresh/` | Refresh JWT Token |

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/BudgetBuddy.git
```

---

### Backend Setup

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Windows

```bash
.venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run migrations

```bash
python manage.py migrate
```

Start server

```bash
python manage.py runserver
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 📸 Screenshots

### Login Page

> Add image

```
screenshots/login.png
```

---

### Register Page

> Add image

```
screenshots/register.png
```

---

### Dashboard

> Add image

```
screenshots/dashboard.png
```

---

### Django Admin

> Add image

```
screenshots/admin.png
```

---

### Postman API Testing

> Add image

```
screenshots/postman-login.png

screenshots/postman-register.png
```

---

## 📊 Milestone 1 Progress

| Module | Status |
|----------|---------|
| Project Planning | ✅ Completed |
| Backend Setup | ✅ Completed |
| Database Setup | ✅ Completed |
| Authentication | ✅ Completed |
| React Setup | ✅ Completed |
| Dashboard Skeleton | ✅ Completed |
| Income Module | ⏳ Pending |
| Expense Module | ⏳ Pending |
| Budget Module | ⏳ Pending |
| Savings Goals | ⏳ Pending |
| Reports | ⏳ Pending |

---

## 🎯 Future Enhancements

- Expense Analytics
- Budget Alerts
- Monthly Reports
- Graphical Dashboard
- Export Reports (PDF/Excel)
- Email Notifications
- Cloud Deployment
- Mobile Responsive UI

---

## 👨‍💻 Author

**Karuna**

B.Tech – Computer Science & Engineering (AI & ML)

---

## 📄 License

This project is developed for educational and internship purposes.

```

---

## ✅ After pasting this

1. Save it as **`README.md`** in the root of your repository.
2. Commit and push it if you're ready.

**Next**, we'll create **`PROJECT_SCOPE.md`**, followed by **`DATABASE_SCHEMA.md`**, **`ANALYSIS.md`**, and finally **`MILESTONE_1_REPORT.md`**, all tailored to your actual implementation.
