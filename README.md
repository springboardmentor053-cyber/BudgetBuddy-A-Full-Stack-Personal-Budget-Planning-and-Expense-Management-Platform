# BudgetBuddy — Full-Stack Student Finance Tracker

A secure personal finance application featuring a Django REST Framework backend and a React frontend workspace.

---

## 🔒 Milestone 1: User Authentication & Security Foundations
- **JWT Token Authentication:** Implemented secure user registration and login pipelines.
- **Payload Verification:** Endpoints reject unauthenticated operations with an `HTTP 401 Unauthorized` standard wrapper.

---

## 📊 Milestone 2: Expense & Income Management
- **Complete CRUD Operations:** Deployed secure resource endpoints supporting full `POST`, `GET`, `PUT`, and `DELETE` capability.
- **Query Filtering Engine:** Built custom ORM parameters enabling dynamic data lookups by category (e.g., `?category=FOOD`).
- **Postman Validation:** All functional routines verified successfully using Bearer Authorization tokens.