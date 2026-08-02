# BudgetBuddy 💰 — Full-Stack Personal Budget Planning and Expense Management Platform

BudgetBuddy is a comprehensive, multi-tenant personal finance management platform designed to help users—specifically students—manage pocket money, track custom expense flows, enforce categorical budgets, monitor personal savings targets, and generate automated financial data views for peak financial discipline.

---

## 🚀 Project Status: Milestone Dashboard

| Phase | Milestone Description | Status | Deliverables Completed |
| :--- | :--- | :--- | :--- |
| **Milestone 1** | Requirements, Core Relational DB Design & Auth Setup | ✅ **COMPLETED** | Initialized backend architecture skeleton, configured strict Simple-JWT token validation layers, deployed user management app tables, and generated React frontend auth context interceptors. |
| **Milestone 2** | Expense & Income Engine with Advanced Data Lookups | ✅ **COMPLETED** | Deployed robust multi-tenant Expense CRUD logic, implemented strict UPPERCASE choice constraints, configured dynamic category filtering, integrated database row sorting, and verified calculation totals. |
| **Milestone 3** | Savings Goals & Real-Time Event Alerts | ⏳ *Pending* | Goal creation metrics, milestone visual tracking, and automated threshold alerts. |
| **Milestone 4** | Analytics Dashboard, Suite Testing & Cloud Deployment | ⏳ *Pending* | Chart trends, automated Excel export parameters, unit testing coverage, and production staging. |

---

## 🛠️ Enterprise Tech Stack

* **Frontend Environment:** React.js, Tailwind CSS utilities, Axios client interceptors, React Router
* **Backend Architecture:** Python, Django REST Framework (DRF) engine
* **Database Management System:** SQLite relational file system (Local Dev Staging)
* **Session Security Pipeline:** JWT (JSON Web Tokens) with automated bearer validation headers

---

## 📦 Features & Deep-Dive System Modules

### 1. Deployed Core Features (Milestones 1 & 2 Completed)
* **Secure User Authentication:** Endpoints reject unauthenticated operations with standardized `401 Unauthorized` responses to protect user rows.
* **Complete Expense CRUD System Engine:**
  * Interactive database state management supporting full resource create, read, update, and delete actions.
  * Explicit data field serialization parameters mapped to keys (`title`, `amount`, `category`, `description`, `expense_date`).
* **Advanced Query Optimization:**
  * **Categorical Filtering:** Live query lookups supporting dynamic value extractions (e.g., `/api/expenses/tracking/?category=FOOD`).
  * **Relational Sorting:** Integrated dataset ordering frameworks supporting field-based prioritization sorting logic (`?ordering=-expense_date` or `?ordering=amount`).
  * **Metric Aggregations:** Active background total utility calculations returning instant user expense metrics.

### 2. Upstream Pending Modules (Milestone 3+ Roadmap)
* **Income Management Matrix:** Tracking stream allocations for student scholarships and freelancing records.
* **Budget Allocator:** Multi-tiered category budget caps with instant limit breach triggers.
* **Savings Goal Grid:** Deadline trackers for asset goals like emergency capital pools.
* **Interactive Analytics Engine:** Rich data visualizations outlining historical trend maps.

---

## 🔌 Fully Verified Milestone 2 API Routing Maps

All endpoints have been rigorously validated via Postman collections using authenticated user Bearer Token headers.

### Core Routing Registries
| Method | Endpoint Target Path | Request Body Parameters | Query Parameter Options | Response Code |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login/` | `{"username", "password"}` | None | `200 OK` (Returns JWT) |
| **GET** | `/api/expenses/tracking/` | None | None | `200 OK` (Lists user's data) |
| **POST** | `/api/expenses/tracking/` | `{"title", "amount", "category", ...}`| None | `201 Created` (Saves to DB) |
| **GET** | `/api/expenses/tracking/` | None | `?category=FOOD` | `200 OK` (Filtered array) |
| **GET** | `/api/expenses/tracking/` | None | `?ordering=-amount` | `200 OK` (Sorted array) |
| **PUT** | `/api/expenses/tracking/{id}/`| `{"title", "amount", ...}` | None | `200 OK` (Updates row) |
| **DELETE**| `/api/expenses/tracking/{id}/`| None | None | `204 No Content` (Purges row) |

---

## 📐 Strict Database Choice System Constraints
The tracking system validates data submissions against strict relational categorization protocols:
* 🍔 `FOOD` | ✈️ `TRAVEL` | 🛍️ `SHOPPING` | 📚 `EDUCATION` | 🎬 `ENTERTAINMENT` | 🩺 `HEALTHCARE` | 🧾 `BILLS` | ⚙️ `MISCELLANEOUS`

---

## 🔐 Multi-Tenant Security & Row Isolation
The platform overrides core framework query handlers to guarantee total data privacy:
```python
def get_queryset(self):
    # Returns rows strictly matching the authenticated user model session
    return Expense.objects.filter(user=self.request.user)