# Nexus — Inventory & Order Management System

A production-ready full-stack inventory and order management system built with React, FastAPI, and PostgreSQL — fully containerized with Docker.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios |
| Backend | Python 3.12, FastAPI, SQLAlchemy |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Frontend Deploy | Vercel / Netlify |
| Backend Deploy | Render / Railway |

---

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system

# 2. Copy env file
cp .env.example .env
# Edit .env — change POSTGRES_PASSWORD at minimum

# 3. Build and run
docker-compose up --build

# 4. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── database/       # DB connection & session
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── routers/        # FastAPI route handlers
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   └── main.py         # App entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── pages/          # Dashboard, Products, Customers, Orders
│   │   ├── App.js          # Router & sidebar layout
│   │   └── index.css       # Design system tokens & styles
│   ├── public/
│   ├── Dockerfile          # Multi-stage: build → nginx
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products |
| POST | `/products` | Create product |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| GET | `/products/dashboard` | Dashboard stats + low stock |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List all customers |
| POST | `/customers` | Create customer |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all orders |
| POST | `/orders` | Create order (deducts stock) |
| GET | `/orders/{id}` | Get order with items |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

Interactive API docs available at `/docs` (Swagger UI).

---

## Business Logic

- **SKU uniqueness** — duplicate SKUs are rejected at the DB and API level
- **Email uniqueness** — duplicate customer emails rejected
- **Stock validation** — orders fail if requested quantity exceeds available stock
- **Auto stock deduction** — placing an order immediately reduces product quantities
- **Stock restoration** — cancelling an order returns items to inventory
- **Auto total** — order total is calculated server-side from current product prices

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. New Web Service on [render.com](https://render.com)
3. Root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `DATABASE_URL` (from Render's PostgreSQL add-on)

**Or use Docker Hub image:**
```bash
docker build -t yourusername/inventory-backend ./backend
docker push yourusername/inventory-backend
```
Set the image URL in Render's Docker deploy option.

### Database → Render PostgreSQL

1. Create a Render PostgreSQL instance (free tier)
2. Copy the `Internal Database URL`
3. Set as `DATABASE_URL` env var in your backend service

### Frontend → Vercel

```bash
cd frontend
npm install
npm run build
# Deploy the `build/` folder to Vercel
```

Or connect your GitHub repo to Vercel and set:
- Build command: `npm run build`
- Output directory: `build`
- Environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com`

### Frontend → Netlify

```bash
# netlify.toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Docker Hub

```bash
# Build and push backend image
docker build -t yourusername/inventory-backend:latest ./backend
docker push yourusername/inventory-backend:latest

# Pull and run from Docker Hub
docker pull yourusername/inventory-backend:latest
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  yourusername/inventory-backend:latest
```

---

## Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set env var
export DATABASE_URL=postgresql://user:pass@localhost:5432/inventory_db

uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```
