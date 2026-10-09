# VendorSync AI (Vendor Score Lab)

A modern vendor intelligence and risk evaluation platform featuring real-time risk scoring, performance telemetry, explainable risk factor attribution, and procurement relationship management.

---

## Architecture Overview

- **Backend**: FastAPI (Python 3.12 / 3.14) running on Uvicorn with SQLite persistence, JWT authentication (Cookies & Bearer headers), and explainable scoring heuristics.
- **Frontend**: Full React single-page app bundled with Recharts interactive visualizations, Lucide icons, responsive navigation, and procurement metrics.
- **Unified Delivery**: The FastAPI backend directly serves the compiled static frontend application on `/`, routing all API calls to `/api`.

---

## Quick Start

### 1. Launch the Backend Server

Double-click `start.bat` or run in PowerShell:
```powershell
.\start.ps1
```
Or run directly with the virtual environment:
```powershell
.\.venv\Scripts\python.exe run_server.py
```

### 2. Access the Application

- **Web Dashboard**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### 3. Default Demo Credentials

- **Email**: `admin@vendorsync.ai`
- **Password**: `admin123`
*(You can also click "Create account" to register new procurement manager accounts.)*

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`)
- `POST /api/auth/login` — Sign in with credentials, sets secure `access_token` cookie
- `GET /api/auth/me` — Retrieve currently authenticated user profile
- `POST /api/auth/logout` — Invalidate session and clear auth cookies

### Dashboard & Analytics
- `GET /api/dashboard` — Network summary statistics, vendor watchlist, and 6-month score trends

### Vendor Management
- `POST /api/vendors` — Register a new vendor with automated initial telemetry and weighted score
- `DELETE /api/vendors/{id}` — Delete a vendor and associated notes/orders
- `GET /api/vendors/{id}/profile` — Vendor detailed profile, performance history, orders, and relationship notes
- `POST /api/vendors/{id}/notes` — Add a relationship note for a vendor
- `DELETE /api/vendors/{id}/notes/{note_id}` — Remove a relationship note

### Risk Intelligence Prediction Engine
- `POST /api/risk/predict` — Runs explainable multi-signal assessment (`vendor_id`), returning risk tier (`Low`, `Medium`, `High`), numeric score, driving factors, and strategic procurement recommendations.

---

## Connecting External / Preview Frontends

If you want an external frontend (such as the Emergent preview or a separate React dev server) to connect to your local backend process:
1. Ensure the backend is running on `http://localhost:8000`.
2. Configure `REACT_APP_BACKEND_URL=http://localhost:8000` in your frontend environment.
3. CORS is pre-configured with wildcard origin regex and credentials enabled (`allow_credentials=True`).
