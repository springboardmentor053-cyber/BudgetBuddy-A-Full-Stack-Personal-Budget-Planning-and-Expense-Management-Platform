# BudgetBuddy AI Agent Guide

## Project overview
- Backend: `backend/` is a Django REST API project.
- Frontend: `frontend/` is a React + Vite + Tailwind application.
- The project is primarily an auth-driven finance dashboard with user registration, login, profile, incomes, expenses, budgets, savings goals, and notifications.

## Key architecture
- `backend/config/` contains Django settings, URLs, and WSGI/ASGI entry points.
- `backend/users/` contains the custom user app with:
  - `models.py`: custom `User` model and financial domain models.
  - `serializers.py`: registration and JWT payload customization.
  - `views.py`: register, login, token refresh, and profile endpoints.
  - `urls.py`: routes under `api/auth/`.
- `frontend/src/` contains React UI, routing, and auth context.
- `frontend/src/contexts/AuthContext.tsx` is the main auth state provider.

## Build and run
- Frontend:
  - `cd frontend`
  - `npm install`
  - `npm run dev` to start the Vite dev server
  - `npm run build` to create a production bundle
- Backend:
  - Use a Python environment with Django, djangorestframework, djangorestframework-simplejwt, and django-cors-headers installed.
  - `cd backend`
  - `python manage.py runserver` to start the API server
  - `python manage.py test` to run backend tests

## Important conventions and observations
- The backend uses `AUTH_USER_MODEL = 'users.User'`.
- JWT authentication is enabled via `rest_framework_simplejwt.authentication.JWTAuthentication`.
- Default database is SQLite (`db.sqlite3`) with environment override support in `config/settings.py`.
- Frontend API calls target `http://127.0.0.1:8000/api/auth/`.
- CORS is configured for `http://localhost:5173` only; if the frontend uses `127.0.0.1`, update backend CORS settings.
- The frontend includes an `api/axios.ts` wrapper but the example app code uses native `fetch` for auth requests.

## Testing and validation
- Backend auth flow test: `backend/tests/test_auth_flow.py`
- Test coverage currently focuses on register/login/profile behavior.

## Notes for AI agents
- There is currently no repository-level `README.md` or `copilot` instruction file.
- Prefer changes in the existing backend app structure rather than introducing a new backend layout.
- Use explicit path references when editing frontend or backend code because the workspace has separate subprojects.
- If implementing new frontend functionality, keep `frontend/src/` and `frontend/package.json` aligned with Vite+React+TypeScript conventions.
- Keep secrets and environment overrides out of source control for production readiness.
