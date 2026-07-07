# 🗄️ Database Schema

# BudgetBuddy – Personal Budget Planning & Expense Management Platform

## Introduction

The BudgetBuddy application uses a relational database to securely store user information, financial records, budgets, and reports. During development, SQLite is used as the database, while PostgreSQL is planned for future deployment.

---

# Database Overview

The database consists of the following major entities:

- Users
- Profiles
- Income
- Expenses
- Budgets
- Savings Goals
- Notifications
- Reports

---

# Entity Relationship Overview

```
User
 │
 ├── Profile
 ├── Income
 ├── Expense
 ├── Budget
 ├── Savings Goal
 ├── Notification
 └── Report
```

---

# 1. Users Table

Stores user authentication information.

| Field | Data Type | Description |
|--------|-----------|-------------|
| id | Integer | Primary Key |
| username | String | Username |
| email | String | Email Address |
| password | String | Encrypted Password |
| date_joined | DateTime | Account Creation Date |

---

# 2. Profile Table

Stores additional user information.

| Field | Data Type | Description |
|--------|-----------|-------------|
| id | Integer | Primary Key |
| user_id | Foreign Key | References User |
| phone | String | Phone Number |
| gender | String | Gender |
| profile_image | Image | Profile Picture |
| created_at | DateTime | Record Creation Time |

---

# 3. Income Table

Stores user income records.

| Field | Data Type | Description |
|--------|-----------|-------------|
| id | Integer | Primary Key |
| user_id | Foreign Key | References User |
| title | String | Income Source |
| amount | Decimal | Income Amount |
| category | String | Income Category |
| date | Date | Income Date |
| description | Text | Additional Notes |

---

# 4. Expense Table

Stores user expenses.

| Field | Data Type | Description |
|--------|-----------|-------------|
| id | Integer | Primary Key |
| user_id | Foreign Key | References User |
| title | String | Expense Title |
| amount | Decimal | Expense Amount |
| category | String | Expense Category |
| date | Date | Expense Date |
| description | Text | Additional Notes |

---

# 5. Budget Table

Stores monthly or yearly budgets.

| Field | Data Type | Description |
|--------|-----------|-------------|
| id | Integer | Primary Key |
| user_id | Foreign Key | References User |
| category | String | Budget Category |
| budget_amount | Decimal | Budget Limit |
| month | Integer | Month |
| year | Integer | Year |

---

# 6. Savings Goal Table

Stores savings goals.

| Field | Data Type | Description |
|--------|-----------|-------------|
| id | Integer | Primary Key |
| user_id | Foreign Key | References User |
| goal_name | String | Goal Title |
| target_amount | Decimal | Target Amount |
| current_amount | Decimal | Saved Amount |
| deadline | Date | Goal Deadline |
| status | Boolean | Completed or Not |

---

# 7. Notification Table

Stores application notifications.

| Field | Data Type | Description |
|--------|-----------|-------------|
| id | Integer | Primary Key |
| user_id | Foreign Key | References User |
| message | Text | Notification Message |
| is_read | Boolean | Read Status |
| created_at | DateTime | Notification Time |

---

# 8. Report Table

Stores generated reports.

| Field | Data Type | Description |
|--------|-----------|-------------|
| id | Integer | Primary Key |
| user_id | Foreign Key | References User |
| month | Integer | Report Month |
| total_income | Decimal | Total Income |
| total_expense | Decimal | Total Expenses |
| savings | Decimal | Savings |
| generated_at | DateTime | Report Generation Time |

---

# Relationships

- One User can have one Profile.
- One User can have multiple Income records.
- One User can have multiple Expense records.
- One User can create multiple Budgets.
- One User can create multiple Savings Goals.
- One User can receive multiple Notifications.
- One User can generate multiple Reports.

---

# Database Features

- Secure user authentication
- Relational database design
- Foreign key relationships
- Data consistency
- Scalable architecture
- Easy migration to PostgreSQL

---

# Current Database Status (Milestone 1)

| Module | Status |
|--------|--------|
| User Authentication | ✅ Implemented |
| SQLite Configuration | ✅ Implemented |
| Database Migrations | ✅ Completed |
| Admin Panel | ✅ Configured |
| Income Table | 🚧 Planned |
| Expense Table | 🚧 Planned |
| Budget Table | 🚧 Planned |
| Savings Goals | 🚧 Planned |
| Reports | 🚧 Planned |
| Notifications | 🚧 Planned |

---

# Future Improvements

- PostgreSQL deployment
- Database indexing
- Automatic backups
- Performance optimization
- Data encryption for sensitive fields

---

# Conclusion

The proposed database schema provides a scalable and secure foundation for the BudgetBuddy application. While Milestone 1 establishes the database environment and user authentication, future milestones will implement the remaining financial management modules using this schema.
