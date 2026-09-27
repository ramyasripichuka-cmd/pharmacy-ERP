import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, SessionLocal, Base
from .seed_data import seed_database
from .routes import medicines, vendors, orders, analytics, negotiation, store

# Ensure tables exist
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed database on application startup if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="LifeCare Pharmacy ERP & AI Restock API",
    description="Enterprise Backend for Pharmacy ERP with Autonomous Vendor Bargaining, Order Tracking & Demand Forecasting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration to allow seamless connection from Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev (http://localhost:5173, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(medicines.router)
app.include_router(vendors.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(negotiation.router)
app.include_router(store.router)

@app.get("/", tags=["Health & Status"])
def root():
    return {
        "status": "online",
        "service": "LifeCare Pharmacy ERP API",
        "docs": "/docs",
        "version": "1.0.0",
        "timestamp": "2026-09-26T12:00:00Z"
    }

@app.get("/health", tags=["Health & Status"])
def health_check():
    return {"status": "healthy", "database": "sqlite_connected"}
