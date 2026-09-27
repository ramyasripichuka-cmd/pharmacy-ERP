from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from ..database import get_db
from ..models import Medicine, Vendor
from ..schemas import NegotiationRequest
from .analytics import analyze_stock_item

router = APIRouter(prefix="/api/negotiation", tags=["Autonomous Bargaining AI"])

STRATEGIES = {
    "BALANCED": {
        "id": "BALANCED",
        "name": "Balanced Need-Focused (Recommended)",
        "description": "Prioritizes store right-sizing, eliminates excess bulk MOQ, and seeks fair 10-15% price discounts.",
        "targetDiscount": 0.12,
        "moqToleranceRatio": 1.25,
        "speedImportance": "MODERATE"
    },
    "AGGRESSIVE_COST": {
        "id": "AGGRESSIVE_COST",
        "name": "Aggressive Margin Maximizer",
        "description": "Hard bargaining on unit price. Leverages competitor price benchmarks to squeeze maximum price concessions.",
        "targetDiscount": 0.17,
        "moqToleranceRatio": 1.5,
        "speedImportance": "LOW"
    },
    "SAFETY_SPEED": {
        "id": "SAFETY_SPEED",
        "name": "Urgent Stockout / Speed-First",
        "description": "Focuses on guaranteed 24-48h expedited delivery and strict batch expiry freshness.",
        "targetDiscount": 0.08,
        "moqToleranceRatio": 1.05,
        "speedImportance": "HIGH"
    }
}

def evaluate_vendor_fit(vendor: Vendor, medicine_sku: str, recommended_qty: int):
    catalog = vendor.catalog or {}
    item_offering = catalog.get(medicine_sku)

    if not item_offering or not item_offering.get("inStock"):
        return {"available": False}

    list_price = float(item_offering.get("listPrice", 100))
    moq = int(item_offering.get("moq", 50))
    lead_days = int(item_offering.get("leadDays", vendor.standardLeadDays))

    return {
        "available": True,
        "listPrice": list_price,
        "moq": moq,
        "leadDays": lead_days,
        "vendorId": vendor.id,
        "vendorName": vendor.name,
        "shortName": vendor.shortName,
        "paymentTerms": vendor.defaultPaymentTerms,
        "reliabilityRating": vendor.reliabilityRating
    }

def simulate_single_negotiation(
    medicine_dict: Dict[str, Any],
    vendor: Vendor,
    recommended_qty: int,
    strategy_key: str = "BALANCED",
    custom_target_price: Optional[float] = None
) -> Dict[str, Any]:
    strategy = STRATEGIES.get(strategy_key, STRATEGIES["BALANCED"])
    vendor_fit = evaluate_vendor_fit(vendor, medicine_dict["sku"], recommended_qty)

    if not vendor_fit.get("available"):
        return {"success": False, "error": f"Vendor {vendor.shortName} cannot fulfill SKU {medicine_dict['sku']}"}

    catalog_list_price = vendor_fit["listPrice"]
    vendor_moq = vendor_fit["moq"]
    standard_lead = vendor_fit["leadDays"]

    store_ideal_qty = recommended_qty
    persona = vendor.persona or {}
    max_vendor_discount = persona.get("baseDiscountMax", 0.12)
    moq_flexibility = persona.get("moqFlexibility", 0.40)

    effective_discount_rate = min(strategy["targetDiscount"], max_vendor_discount)
    final_unit_price = round(catalog_list_price * (1.0 - effective_discount_rate), 2)

    moq_reduction = round((vendor_moq - storeIdeal_qty if (storeIdeal_qty := store_ideal_qty) else 0) * moq_flexibility)
    final_agreed_qty = max(store_ideal_qty, vendor_moq - moq_reduction)
    final_lead_days = max(1, standard_lead - 1 if standard_lead > 2 else standard_lead)

    initial_quote_total = round(vendor_moq * catalog_list_price, 2)
    final_order_total = round(final_agreed_qty * final_unit_price, 2)

    unit_price_savings = round((catalog_list_price - final_unit_price) * final_agreed_qty, 2)
    capital_preserved = max(0.0, round(initial_quote_total - final_order_total, 2))
    discount_percentage = round(((catalog_list_price - final_unit_price) / catalog_list_price) * 100, 1)

    rounds = [
        {
            "round": 1,
            "phase": "RFQ_AND_INITIAL_QUOTE",
            "title": "Round 1: Request for Quotation & Initial Vendor Terms",
            "messages": [
                {
                    "sender": "STORE_AGENT",
                    "senderName": "Pharma Restock AI",
                    "avatar": "🤖",
                    "timestamp": "10:14:02 AM",
                    "role": "buyer",
                    "content": f"Formal RFQ initiated for SKU: {medicine_dict['sku']} ({medicine_dict['name']}). Daily velocity is {medicine_dict.get('dailySales', 5)} units/day. Current stock: {medicine_dict.get('currentStock', 0)} units. Requesting sized order of {store_ideal_qty} units."
                },
                {
                    "sender": "VENDOR_AGENT",
                    "senderName": f"{vendor.shortName} Sales Agent",
                    "avatar": vendor.avatar,
                    "timestamp": "10:14:15 AM",
                    "role": "seller",
                    "content": f"Standard catalog price for {medicine_dict['name']} is ₹{catalog_list_price:.2f}/unit. Required MOQ: {vendor_moq} units, {standard_lead}-day lead time (Terms: {vendor.defaultPaymentTerms}). Initial quote: ₹{initial_quote_total:.2f}."
                }
            ]
        },
        {
            "round": 2,
            "phase": "STORE_COUNTER_AND_LEVERAGE",
            "title": "Round 2: Store Agent Counter & Data-Backed Leverage",
            "messages": [
                {
                    "sender": "STORE_AGENT",
                    "senderName": "Pharma Restock AI",
                    "avatar": "🤖",
                    "timestamp": "10:14:32 AM",
                    "role": "buyer",
                    "content": f"A MOQ of {vendor_moq} units forces {vendor_moq - store_ideal_qty} units of excess capital lockup. We counter at ₹{final_unit_price:.2f}/unit for {final_agreed_qty} units with immediate digital PO dispatch and reliable recurring monthly cadence."
                },
                {
                    "sender": "VENDOR_AGENT",
                    "senderName": f"{vendor.shortName} Sales Agent",
                    "avatar": vendor.avatar,
                    "timestamp": "10:14:50 AM",
                    "role": "seller",
                    "content": f"Reviewing commercial parameters for {medicine_dict['name']}... Based on verified procurement volume and consistent ERP credit history, we approve a tier concession."
                }
            ]
        },
        {
            "round": 3,
            "phase": "FINAL_TERMS_CONFIRMATION",
            "title": "Round 3: Final Agreement Reached & SLA Ratified",
            "messages": [
                {
                    "sender": "VENDOR_AGENT",
                    "senderName": f"{vendor.shortName} Sales Agent",
                    "avatar": vendor.avatar,
                    "timestamp": "10:15:10 AM",
                    "role": "seller",
                    "content": f"Finalized terms: Unit Price ₹{final_unit_price:.2f} ({discount_percentage}% discount), Order Quantity: {final_agreed_qty} units, Lead Time: {final_lead_days} days. Total: ₹{final_order_total:.2f}."
                },
                {
                    "sender": "STORE_AGENT",
                    "senderName": "Pharma Restock AI",
                    "avatar": "🤖",
                    "timestamp": "10:15:18 AM",
                    "role": "buyer",
                    "content": f"Agreement accepted. Unit savings of ₹{unit_price_savings:.2f} secured. Generating Purchase Order."
                }
            ]
        }
    ]

    return {
        "success": True,
        "vendorId": vendor.id,
        "vendorName": vendor.name,
        "shortName": vendor.shortName,
        "vendorAvatar": vendor.avatar,
        "sku": medicine_dict["sku"],
        "medicineName": medicine_dict["name"],
        "strategyKey": strategy_key,
        "initialListPrice": catalog_list_price,
        "initialMOQ": vendor_moq,
        "initialLeadDays": standard_lead,
        "initialQuoteTotal": initial_quote_total,
        "finalUnitPrice": final_unit_price,
        "finalQuantity": final_agreed_qty,
        "finalLeadDays": final_lead_days,
        "finalTotal": final_order_total,
        "discountPercentage": discount_percentage,
        "unitPriceSavings": unit_price_savings,
        "capitalPreserved": capital_preserved,
        "paymentTerms": vendor.defaultPaymentTerms,
        "roundsCount": len(rounds),
        "rounds": rounds,
        "keyAccomplishments": [
            f"Secured {discount_percentage}% discount (saved ₹{unit_price_savings:.2f} on unit price)",
            f"Right-sized MOQ from {vendor_moq} down to {final_agreed_qty} units",
            f"Preserved ₹{capital_preserved:.2f} in working capital against supplier over-ordering",
            f"Locked in guaranteed {final_lead_days}-day delivery with {vendor.shortName}"
        ]
    }

@router.post("/simulate")
def simulate(req: NegotiationRequest, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter((Medicine.sku == req.sku) | (Medicine.id == req.sku)).first()
    if not med:
        raise HTTPException(status_code=404, detail=f"Medicine {req.sku} not found")

    analyzed = analyze_stock_item(med)
    recommended_qty = max(10, analyzed.get("recommendedQuantity", 30))

    target_vendor_id = req.vendorId or med.preferredVendorId or "v1"
    vendor = db.query(Vendor).filter(Vendor.id == target_vendor_id).first()
    if not vendor:
        vendor = db.query(Vendor).first()

    result = simulate_single_negotiation(
        medicine_dict=analyzed,
        vendor=vendor,
        recommended_qty=recommended_qty,
        strategy_key=req.strategyKey or "BALANCED",
        custom_target_price=req.customTargetPrice
    )
    return result

@router.post("/tournament")
def run_tournament(req: NegotiationRequest, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter((Medicine.sku == req.sku) | (Medicine.id == req.sku)).first()
    if not med:
        raise HTTPException(status_code=404, detail=f"Medicine {req.sku} not found")

    analyzed = analyze_stock_item(med)
    recommended_qty = max(10, analyzed.get("recommendedQuantity", 30))

    vendors = db.query(Vendor).all()
    proposals = []

    for v in vendors:
        res = simulate_single_negotiation(
            medicine_dict=analyzed,
            vendor=v,
            recommended_qty=recommended_qty,
            strategy_key=req.strategyKey or "BALANCED"
        )
        if res.get("success"):
            proposals.append(res)

    if not proposals:
        raise HTTPException(status_code=400, detail="No vendor was able to fulfill this SKU")

    # Winner selection based on strategy
    strategy_key = req.strategyKey or "BALANCED"
    if strategy_key == "AGGRESSIVE_COST":
        winner = min(proposals, key=lambda p: p["finalUnitPrice"])
    elif strategy_key == "SAFETY_SPEED":
        winner = min(proposals, key=lambda p: p["finalLeadDays"])
    else:
        # Balanced: highest discount with lowest lead days
        winner = max(proposals, key=lambda p: p["discountPercentage"] / max(1, p["finalLeadDays"]))

    return {
        "sku": med.sku,
        "medicineName": med.name,
        "winner": winner,
        "allProposals": proposals
    }
