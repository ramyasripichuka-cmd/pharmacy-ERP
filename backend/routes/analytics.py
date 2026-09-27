from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List

from ..database import get_db
from ..models import Medicine, PurchaseOrder, StoreProfile

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Stock Audit"])

SIMULATED_DATE = datetime(2026, 9, 26, 12, 0, 0)

def get_days_to_expiry(expiry_date_str: str) -> int:
    try:
        expiry = datetime.strptime(expiry_date_str, "%Y-%m-%d")
        diff = expiry - SIMULATED_DATE
        return max(0, diff.days)
    except Exception:
        return 365

def calculate_demand_forecast(item: Medicine, forecast_window_days: int = 21) -> Dict[str, Any]:
    history = item.salesHistory if item.salesHistory and len(item.salesHistory) > 0 else [item.dailySales] * 3
    historical_avg_daily = round(sum(history) / len(history), 2)
    
    seasonal = item.seasonalTrend or {}
    trend_multiplier = seasonal.get("factor", 1.10)
    trend_percentage = round((trend_multiplier - 1) * 100)
    demand_driver = seasonal.get("label", "Seasonal Prescription Velocity Trend")
    confidence_score = seasonal.get("confidence", 92)

    predicted_daily_demand = round(historical_avg_daily * trend_multiplier, 2)
    predicted_window_demand = round(predicted_daily_demand * forecast_window_days)
    predicted_30d_demand = round(predicted_daily_demand * 30)

    baseline_window_demand = round(item.dailySales * forecast_window_days)
    demand_delta_units = predicted_window_demand - baseline_window_demand

    if demand_delta_units > 0:
        impact_explanation = f"AI Forecast identified {'+' if trend_percentage > 0 else ''}{trend_percentage}% demand surge ({demand_driver}). Boosted recommended order by +{demand_delta_units} units."
    elif demand_delta_units < 0:
        impact_explanation = f"AI Forecast identified demand slowdown ({trend_percentage}%). Trimmed order by {abs(demand_delta_units)} units to protect capital."
    else:
        impact_explanation = f"AI Forecast confirmed stable baseline demand. Restock sized precisely for {forecast_window_days}-day target window."

    return {
        "historicalAvgDaily": historical_avg_daily,
        "predictedDailyDemand": predicted_daily_demand,
        "predictedWindowDemand": predicted_window_demand,
        "predicted30dDemand": predicted_30d_demand,
        "trendPercentage": trend_percentage,
        "demandDriver": demand_driver,
        "confidenceScore": confidence_score,
        "demandDeltaUnits": demand_delta_units,
        "impactExplanation": impact_explanation
    }

def analyze_stock_item(item: Medicine, target_buffer_days: int = 21) -> Dict[str, Any]:
    daily_sales = max(0.1, item.dailySales)
    days_of_supply = round(item.currentStock / daily_sales, 1)
    days_to_expiry = get_days_to_expiry(item.expiryDate)

    is_stockout = item.currentStock <= 0
    is_critical = days_of_supply <= 2 or item.currentStock <= (item.reorderThreshold * 0.35)
    is_low_stock = item.currentStock <= item.reorderThreshold or days_of_supply <= 5
    is_immediate_expiry = days_to_expiry <= 30
    is_near_expiry = days_to_expiry <= 60

    projected_sales_before_expiry = int(max(0, days_to_expiry) * daily_sales)
    potential_wasted_stock = max(0, int(item.currentStock - projected_sales_before_expiry)) if is_near_expiry else 0

    demand_forecast = calculate_demand_forecast(item, target_buffer_days)
    effective_daily_velocity = demand_forecast["predictedDailyDemand"]

    usable_current_stock = item.currentStock
    if is_immediate_expiry:
        usable_current_stock = min(item.currentStock, projected_sales_before_expiry)

    target_holding_stock = int(effective_daily_velocity * target_buffer_days * 1.15)
    deficit = target_holding_stock - usable_current_stock

    recommended_quantity = 0
    if is_critical or is_low_stock or deficit > 0:
        recommended_quantity = max(10, int(deficit))

    # Risk badge
    if is_stockout:
        risk_level = "STOCKOUT"
        risk_badge = {"label": "Out of Stock", "color": "#ef4444", "severity": 4}
    elif is_critical:
        risk_level = "CRITICAL"
        risk_badge = {"label": "Critical Shortage", "color": "#f97316", "severity": 3}
    elif is_immediate_expiry:
        risk_level = "EXPIRY_URGENT"
        risk_badge = {"label": "Expiry < 30d", "color": "#dc2626", "severity": 4}
    elif is_low_stock:
        risk_level = "LOW_STOCK"
        risk_badge = {"label": "Reorder Needed", "color": "#eab308", "severity": 2}
    elif is_near_expiry:
        risk_level = "EXPIRY_WARNING"
        risk_badge = {"label": "Expiry < 60d", "color": "#f59e0b", "severity": 2}
    else:
        risk_level = "HEALTHY"
        risk_badge = {"label": "Optimal Stock", "color": "#10b981", "severity": 1}

    item_dict = item.to_dict()
    item_dict.update({
        "daysOfSupply": days_of_supply,
        "daysToExpiry": days_to_expiry,
        "isStockout": is_stockout,
        "isCritical": is_critical,
        "isLowStock": is_low_stock,
        "isImmediateExpiry": is_immediate_expiry,
        "isNearExpiry": is_near_expiry,
        "potentialWastedStock": potential_wasted_stock,
        "demandForecast": demand_forecast,
        "recommendedQuantity": recommended_quantity,
        "targetHoldingStock": target_holding_stock,
        "riskLevel": risk_level,
        "riskBadge": risk_badge
    })
    return item_dict

@router.get("/stock-audit")
def get_stock_audit(buffer_days: int = 21, db: Session = Depends(get_db)):
    meds = db.query(Medicine).all()
    analyzed_items = [analyze_stock_item(m, buffer_days) for m in meds]

    critical_count = sum(1 for item in analyzed_items if item["riskLevel"] in ["STOCKOUT", "CRITICAL", "EXPIRY_URGENT"])
    warning_count = sum(1 for item in analyzed_items if item["riskLevel"] in ["LOW_STOCK", "EXPIRY_WARNING"])
    healthy_count = sum(1 for item in analyzed_items if item["riskLevel"] == "HEALTHY")

    total_recommended_spend = sum(item["recommendedQuantity"] * item["unitCost"] for item in analyzed_items)
    total_inventory_valuation = sum(item["currentStock"] * item["unitCost"] for item in analyzed_items)

    return {
        "items": analyzed_items,
        "summary": {
            "totalSkus": len(analyzed_items),
            "criticalCount": critical_count,
            "warningCount": warning_count,
            "healthyCount": healthy_count,
            "totalRecommendedSpend": round(total_recommended_spend, 2),
            "totalInventoryValuation": round(total_inventory_valuation, 2)
        }
    }

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    meds = db.query(Medicine).all()
    orders = db.query(PurchaseOrder).all()
    profile = db.query(StoreProfile).first()

    total_inventory_val = sum(m.currentStock * m.unitCost for m in meds)
    low_stock_count = sum(1 for m in meds if m.currentStock <= m.reorderThreshold)
    total_po_count = len(orders)
    active_deliveries = sum(1 for o in orders if o.status not in ["Delivered & Stock Updated", "Delivered"])
    total_savings = sum(o.totalSavings for o in orders)
    total_po_spend = sum(o.totalAmount for o in orders)

    return {
        "totalInventoryValuation": round(total_inventory_val, 2),
        "totalSkus": len(meds),
        "lowStockCount": low_stock_count,
        "activeDeliveriesCount": active_deliveries,
        "totalPurchaseOrders": total_po_count,
        "totalLifetimeSavings": round(total_savings, 2),
        "totalPurchasesAmount": round(total_po_spend, 2),
        "procurementBudget": profile.monthlyProcurementBudget if profile else 350000.0,
        "currentMonthSpend": profile.currentMonthSpend if profile else 185000.0
    }
