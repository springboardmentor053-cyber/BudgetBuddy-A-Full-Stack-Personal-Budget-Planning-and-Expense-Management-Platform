# Milestone 4 - Screenshots and Verification Evidence Guide

This folder contains the required screenshots and submission artifacts for **Milestone 4: Analytics, Testing & Deployment** (Week 7 & 8).

---

## Required Screenshots Checklist

| # | Screenshot Name | Feature / View Covered | How to Capture |
|---|-----------------|------------------------|----------------|
| **1** | `Milestone 4 - Dashboard Overview.jpeg` | Financial Summary (Total Income, Total Expenses, Current Balance, Total Savings, Budget Status, Recent Activity) | Log in to frontend at `http://localhost:5173/dashboard` and capture top overview section. |
| **2** | `Milestone 4 - Analytics Charts and Visualizations.jpeg` | 5 Visualizations: Monthly Expense Trend (Line), Category Distribution (Pie/Doughnut), Income vs Expense (Bar), Savings Goal Progress, Budget Usage | Capture charts and progress sections on `http://localhost:5173/dashboard`. |
| **3** | `Milestone 4 - Reports and Summaries.jpeg` | Financial Reports page, monthly breakdowns, and PDF report download functionality | Visit `http://localhost:5173/reports` and capture generated report and PDF download button. |
| **4** | `Milestone 4 - Automated Test Suite Results.jpeg` | Automated Test Suite (51/51 tests passing across Users, Expenses, Income, Budgets, Notifications, Analytics, Reports) | Run `python run_milestone4_tests.py` in your terminal and screenshot the full passing output table. |
| **5** | `Milestone 4 - Error Handling and Validations.jpeg` | Meaningful error handling on Login/Register validation and required fields | Attempt login with invalid credentials on `/login` or empty fields on `/register`. |
| **6** | `Milestone 4 - Deployment and Production Config.jpeg` | Production deployment configuration (`render.yaml`, `vercel.json`, `.env.example`, CORS / SSL settings) | Screenshot `render.yaml` / `.env.example` or your Render / Vercel deployment dashboard. |

---

## Test Verification Command
To run all 51 automated test cases anytime:
```bash
python run_milestone4_tests.py
```
Or via Django:
```bash
python backend/manage.py test users expenses income budgets notifications analytics reports
```
