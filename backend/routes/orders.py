from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import random

from ..database import get_db
from ..models import PurchaseOrder, Medicine
from ..schemas import (
    PurchaseOrderCreate,
    PurchaseOrderResponse,
    PurchaseOrderUpdateStatus,
    MessageResponse
)

router = APIRouter(prefix="/api/orders", tags=["Purchase Orders & Tracking"])

STAGES = [
    {"status": "PO Created", "progress": 15, "desc": "Digital purchase order transmitted and signed."},
    {"status": "Order Confirmed", "progress": 35, "desc": "Vendor distributor confirmed batch allocation."},
    {"status": "Dispatched", "progress": 55, "desc": "Package labeled and handed to pharmaceutical carrier."},
    {"status": "In Transit", "progress": 75, "desc": "Shipment in transit between fulfillment hubs."},
    {"status": "Out for Delivery", "progress": 90, "desc": "Assigned to courier van for pharmacy dock delivery."},
    {"status": "Delivered", "progress": 100, "desc": "Delivered at pharmacy dock. Awaiting GRN verification."}
]

STAGE_PROGRESS_MAP = {
    "PO Created": 15,
    "Order Confirmed": 35,
    "Dispatched": 55,
    "In Transit": 75,
    "Out for Delivery": 90,
    "Delivered": 100,
    "Delivered & Stock Updated": 100
}

@router.get("", response_model=List[PurchaseOrderResponse])
def get_purchase_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PurchaseOrder)
    if status:
        query = query.filter(PurchaseOrder.status == status)
    # Return orders ordered by creation descending
    orders = query.order_by(PurchaseOrder.createdAt.desc()).all()
    return [order.to_dict() for order in orders]

@router.get("/{po_number}", response_model=PurchaseOrderResponse)
def get_purchase_order(po_number: str, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.poNumber == po_number).first()
    if not po:
        raise HTTPException(status_code=404, detail=f"Purchase Order {po_number} not found")
    return po.to_dict()

@router.post("", response_model=PurchaseOrderResponse, status_code=201)
def create_purchase_order(po_in: PurchaseOrderCreate, db: Session = Depends(get_db)):
    total_orders = db.query(PurchaseOrder).count()
    po_number = po_in.poNumber or f"PO-2026-{str(total_orders + 893).zfill(4)}"
    today_str = po_in.date or datetime.utcnow().strftime("%Y-%m-%d")
    
    lead_days = po_in.deliveryDays or 2
    exp_date = (datetime.utcnow() + timedelta(days=lead_days)).strftime("%Y-%m-%d")
    
    # Carrier calculation
    vendor_name = po_in.vendorName
    if "Apex" in vendor_name:
        carrier = "BlueDart ColdChain Pharma"
    elif "BioCare" in vendor_name:
        carrier = "Delhivery Express Pharma Hub"
    else:
        carrier = "VRL Medical Cargo"

    tracking_num = po_in.trackingNumber or f"TRK-{vendor_name[:3].upper()}-{random.randint(10000, 99999)}IN"
    
    # Timeline
    current_time_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    timeline = po_in.timeline or [
        {
            "status": "PO Created",
            "time": current_time_str,
            "location": "LifeCare ERP Hub, Mumbai",
            "desc": "Purchase order verified by AI bargaining agent & written to ledger."
        }
    ]

    po_dict = po_in.model_dump()
    po_dict["poNumber"] = po_number
    po_dict["date"] = today_str
    po_dict["carrier"] = po_in.carrier or carrier
    po_dict["trackingNumber"] = tracking_num
    po_dict["expectedDeliveryDate"] = po_in.expectedDeliveryDate or exp_date
    po_dict["timeline"] = timeline
    po_dict["status"] = po_in.status or "PO Created"
    po_dict["trackingStatus"] = po_in.trackingStatus or "PO Created"
    po_dict["deliveryProgress"] = STAGE_PROGRESS_MAP.get(po_dict["trackingStatus"], 15)

    new_po = PurchaseOrder(**po_dict)
    db.add(new_po)
    db.commit()
    db.refresh(new_po)
    return new_po.to_dict()

@router.patch("/{po_number}/advance", response_model=PurchaseOrderResponse)
def advance_order_status(po_number: str, db: Session = Depends(get_db)):
    """Advance the order tracking stage to next milestone"""
    po = db.query(PurchaseOrder).filter(PurchaseOrder.poNumber == po_number).first()
    if not po:
        raise HTTPException(status_code=404, detail=f"Purchase order {po_number} not found")

    current_status = po.trackingStatus or po.status
    current_idx = 0
    for idx, stage in enumerate(STAGES):
        if stage["status"] == current_status:
            current_idx = idx
            break

    next_idx = min(len(STAGES) - 1, current_idx + 1)
    next_stage = STAGES[next_idx]

    timeline = list(po.timeline or [])
    if next_idx != current_idx:
        loc = "LifeCare Receiving Dock" if next_stage["status"] == "Delivered" else "En-route Transit Hub"
        timeline.append({
            "status": next_stage["status"],
            "time": datetime.now().strftime("%d %b %Y, %I:%M %p"),
            "location": loc,
            "desc": next_stage["desc"]
        })

    is_now_delivered = next_stage["status"] == "Delivered"
    po.status = "Delivered (Awaiting GRN)" if is_now_delivered else next_stage["status"]
    po.trackingStatus = next_stage["status"]
    po.deliveryProgress = next_stage["progress"]
    po.isDelayed = False
    po.timeline = timeline

    db.commit()
    db.refresh(po)
    return po.to_dict()

@router.patch("/{po_number}/status", response_model=PurchaseOrderResponse)
def update_order_status(po_number: str, update: PurchaseOrderUpdateStatus, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.poNumber == po_number).first()
    if not po:
        raise HTTPException(status_code=404, detail=f"Purchase order {po_number} not found")

    new_status = update.status
    po.status = new_status
    po.trackingStatus = new_status
    po.deliveryProgress = STAGE_PROGRESS_MAP.get(new_status, 50)
    db.commit()
    db.refresh(po)
    return po.to_dict()

@router.patch("/{po_number}/toggle-delayed", response_model=PurchaseOrderResponse)
def toggle_order_delayed(po_number: str, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.poNumber == po_number).first()
    if not po:
        raise HTTPException(status_code=404, detail=f"Purchase order {po_number} not found")

    po.isDelayed = not po.isDelayed
    db.commit()
    db.refresh(po)
    return po.to_dict()

@router.post("/{po_number}/receive-goods", response_model=PurchaseOrderResponse)
def receive_goods(po_number: str, db: Session = Depends(get_db)):
    """Goods Received Note (GRN): increments inventory stock in DB and completes the order"""
    po = db.query(PurchaseOrder).filter(PurchaseOrder.poNumber == po_number).first()
    if not po:
        raise HTTPException(status_code=404, detail=f"Purchase order {po_number} not found")

    if po.status == "Delivered & Stock Updated":
        return po.to_dict()

    # Increment stock for each item in the order
    for item in (po.items or []):
        sku = item.get("sku")
        qty = item.get("quantity", 0)
        med = db.query(Medicine).filter(Medicine.sku == sku).first()
        if med:
            med.currentStock = float(med.currentStock + qty)

    # Update PO status
    po.status = "Delivered & Stock Updated"
    po.trackingStatus = "Delivered"
    po.deliveryProgress = 100
    po.receivedAt = datetime.utcnow().isoformat()

    # Append to timeline
    timeline = list(po.timeline or [])
    timeline.append({
        "status": "Delivered & Stock Updated",
        "time": datetime.now().strftime("%d %b %Y, %I:%M %p"),
        "location": "LifeCare Receiving Dock",
        "desc": "Goods Received Note (GRN) stamped. Stock levels updated in inventory."
    })
    po.timeline = timeline

    db.commit()
    db.refresh(po)
    return po.to_dict()
