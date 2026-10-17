# Khushbu Electronic Store — Retail Inventory & POS Web Application

A full-stack, responsive retail management web application connected to **MongoDB** with an **Express.js API backend** and a **Vite + React 19 + Tailwind CSS frontend**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: $\ge 18$ (Tested on Node v24.12.0)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017` (MongoDB Windows service is active on your system)

### 2. Start Both Backend & Frontend Concurrently
From either the workspace root or the `Task2-frontend-update` folder, run:

```bash
npm run dev
```

This single command boots both services together via `concurrently`:
- **Frontend (Vite + React)**: [http://localhost:47190](http://localhost:47190)
- **Backend (Node/Express API)**: [http://localhost:47191](http://localhost:47191)
- **Vite Proxy**: All frontend requests to `/api/*` are automatically proxied to `http://localhost:47191/api/*`

---

## 🔑 Login Credentials

The database is pre-seeded with initial store users and retail inventory:

| Role | Employee Code | Email | Password | Access Level |
|---|---|---|---|---|
| **Store Manager (Admin)** | `STR-MGR-01` | `store.manager@khushbu.com` | `admin123` | Full access: product creation/editing/deactivation, inventory adjustments, POS sales, sales history & profit margins |
| **Store Staff** | `STAFF-01` | `staff@khushbu.com` | `staff123` | Sales POS checkout, stock receiving, product catalog browsing & low-stock alerts |

*(Quick demo button "Fill demo login" is also available on the sign-in screen)*

---

## 🗄️ MongoDB Database Architecture

- **Database Name**: `khushbu_electronic_store`
- **Connection URI**: `mongodb://127.0.0.1:27017/khushbu_electronic_store`
- **ODM**: Mongoose with atomic concurrency guarantees

### Collections:
1. `products`: Retail catalog with SKU, unit price, cost price, available stock, reorder levels, categories, and barcodes.
2. `users`: Store managers and staff with bcrypt password hashing and JWT authentication.
3. `sales`: Invoices with auto-generated atomic numbers (`INV-YYMMDD-XXXX`), customer details, payment methods, discounts, and taxes.
4. `inventorymovements`: Immutable audit ledger tracking every stock addition, deduction, checkout sale, or adjustment.

---

## 📱 Responsive Design Highlights

- **Desktop**: Full layout with sticky sidebar navigation, multi-column metric grids, side-by-side POS catalogue and receipt panel.
- **Tablet**: Adaptive 2-column card layouts, auto-scrolling data tables.
- **Mobile**: Hamburger sliding navigation drawer, touch-friendly POS buttons, and floating bottom sticky bar for mobile cart checkout.

---

## 🛠️ API Endpoints Summary

- `POST /api/auth/login`: Authenticate and issue JWT
- `GET /api/auth/me`: Profile lookup
- `GET /api/products`: Search, category filter, and stock level filtering
- `POST /api/products`: Create new product (Admin)
- `PUT /api/products/:id`: Update product info (Admin)
- `PATCH /api/products/:id/deactivate`: Toggle product active/deactivated
- `GET /api/inventory/low-stock`: Critical out-of-stock and reorder shortfall alerts
- `POST /api/inventory/adjustments`: Audit-logged stock receipts and manual corrections
- `GET /api/inventory/movements`: Full audit log of stock movements
- `POST /api/sales`: Atomic sale creation, zero-negative stock deduction, and tax invoice generation
- `GET /api/sales`: Sales invoices with search and date filters
- `GET /api/reports/sales`: Revenue, transactions, units, and top-selling products
- `GET /api/reports/profit`: Gross profit, COGS, and profit margin breakdown
- `GET /api/health`: Health status of Express server and MongoDB connection
