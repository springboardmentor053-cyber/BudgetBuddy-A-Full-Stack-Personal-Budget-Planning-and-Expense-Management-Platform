\# BudgetBuddy 💰



A full-stack personal budget planning and expense management platform that helps users track income and expenses, manage monthly budgets, monitor savings goals, receive financial notifications, and generate financial reports.



\---



\## 🚀 Project Overview



\*\*BudgetBuddy\*\* is designed to provide users with a simple and organized way to manage their personal finances.



The application provides a responsive frontend connected to a Django REST API backend. Users can securely register and log in, manage their financial transactions, create budgets and savings goals, view financial analytics, receive notifications, and export financial reports.



\---



\## 🏗️ System Architecture



BudgetBuddy follows a \*\*client-server architecture\*\* with a React frontend and Django REST Framework backend.



```text

┌─────────────────────────┐

│      React Frontend     │

│                         │

│ Dashboard               │

│ Income \& Expenses       │

│ Budgets                 │

│ Savings Goals           │

│ Notifications           │

│ Reports \& Analytics     │

└────────────┬────────────┘

&#x20;            │

&#x20;            │ REST API

&#x20;            ▼

┌─────────────────────────┐

│   Django REST Backend   │

│                         │

│ Authentication          │

│ Income APIs             │

│ Expense APIs            │

│ Budget APIs             │

│ Savings APIs            │

│ Notification APIs       │

│ Analytics \& Reports     │

└────────────┬────────────┘

&#x20;            │

&#x20;            ▼

┌─────────────────────────┐

│        Database         │

│                         │

│ Users                   │

│ Income                  │

│ Expenses                │

│ Budgets                 │

│ Savings Goals           │

│ Notifications           │

└─────────────────────────┘

```



\---



\## ✨ Key Features



\### 🔐 User Authentication



\* User registration and login

\* JWT-based authentication

\* Authenticated user profile

\* Secure API access

\* User-specific financial data



\### 💰 Income Management



\* Add income records

\* View income history

\* Update income records

\* Delete income records

\* Track total income



\### 💸 Expense Management



\* Add and manage expenses

\* Categorize expenses

\* Update and delete expenses

\* Track total expenses

\* Monitor spending patterns



\### 📊 Financial Dashboard



The dashboard provides an overview of the user's financial situation, including:



\* Total income

\* Total expenses

\* Current balance

\* Financial trends

\* Expense analysis

\* Budget information

\* Savings goals

\* Notifications and alerts



\### 📋 Budget Management



Users can:



\* Create monthly budgets

\* Set category-wise spending limits

\* Monitor budget usage

\* Track expenses against budget limits

\* Receive budget-related notifications



\### 🎯 Savings Goals



\* Create savings goals

\* Set target amounts

\* Track saved amounts

\* Update savings progress

\* Monitor goal completion



\### 🔔 Notifications



BudgetBuddy provides notifications for important financial events such as:



\* Budget alerts

\* Spending-related notifications

\* Savings goal updates

\* Other important account activities



\### 📈 Reports \& Analytics



Users can view financial information through:



\* Financial summaries

\* Expense reports

\* Income reports

\* Spending analytics

\* Monthly financial information

\* Combined financial summaries



\### 📥 CSV Export



Financial reports can be exported as CSV files for further analysis and record keeping.



\---



\## 🛠️ Technology Stack



\### Frontend



\* React.js

\* JavaScript

\* HTML5

\* CSS3

\* Vite



\### Backend



\* Python

\* Django

\* Django REST Framework

\* JWT Authentication



\### Database



\* SQLite



\### Development Tools



\* Git

\* GitHub

\* Postman

\* Visual Studio Code



\---



\## 📂 Project Structure



```text

BudgetBuddy/

│

├── backend/

│   ├── config/

│   ├── apps/

│   ├── manage.py

│   └── requirements.txt

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── services/

│   │   └── styles/

│   ├── package.json

│   └── vite.config.js

│

├── Screenshots/

│

├── .gitignore

├── README.md

├── SETUP.md

└── DEVELOPER\_GUIDE.md

```



\---



\## ⚙️ Installation \& Setup



\### 1. Clone the repository



```bash

git clone https://github.com/springboardmentor053-cyber/BudgetBuddy-A-Full-Stack-Personal-Budget-Planning-and-Expense-Management-Platform.git

```



\### 2. Open the project



```bash

cd BudgetBuddy-A-Full-Stack-Personal-Budget-Planning-and-Expense-Management-Platform

```



\---



\## 🐍 Backend Setup



Navigate to the backend directory:



```bash

cd backend

```



Create a virtual environment:



```bash

python -m venv venv

```



Activate the virtual environment on Windows:



```powershell

venv\\Scripts\\activate

```



Install dependencies:



```bash

pip install -r requirements.txt

```



Run migrations:



```bash

python manage.py migrate

```



Start the Django development server:



```bash

python manage.py runserver

```



The backend will normally be available at:



```text

http://127.0.0.1:8000/

```



\---



\## ⚛️ Frontend Setup



Open another terminal and navigate to the frontend:



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



The frontend will normally be available at:



```text

http://localhost:5173/

```



\---



\## 🔑 Environment Configuration



\### Backend



Create a `.env` file inside the `backend` directory.



Example:



```env

SECRET\_KEY=your-secret-key

DEBUG=True

DATABASE\_URL=sqlite:///db.sqlite3

```



If email notifications are configured, add the required SMTP settings:



```env

EMAIL\_HOST=smtp.gmail.com

EMAIL\_PORT=587

EMAIL\_USE\_TLS=True

EMAIL\_HOST\_USER=your-email@gmail.com

EMAIL\_HOST\_PASSWORD=your-app-password

DEFAULT\_FROM\_EMAIL=your-email@gmail.com

```



\### Frontend



Create a `.env` file inside the `frontend` directory:



```env

VITE\_API\_URL=http://localhost:8000/api

```



> \*\*Important:\*\* Never commit real passwords, API keys, Django secret keys, or email credentials to GitHub.



\---



\## 🔌 Important API Endpoints



\### Authentication



| Method | Endpoint              | Description                  |

| ------ | --------------------- | ---------------------------- |

| POST   | `/api/auth/register/` | Register a new user          |

| POST   | `/api/auth/login/`    | Authenticate a user          |

| GET    | `/api/auth/me/`       | Get current user information |



\### Dashboard \& Analytics



| Method | Endpoint                    | Description                              |

| ------ | --------------------------- | ---------------------------------------- |

| GET    | `/api/analytics/dashboard/` | Retrieve dashboard financial information |



\### Reports



| Method | Endpoint                          | Description                            |

| ------ | --------------------------------- | -------------------------------------- |

| GET    | `/api/reports/monthly-financial/` | Retrieve monthly financial information |

| GET    | `/api/reports/expenses/`          | Retrieve expense information           |

| GET    | `/api/reports/combined-summary/`  | Retrieve combined financial summary    |



> Additional endpoints are available for income, expenses, budgets, savings goals, notifications, and other application functionality.



\---



\## 🧪 Testing



Backend tests can be executed using Django's test framework:



```bash

cd backend

python manage.py test

```



\---



\## 📸 Project Screenshots



Screenshots demonstrating the application's features are available in the `Screenshots` directory.



The project includes screenshots for areas such as:



\* Login

\* Dashboard

\* Income management

\* Expense management

\* Budgets

\* Savings goals

\* Notifications

\* Reports

\* Analytics



\---



\## 👩‍💻 Development



BudgetBuddy was developed as a collaborative full-stack project.



The project follows a modular structure where the frontend and backend communicate through REST APIs.



\---



\## 🔒 Security



Security considerations include:



\* JWT-based authentication

\* Environment-based secret configuration

\* Protected API endpoints

\* Separation of frontend and backend

\* Sensitive credentials excluded from source configuration



\---



\## 📌 Project Status



\### Milestone 1



\* Project setup

\* Basic frontend and backend structure

\* Authentication foundation

\* Initial application screens



\### Milestone 2



\* Income management

\* Authentication improvements

\* Financial summary

\* API integration

\* Expense and budget functionality



\### Milestone 3



\* Savings goals

\* Notifications

\* Financial analytics

\* Reports

\* CSV export

\* Dashboard improvements



\---



\## 🌟 Future Enhancements



Potential future improvements include:



\* Advanced financial analytics

\* Improved charts and visualizations

\* Mobile application

\* Cloud database integration

\* More personalized financial insights

\* Additional export formats

\* Enhanced notification preferences



\---



\## 📄 License



This project was developed as an academic/project-based full-stack application.



\---



\## 💰 BudgetBuddy



\*\*Track your money. Plan your future. Spend smarter.\*\*



