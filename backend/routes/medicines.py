from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import time

from ..database import get_db
from ..models import Medicine
from ..schemas import MedicineCreate, MedicineUpdate, MedicineResponse, MessageResponse

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])

@router.get("", response_model=List[MedicineResponse])
def get_medicines(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Medicine)
    if category:
        query = query.filter(Medicine.category.ilike(f"%{category}%"))
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Medicine.name.ilike(search_filter)) |
            (Medicine.sku.ilike(search_filter)) |
            (Medicine.generic.ilike(search_filter))
        )
    medicines = query.all()
    return [med.to_dict() for med in medicines]

@router.get("/{med_id}", response_model=MedicineResponse)
def get_medicine(med_id: str, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter((Medicine.id == med_id) | (Medicine.sku == med_id)).first()
    if not med:
        raise HTTPException(status_code=404, detail=f"Medicine {med_id} not found")
    return med.to_dict()

@router.post("", response_model=MedicineResponse, status_code=201)
def create_medicine(med_in: MedicineCreate, db: Session = Depends(get_db)):
    # Check if SKU exists
    existing = db.query(Medicine).filter(Medicine.sku == med_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Medicine with SKU '{med_in.sku}' already exists")

    med_id = med_in.id or f"med-{int(time.time() * 1000)}"
    med_data = med_in.model_dump()
    med_data["id"] = med_id
    if not med_data.get("salesHistory"):
        med_data["salesHistory"] = [5, 6, 5, 6, 7, 5, 6]
    if not med_data.get("seasonalTrend"):
        med_data["seasonalTrend"] = {"factor": 1.10, "label": "New Listing Standard Velocity", "confidence": 90}

    new_med = Medicine(**med_data)
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    return new_med.to_dict()

@router.put("/{med_id}", response_model=MedicineResponse)
def update_medicine(med_id: str, med_in: MedicineUpdate, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter((Medicine.id == med_id) | (Medicine.sku == med_id)).first()
    if not med:
        raise HTTPException(status_code=404, detail=f"Medicine {med_id} not found")

    update_data = med_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(med, field, value)

    db.commit()
    db.refresh(med)
    return med.to_dict()

@router.delete("/{med_id}", response_model=MessageResponse)
def delete_medicine(med_id: str, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter((Medicine.id == med_id) | (Medicine.sku == med_id)).first()
    if not med:
        raise HTTPException(status_code=404, detail=f"Medicine {med_id} not found")

    name = med.name
    db.delete(med)
    db.commit()
    return {"message": f"Successfully deleted {name}", "success": True}

@router.post("/simulate-daily-sales", response_model=MessageResponse)
def simulate_daily_sales(db: Session = Depends(get_db)):
    """Simulate 24h consumption by subtracting dailySales from currentStock for all items"""
    meds = db.query(Medicine).all()
    for med in meds:
        sales = min(med.currentStock, round(med.dailySales))
        med.currentStock = max(0.0, float(med.currentStock - sales))
    db.commit()
    return {"message": "Simulated 24 hours of prescription and OTC sales across all inventory.", "success": True}

@router.post("/{sku}/urgent-stockout", response_model=MedicineResponse)
def trigger_urgent_stockout(sku: str, db: Session = Depends(get_db)):
    """Immediately force stock down to 2 units to trigger emergency replenishment workflows"""
    med = db.query(Medicine).filter((Medicine.sku == sku) | (Medicine.id == sku)).first()
    if not med:
        raise HTTPException(status_code=404, detail=f"Medicine {sku} not found")

    med.currentStock = 2.0
    db.commit()
    db.refresh(med)
    return med.to_dict()
