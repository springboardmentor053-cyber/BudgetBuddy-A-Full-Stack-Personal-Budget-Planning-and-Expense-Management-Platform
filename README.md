# 💰 BudgetBuddy – Personal Budget Planning & Expense Management Platform

## 📌 Overview

BudgetBuddy is a web-based Personal Budget Planning and Expense Management Platform designed to help users efficiently manage their income, expenses, budgets, and financial goals. The application provides an intuitive interface for tracking daily transactions, analyzing spending patterns, and generating insightful reports to improve financial decision-making.

The project is built using **Python (Django)** for the backend and **HTML, CSS, JavaScript, and Bootstrap** for the frontend, with **SQLite** as the database.

---

## ✨ Features

- 👤 User Registration & Secure Authentication
- 💵 Income Management
- 💳 Expense Tracking
- 📊 Budget Creation & Monitoring
- 📈 Financial Dashboard
- 📅 Monthly & Yearly Reports
- 🔍 Transaction History
- 🏷️ Expense Categorization
- 📤 Data Export (CSV/PDF if implemented)
- 🔒 Secure User Sessions
- 📱 Responsive User Interface

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- Bootstrap
- JavaScript

### Backend
- Python
- Django

### Database
- SQLite3

### Tools
- Git
- GitHub
- VS Code
- Django Admin

---

## 📂 Project Structure

```
BudgetBuddy/
│
├── accounts/
├── expenses/
├── income/
├── budgets/
├── reports/
├── templates/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
├── media/
├── db.sqlite3
├── manage.py
├── requirements.txt
└── README.md
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/BudgetBuddy.git
```

### 2. Navigate to the Project Folder

```bash
cd BudgetBuddy
```

### 3. Create a Virtual Environment

**Windows**

```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Run the Development Server

```bash
python manage.py runserver
```

Open your browser and visit:

```
http://127.0.0.1:8000/
```

---

## 📊 Modules

### User Management
- User Registration
- Login
- Logout
- Profile Management

### Income Management
- Add Income
- Edit Income
- Delete Income
- View Income History

### Expense Management
- Add Expenses
- Edit Expenses
- Delete Expenses
- Categorize Expenses

### Budget Management
- Create Monthly Budget
- Budget Alerts
- Budget Tracking

### Reports
- Monthly Expense Summary
- Income vs Expense Report
- Budget Utilization
- Spending Trends

---

## 📈 Dashboard

The dashboard provides:

- Total Income
- Total Expenses
- Remaining Balance
- Budget Utilization
- Recent Transactions
- Expense Category Breakdown
- Monthly Financial Summary

---

## 📷 Screenshots

Add screenshots of:

- Login Page
- Dashboard
- Income Page
- Expense Page
- Budget Page
- Reports

Example:

```
screenshots/
├── login.png
├── dashboard.png
├── income.png
├── expenses.png
├── reports.png
```

---

## 🔐 Authentication

BudgetBuddy uses Django's built-in authentication system to provide:

- Secure Password Hashing
- User Login
- Session Management
- Access Control

---

## 📦 Requirements

Example:

```
Django
Pillow
django-crispy-forms
crispy-bootstrap5
```

Install using:

```bash
pip install -r requirements.txt
```

---

## 🎯 Future Enhancements

- Email Notifications
- SMS Budget Alerts
- AI-Based Expense Prediction
- Expense OCR (Receipt Scanner)
- Recurring Transactions
- Mobile Application
- Multi-Currency Support
- Data Visualization with Charts
- Export Reports to Excel & PDF
- Cloud Database Integration

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Create a Pull Request

---

## 👩‍💻 Author

**Swathi Polavaram**

- B.Tech – Computer Science & Data Science
- LinkedIn: https://www.linkedin.com/in/swathi-polavaram-7787b02a6

---

## 📄 License

This project is developed for educational and learning purposes.

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to contribute!
