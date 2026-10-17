# DATABASE_SETUP.md — Khushbu Electronic Store MongoDB Integration Guide

> **Khushbu Electronic Store - Enterprise Inventory & Asset Management System**

---

## 1. MongoDB Database Configuration

| Property | Value |
|---|---|
| **Database name** | `khushbu_electronic_store` |
| **ODM / Client** | Mongoose (`^9.11.2`) & Native MongoDB Driver |
| **Default URI** | `mongodb://127.0.0.1:27017/khushbu_electronic_store` |
| **Atlas / Cloud Support** | Supported via `MONGODB_URI` environment variable |
| **Resilient Mode** | In-memory cache fallback active if MongoDB is offline |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 BROWSER (Next.js / React)                   │
│   InventoryContext.tsx → in-memory state + localStorage     │
│   JWT Token in Authorization Header: Bearer <token>         │
│   Syncs with Express backend via /api/state (GET & PUT)     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (localhost:3000 → localhost:8081)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             Node.js & Express.js Backend (Port 8081)        │
│   AuthRoutes       POST /api/auth/login    → Issue JWT      │
│                    POST /api/auth/register → Create User    │
│                    GET  /api/auth/me       → Verify JWT     │
│   StateRoutes      GET  /api/state         → PortalState    │
│                    PUT  /api/state         → Atomic Save    │
│   AssetRoutes      GET  /api/assets        → List & Search  │
│                    POST /api/assets        → Register Asset │
│   HealthRoutes     GET  /api/health        → System Status  │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose connection pool
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               MongoDB: khushbu_electronic_store              │
│   Collections:                                              │
│     - users         (credentials, bcrypt hash, roles)       │
│     - assets        (electronic items, serials, warranties) │
│     - portalstates  (full atomic enterprise state snapshot) │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Environment Variables (.env)

```env
# Server Port
PORT=8081

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/khushbu_electronic_store

# JWT Authentication
JWT_SECRET=khushbu_electronic_store_super_secure_jwt_token_secret_key_2026
JWT_EXPIRES_IN=7d

# Frontend API URL
VITE_API_URL=http://localhost:8081
NEXT_PUBLIC_API_URL=http://localhost:8081
```

---

## 4. How to Run MongoDB Locally

### Option A: Local MongoDB Community Service
If you have MongoDB installed:
```powershell
net start MongoDB
```

### Option B: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name aes-mongo mongo:latest
```

### Option C: MongoDB Atlas (Cloud)
In `.env`, set:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/khushbu_electronic_store?retryWrites=true&w=majority
```

If MongoDB is not running, the server automatically operates in resilient mode without crashing!
