# 🏥 LifeCare Pharmacy ERP & AI Autonomous Restocking Engine

Enterprise-grade Pharmacy ERP application featuring an autonomous AI procurement agent, real-time courier order tracking, intelligent demand forecasting, and a persistent **FastAPI + SQLite** backend.

---

## 🏗️ Architecture

- **Frontend**: React 19, Vite, Lucide Icons, Vanilla CSS Design System with Glassmorphism & Micro-animations
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic v2
- **Database**: SQLite with SQLAlchemy ORM (`backend/pharmacy_erp.db`)
- **API Documentation**: Interactive Swagger UI (`http://localhost:8000/docs`) & ReDoc (`http://localhost:8000/redoc`)
- **Resilience**: Dual-mode synchronization — automatically connects to the FastAPI backend with seamless local cache fallback if offline.

---

## 🚀 Quick Start

### 1. Start the Backend API (FastAPI)
The backend runs on port `8000`:
```bash
# Using npm
npm run backend

# Or directly with Python
python run_backend.py
```
- API Base: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Start the Frontend (Vite)
In a separate terminal:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 REST API Endpoints Overview

### 💊 Medicines (`/api/medicines`)
- `GET /api/medicines` — List all medicines (supports `search` & `category` queries)
- `GET /api/medicines/{id_or_sku}` — Get single medicine details
- `POST /api/medicines` — Add new medicine to inventory
- `PUT /api/medicines/{id_or_sku}` — Update medicine details or stock
- `DELETE /api/medicines/{id_or_sku}` — Remove medicine
- `POST /api/medicines/simulate-daily-sales` — Simulates 24h patient burn across all items
- `POST /api/medicines/{sku}/urgent-stockout` — Triggers critical stockout (2 units) for testing

### 🏢 Vendors (`/api/vendors`)
- `GET /api/vendors` — List verified vendors (Apex Pharma, MedVantage, BioCare) with reliability ratings, lead times, and personas
- `GET /api/vendors/{id}` — Get single vendor details
- `GET /api/vendors/{id}/catalog` — Get vendor catalog and pricing

### 📦 Purchase Orders & Tracking (`/api/orders`)
- `GET /api/orders` — List purchase orders (sorted newest first)
- `POST /api/orders` — Create new Purchase Order from negotiated terms
- `GET /api/orders/{po_number}` — Get PO details & tracking history
- `PATCH /api/orders/{po_number}/advance` — Advance order milestone (`PO Created` → `Order Confirmed` → `Dispatched` → `In Transit` → `Out for Delivery` → `Delivered`)
- `PATCH /api/orders/{po_number}/status` — Direct status update
- `PATCH /api/orders/{po_number}/toggle-delayed` — Simulate transit delay
- `POST /api/orders/{po_number}/receive-goods` — Goods Received Note (GRN) confirmation, increments stock in inventory

### 🤖 Autonomous Bargaining AI (`/api/negotiation`)
- `POST /api/negotiation/simulate` — Multi-round negotiation simulation between Store Agent and Vendor Agent
- `POST /api/negotiation/tournament` — Run multi-vendor tournament bidding to select optimal vendor based on procurement strategy

### 📊 Analytics & Restock Audit (`/api/analytics`)
- `GET /api/analytics/stock-audit` — AI stock sizing analysis, run-out forecast, and safety stock recommendations
- `GET /api/analytics/summary` — High-level dashboard metrics (valuations, savings, active shipments)

### 🏪 Store Profile (`/api/store`)
- `GET /api/store/profile` — Store metadata, license, and budget
- `PUT /api/store/profile` — Update store details
- `POST /api/store/reset-defaults` — Reset database to clean factory demo data

---

## 🗄️ Database File
- Location: `backend/pharmacy_erp.db`
- Automatically initialized and seeded on first startup with initial medicines, vendors, and orders.
