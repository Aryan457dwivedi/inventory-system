# Nexus — Inventory & Order Management System

A production-ready full-stack inventory and order management system built with React 18, FastAPI, and PostgreSQL — fully containerized with Docker and deployed on Railway + Vercel.

---

## Submission Links

| Deliverable | URL |
|---|---|
| **GitHub Repository** | https://github.com/Aryan457dwivedi/inventory-system |
| **Docker Hub Image** | https://hub.docker.com/r/aryannn5/inventory-backend |
| **Live Frontend** | https://inventory-system-one-teal.vercel.app |
| **Live Backend API** | https://inventory-system-production-8fc7.up.railway.app |
| **API Docs (Swagger)** | https://inventory-system-production-8fc7.up.railway.app/docs |

---
## Known Issues

- The backend is deployed on Railway's free tier. Due to occasional regional/network restrictions and cold starts, the API and Swagger documentation may take a few seconds to respond or may be temporarily inaccessible from certain networks.
- The frontend remains fully connected to the backend under normal operation.

---
## Tech Stack

| Layer | Technology | Choice |
|---|---|---|
| Frontend | React 18, React Router v6, Axios | Vercel |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2 | Railway |
| Database | PostgreSQL 16 | Railway (managed) |
| Containerization | Docker, Docker Compose | — |
| Backend Image | Docker Hub (`aryannn5/inventory-backend`) | — |

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   └── connection.py     # SQLAlchemy engine, session, Base
│   │   ├── models/
│   │   │   └── __init__.py       # Product, Customer, Order, OrderItem
│   │   ├── routers/
│   │   │   ├── products.py       # CRUD + dashboard endpoint
│   │   │   ├── customers.py      # CRUD
│   │   │   └── orders.py         # Create, list, detail, cancel
│   │   ├── schemas/
│   │   │   └── __init__.py       # Pydantic request/response schemas
│   │   └── main.py               # FastAPI app, CORS, router registration
│   ├── Dockerfile                 # python:3.12-slim, non-root user
│   ├── requirements.txt
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js          # Axios client, all API calls
│   │   ├── pages/
│   │   │   ├── Dashboard.js      # KPI cards, low stock panel, status panel
│   │   │   ├── Products.js       # Add / edit / delete products
│   │   │   ├── Customers.js      # Add / delete customers
│   │   │   └── Orders.js         # Create order, view detail, cancel
│   │   ├── App.js                # Sidebar layout, React Router
│   │   └── index.css             # Design system — Inter + JetBrains Mono
│   ├── public/
│   │   └── index.html
│   ├── Dockerfile                 # Multi-stage: node:18-slim → nginx:alpine
│   ├── .env.production            # DISABLE_ESLINT_PLUGIN=true
│   └── .dockerignore
├── docker-compose.yml             # 3 services: postgres, backend, frontend
├── .env.example
└── .gitignore
```

---

## API Reference

### Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List all products |
| `POST` | `/products` | Create a product |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update product |
| `DELETE` | `/products/{id}` | Delete product |
| `GET` | `/products/dashboard` | Dashboard stats + low stock list |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/customers` | List all customers |
| `POST` | `/customers` | Create a customer |
| `GET` | `/customers/{id}` | Get customer by ID |
| `DELETE` | `/customers/{id}` | Delete customer |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders` | List all orders |
| `POST` | `/orders` | Create order (deducts stock) |
| `GET` | `/orders/{id}` | Get order with full item detail |
| `DELETE` | `/orders/{id}` | Cancel order (restores stock) |

Full interactive docs at `/docs` (Swagger UI) and `/redoc`.

---

## Business Logic

- **SKU uniqueness** — duplicate SKUs rejected at API and DB level
- **Email uniqueness** — duplicate customer emails rejected
- **Stock validation** — orders fail with a clear error if requested quantity exceeds available stock
- **Row-level locking** — `SELECT FOR UPDATE` used on product rows during order creation to prevent race conditions
- **Auto stock deduction** — placing an order immediately reduces product quantities
- **Stock restoration** — cancelling an order returns quantities back to inventory
- **Server-side total** — order total calculated from live product prices at time of order, not from client

---

## Running Locally with Docker

```bash
# 1. Clone
git clone https://github.com/Aryan457dwivedi/inventory-system.git
cd inventory-system

# 2. Set up environment
cp .env.example .env
# Edit .env if needed (defaults work out of the box)

# 3. Build and start all 3 services
docker-compose up --build

# 4. Access
# Frontend:   http://localhost:3000
# Backend:    http://localhost:8000
# API Docs:   http://localhost:8000/docs
```

**Services started by Docker Compose:**
- `inventory_db` — PostgreSQL 16 on port 5432 with named volume
- `inventory_backend` — FastAPI on port 8000, waits for DB healthcheck
- `inventory_frontend` — React build served via nginx on port 3000

---

## Deployment Setup

### Database — Railway PostgreSQL

1. Created a new Railway project
2. Added a **PostgreSQL** service — Railway provisions it instantly
3. Copied the **internal** `DATABASE_URL` from the Postgres service Variables tab
4. Used the internal URL (not the public one) to avoid egress fees

### Backend — Railway (GitHub deploy)

1. Added a new **GitHub Repo** service in the same Railway project
2. Set **Root Directory** to `backend`
3. Railway auto-detected the `Dockerfile` and built it
4. Added environment variable:
   - `DATABASE_URL` = internal Postgres URL from above
5. Generated a public domain under **Settings → Networking**
6. Live at: `https://inventory-system-production-8fc7.up.railway.app`

### Docker Hub Image

```bash
docker login
docker build -t aryannn5/inventory-backend ./backend
docker push aryannn5/inventory-backend
```

Image: `https://hub.docker.com/r/aryannn5/inventory-backend`

### Frontend — Vercel (GitHub deploy)

1. Imported the `inventory-system` GitHub repo on Vercel
2. Set **Root Directory** to `frontend`
3. Added environment variables:
   - `REACT_APP_API_URL` = `https://inventory-system-production-8fc7.up.railway.app`
   - `CI` = `false` (to prevent ESLint warnings failing the build)
4. Vercel auto-builds on every push to `main`
5. Live at: `https://inventory-system-one-teal.vercel.app`

---

## Local Development (without Docker)

### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Set your local Postgres URL
set DATABASE_URL=postgresql://inventory_user:inventory_pass@localhost:5432/inventory_db

uvicorn app.main:app --reload
# API runs at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
# Create a .env.local file with:
# REACT_APP_API_URL=http://localhost:8000
npm start
# App runs at http://localhost:3000
```

---

## Environment Variables

| Variable | Used By | Description |
|---|---|---|
| `DATABASE_URL` | Backend | Full PostgreSQL connection string |
| `POSTGRES_DB` | Docker Compose | Database name (default: `inventory_db`) |
| `POSTGRES_USER` | Docker Compose | DB user (default: `inventory_user`) |
| `POSTGRES_PASSWORD` | Docker Compose | DB password |
| `REACT_APP_API_URL` | Frontend | Backend base URL |
| `CI` | Vercel build | Set to `false` to allow ESLint warnings |
