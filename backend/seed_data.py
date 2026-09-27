from sqlalchemy.orm import Session
from .models import Medicine, Vendor, PurchaseOrder, StoreProfile

INITIAL_STORE_PROFILE = {
    "name": "LifeCare Community Pharmacy & Surgical",
    "branch": "BKC Healthcare Hub - Store #104",
    "licenseNo": "DL-MH-2024-88419",
    "gstNumber": "27AABCL8821M1ZX",
    "address": "Suite 4B, MedTech Boulevard, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
    "phone": "+91 (022) 555-0199",
    "email": "procurement@lifecarepharmacy.in",
    "pharmacistInCharge": "Dr. Elena Vance, PharmD",
    "monthlyProcurementBudget": 350000.0,
    "currentMonthSpend": 185000.0
}

INITIAL_MEDICINES = [
    {
        "id": "med-01",
        "sku": "MED-AMX-500",
        "name": "Amoxicillin Trihydrate 500mg",
        "generic": "Amoxicillin",
        "category": "Antibiotics",
        "form": "Capsules (Box of 100)",
        "currentStock": 14,
        "reorderThreshold": 60,
        "dailySales": 11,
        "unitCost": 145.00,
        "mrp": 240.00,
        "expiryDate": "2027-05-15",
        "batchNumber": "AMX-2024-91B",
        "storage": "Room Temp (15-25°C)",
        "preferredVendorId": "v1",
        "notes": "High prescription volume from General Hospital OPD.",
        "salesHistory": [10, 11, 9, 12, 13, 11, 14, 12, 15, 13, 14, 12, 16, 15],
        "seasonalTrend": {"factor": 1.18, "label": "Monsoon Bacterial Infection Spike", "confidence": 94}
    },
    {
        "id": "med-02",
        "sku": "MED-MET-500",
        "name": "Metformin HCl ER 500mg",
        "generic": "Metformin Extended Release",
        "category": "Antidiabetic",
        "form": "Tablets (Bottle of 100)",
        "currentStock": 22,
        "reorderThreshold": 75,
        "dailySales": 9,
        "unitCost": 82.00,
        "mrp": 150.00,
        "expiryDate": "2027-08-20",
        "batchNumber": "MET-2024-44C",
        "storage": "Dry Place (< 30°C)",
        "preferredVendorId": "v2",
        "notes": "Chronic refill patient cohort of 140+ patients.",
        "salesHistory": [9, 9, 8, 10, 9, 8, 9, 10, 9, 9, 8, 10, 9, 9],
        "seasonalTrend": {"factor": 1.05, "label": "Stable Chronic Refill Pattern", "confidence": 96}
    },
    {
        "id": "med-03",
        "sku": "MED-AZI-250",
        "name": "Azithromycin 250mg",
        "generic": "Azithromycin",
        "category": "Antibiotics",
        "form": "Strip (6 Tablets)",
        "currentStock": 68,
        "reorderThreshold": 40,
        "dailySales": 1.5,
        "unitCost": 68.00,
        "mrp": 125.00,
        "expiryDate": "2026-10-25",
        "batchNumber": "AZI-2023-10X",
        "storage": "Room Temp",
        "preferredVendorId": "v3",
        "notes": "CRITICAL: Batch nearing expiry in < 30 days! Risk of unsold expiry.",
        "salesHistory": [2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
        "seasonalTrend": {"factor": 1.15, "label": "Impending Batch Expiry vs Demand", "confidence": 91}
    },
    {
        "id": "med-04",
        "sku": "MED-ATV-20",
        "name": "Atorvastatin Calcium 20mg",
        "generic": "Atorvastatin",
        "category": "Cardiovascular",
        "form": "Tablets (Blister of 90)",
        "currentStock": 18,
        "reorderThreshold": 50,
        "dailySales": 7,
        "unitCost": 194.00,
        "mrp": 320.00,
        "expiryDate": "2027-02-10",
        "batchNumber": "ATV-2024-11A",
        "storage": "Room Temp (< 25°C)",
        "preferredVendorId": "v1",
        "notes": "Fast moving statin, stockout risk in 2.5 days.",
        "salesHistory": [6, 7, 7, 8, 6, 7, 8, 7, 8, 7, 9, 8, 8, 9],
        "seasonalTrend": {"factor": 1.12, "label": "Post-Cardiac Ward Clinic Discharge Uptick", "confidence": 93}
    },
    {
        "id": "med-05",
        "sku": "MED-INS-GLA",
        "name": "Insulin Glargine 100 IU/mL SoloStar",
        "generic": "Insulin Glargine",
        "category": "Critical / Cold Chain",
        "form": "Prefilled Pen 3mL (Pack of 5)",
        "currentStock": 5,
        "reorderThreshold": 20,
        "dailySales": 3,
        "unitCost": 580.00,
        "mrp": 850.00,
        "expiryDate": "2027-01-30",
        "batchNumber": "INS-2024-77E",
        "storage": "Cold Chain (2°C - 8°C)",
        "preferredVendorId": "v3",
        "notes": "Cold chain verification required upon dock delivery.",
        "salesHistory": [3, 2, 3, 4, 3, 3, 3, 4, 3, 3, 4, 3, 3, 4],
        "seasonalTrend": {"factor": 1.08, "label": "High-Priority Temperature Controlled Critical Refill", "confidence": 97}
    },
    {
        "id": "med-06",
        "sku": "MED-OMP-20",
        "name": "Omeprazole Delayed-Release 20mg",
        "generic": "Omeprazole",
        "category": "Gastrointestinal",
        "form": "Capsules (Bottle of 100)",
        "currentStock": 15,
        "reorderThreshold": 55,
        "dailySales": 8,
        "unitCost": 71.00,
        "mrp": 142.00,
        "expiryDate": "2027-09-12",
        "batchNumber": "OMP-2024-63D",
        "storage": "Moisture-proof container",
        "preferredVendorId": "v2",
        "notes": "Regular OTC and prescription combo sales.",
        "salesHistory": [7, 8, 8, 9, 7, 8, 8, 9, 8, 9, 8, 9, 10, 9],
        "seasonalTrend": {"factor": 1.10, "label": "Gastro-Protective Adjunct Prescription Demand", "confidence": 92}
    },
    {
        "id": "med-07",
        "sku": "MED-SAL-100",
        "name": "Salbutamol CFC-Free Inhaler 100mcg",
        "generic": "Albuterol / Salbutamol",
        "category": "Respiratory",
        "form": "200 Metered Actuations Canister",
        "currentStock": 8,
        "reorderThreshold": 35,
        "dailySales": 5,
        "unitCost": 138.00,
        "mrp": 230.00,
        "expiryDate": "2027-11-05",
        "batchNumber": "SAL-2024-32K",
        "storage": "Below 30°C away from direct sunlight",
        "preferredVendorId": "v3",
        "notes": "Emergency asthma refill essential stock.",
        "salesHistory": [4, 5, 5, 6, 5, 6, 7, 6, 7, 6, 8, 7, 8, 8],
        "seasonalTrend": {"factor": 1.25, "label": "AQI Weather Sensitivity & Bronchial Surge", "confidence": 95}
    },
    {
        "id": "med-08",
        "sku": "MED-PAR-650",
        "name": "Paracetamol 650mg Fast-Release",
        "generic": "Acetaminophen",
        "category": "Analgesics / Antipyretic",
        "form": "Tablets (Box of 200)",
        "currentStock": 320,
        "reorderThreshold": 120,
        "dailySales": 16,
        "unitCost": 55.00,
        "mrp": 100.00,
        "expiryDate": "2027-12-31",
        "batchNumber": "PAR-2024-09Z",
        "storage": "Room Temp",
        "preferredVendorId": "v2",
        "notes": "Stock is in healthy optimal state (20 days supply).",
        "salesHistory": [15, 16, 17, 16, 15, 18, 16, 17, 16, 15, 17, 16, 18, 17],
        "seasonalTrend": {"factor": 1.14, "label": "Seasonal Viral Fever High-Velocity Baseline", "confidence": 95}
    },
    {
        "id": "med-09",
        "sku": "MED-LOS-50",
        "name": "Losartan Potassium 50mg",
        "generic": "Losartan",
        "category": "Cardiovascular",
        "form": "Tablets (Bottle of 90)",
        "currentStock": 16,
        "reorderThreshold": 45,
        "dailySales": 6,
        "unitCost": 112.00,
        "mrp": 205.00,
        "expiryDate": "2027-04-18",
        "batchNumber": "LOS-2024-81P",
        "storage": "Room Temp",
        "preferredVendorId": "v1",
        "notes": "Reorder required within 48h to prevent gap.",
        "salesHistory": [5, 6, 6, 6, 7, 6, 6, 7, 6, 7, 7, 6, 7, 7],
        "seasonalTrend": {"factor": 1.06, "label": "Hypertension Maintenance Cohort Consistency", "confidence": 96}
    },
    {
        "id": "med-10",
        "sku": "MED-CET-10",
        "name": "Cetirizine Hydrochloride 10mg",
        "generic": "Cetirizine",
        "category": "Antihistamine",
        "form": "Tablets (Pack of 100)",
        "currentStock": 48,
        "reorderThreshold": 40,
        "dailySales": 4,
        "unitCost": 48.00,
        "mrp": 95.00,
        "expiryDate": "2026-11-15",
        "batchNumber": "CET-2023-88M",
        "storage": "Room Temp",
        "preferredVendorId": "v2",
        "notes": "Moderate stock, expiry within 50 days to be monitored.",
        "salesHistory": [4, 4, 3, 5, 4, 4, 5, 4, 5, 4, 4, 5, 5, 4],
        "seasonalTrend": {"factor": 1.10, "label": "Seasonal Allergen Fluctuations", "confidence": 90}
    },
    {
        "id": "med-11",
        "sku": "MED-CIP-500",
        "name": "Ciprofloxacin 500mg USP",
        "generic": "Ciprofloxacin",
        "category": "Antibiotics",
        "form": "Tablets (Blister of 100)",
        "currentStock": 11,
        "reorderThreshold": 35,
        "dailySales": 4.5,
        "unitCost": 123.00,
        "mrp": 210.00,
        "expiryDate": "2027-06-20",
        "batchNumber": "CIP-2024-12W",
        "storage": "Room Temp",
        "preferredVendorId": "v1",
        "notes": "Urgent: hospital post-surgical antibiotic protocol.",
        "salesHistory": [4, 5, 4, 5, 4, 5, 5, 4, 5, 5, 6, 5, 5, 6],
        "seasonalTrend": {"factor": 1.15, "label": "Surgical Ward Antimicrobial Protocol Demand", "confidence": 94}
    },
    {
        "id": "med-12",
        "sku": "MED-PNT-40",
        "name": "Pantoprazole Sodium 40mg",
        "generic": "Pantoprazole",
        "category": "Gastrointestinal",
        "form": "Tablets (Box of 100)",
        "currentStock": 19,
        "reorderThreshold": 60,
        "dailySales": 10,
        "unitCost": 89.00,
        "mrp": 165.00,
        "expiryDate": "2027-07-14",
        "batchNumber": "PNT-2024-95R",
        "storage": "Store dry < 25°C",
        "preferredVendorId": "v3",
        "notes": "Fast depleted, less than 2 days of supply.",
        "salesHistory": [9, 10, 10, 11, 9, 10, 11, 10, 11, 10, 12, 11, 11, 12],
        "seasonalTrend": {"factor": 1.12, "label": "High Inpatient & Co-Prescription Turnover", "confidence": 93}
    }
]

INITIAL_VENDORS = [
    {
        "id": "v1",
        "name": "Apex Pharma Wholesalers Ltd.",
        "shortName": "Apex Pharma",
        "tagline": "Premier ISO 9001 Certified National Distributor",
        "badge": "Top Tier Reliability",
        "reliabilityRating": 98.4,
        "onTimeDeliveryRate": "99.1%",
        "standardLeadDays": 2,
        "expressLeadDays": 1,
        "freeShippingThreshold": 5000,
        "defaultPaymentTerms": "Net 30 Days",
        "avatar": "🏥",
        "color": "#3b82f6",
        "reliabilityMetrics": {
            "deliveryPerformance": 99.1,
            "orderFulfillmentRate": 99.5,
            "priceConsistency": 97.8,
            "successfulOrdersCount": 148,
            "defectDisputeRate": 0.3,
            "compositeScore": 98.4,
            "grade": "Tier-1 AAA",
            "auditSummary": "Exceptional cold-chain SLA adherence, zero delivery misses in last 12 months, and consistent transparent pricing."
        },
        "persona": {
            "type": "Reliability & Quality Focused",
            "description": "Apex charges slightly higher list prices but provides guaranteed 24-48h SLA cold-chain delivery and flawless batch compliance. Agent negotiates discounts by offering repeat volume and timely PO sign-off.",
            "baseDiscountMax": 0.14,
            "moqFlexibility": 0.40,
            "expressSurchargeWaivable": True
        },
        "catalog": {
            "MED-AMX-500": {"listPrice": 152.00, "moq": 90, "leadDays": 2, "inStock": True},
            "MED-MET-500": {"listPrice": 89.00, "moq": 100, "leadDays": 2, "inStock": True},
            "MED-AZI-250": {"listPrice": 72.00, "moq": 60, "leadDays": 2, "inStock": True},
            "MED-ATV-20": {"listPrice": 201.00, "moq": 70, "leadDays": 2, "inStock": True},
            "MED-INS-GLA": {"listPrice": 610.00, "moq": 20, "leadDays": 1, "inStock": True},
            "MED-OMP-20": {"listPrice": 75.00, "moq": 80, "leadDays": 2, "inStock": True},
            "MED-SAL-100": {"listPrice": 146.00, "moq": 40, "leadDays": 2, "inStock": True},
            "MED-PAR-650": {"listPrice": 58.00, "moq": 150, "leadDays": 2, "inStock": True},
            "MED-LOS-50": {"listPrice": 118.00, "moq": 50, "leadDays": 2, "inStock": True},
            "MED-CET-10": {"listPrice": 51.00, "moq": 60, "leadDays": 2, "inStock": True},
            "MED-CIP-500": {"listPrice": 129.00, "moq": 45, "leadDays": 2, "inStock": True},
            "MED-PNT-40": {"listPrice": 93.00, "moq": 80, "leadDays": 2, "inStock": True}
        }
    },
    {
        "id": "v2",
        "name": "MedVantage Direct Logistics",
        "shortName": "MedVantage",
        "tagline": "High-Volume Direct Manufacturer Liquidator",
        "badge": "Lowest Base Cost",
        "reliabilityRating": 92.1,
        "onTimeDeliveryRate": "93.4%",
        "standardLeadDays": 4,
        "expressLeadDays": 2,
        "freeShippingThreshold": 7500,
        "defaultPaymentTerms": "Net 15 Days",
        "avatar": "📦",
        "color": "#f59e0b",
        "reliabilityMetrics": {
            "deliveryPerformance": 93.4,
            "orderFulfillmentRate": 91.2,
            "priceConsistency": 88.5,
            "successfulOrdersCount": 92,
            "defectDisputeRate": 4.2,
            "compositeScore": 92.1,
            "grade": "Tier-2 B+",
            "auditSummary": "Lowest list prices but higher transit variance (up to 4 days) and rigid high MOQ requirements."
        },
        "persona": {
            "type": "Bulk Pusher & Deep Discounter",
            "description": "MedVantage has the lowest listed catalog prices but aggressively tries to push high Minimum Order Quantities (150-250 units). Store Agent can pressure them on holding costs and inventory spoilage risk to force MOQ concessions.",
            "baseDiscountMax": 0.18,
            "moqFlexibility": 0.55,
            "expressSurchargeWaivable": False
        },
        "catalog": {
            "MED-AMX-500": {"listPrice": 139.00, "moq": 180, "leadDays": 4, "inStock": True},
            "MED-MET-500": {"listPrice": 78.00, "moq": 200, "leadDays": 4, "inStock": True},
            "MED-AZI-250": {"listPrice": 64.00, "moq": 120, "leadDays": 4, "inStock": True},
            "MED-ATV-20": {"listPrice": 185.00, "moq": 140, "leadDays": 4, "inStock": True},
            "MED-INS-GLA": {"listPrice": 595.00, "moq": 35, "leadDays": 3, "inStock": True},
            "MED-OMP-20": {"listPrice": 67.00, "moq": 150, "leadDays": 4, "inStock": True},
            "MED-SAL-100": {"listPrice": 132.00, "moq": 80, "leadDays": 4, "inStock": True},
            "MED-PAR-650": {"listPrice": 51.00, "moq": 250, "leadDays": 4, "inStock": True},
            "MED-LOS-50": {"listPrice": 105.00, "moq": 120, "leadDays": 4, "inStock": True},
            "MED-CET-10": {"listPrice": 45.00, "moq": 150, "leadDays": 4, "inStock": True},
            "MED-CIP-500": {"listPrice": 118.00, "moq": 90, "leadDays": 4, "inStock": True},
            "MED-PNT-40": {"listPrice": 84.00, "moq": 160, "leadDays": 4, "inStock": True}
        }
    },
    {
        "id": "v3",
        "name": "BioCare Regional Distribution",
        "shortName": "BioCare",
        "tagline": "Agile Low-MOQ Community Partner",
        "badge": "Flexible & Agile",
        "reliabilityRating": 96.5,
        "onTimeDeliveryRate": "97.2%",
        "standardLeadDays": 1,
        "expressLeadDays": 1,
        "freeShippingThreshold": 3000,
        "defaultPaymentTerms": "Net 45 Days",
        "avatar": "⚡",
        "color": "#10b981",
        "reliabilityMetrics": {
            "deliveryPerformance": 97.2,
            "orderFulfillmentRate": 98.0,
            "priceConsistency": 96.4,
            "successfulOrdersCount": 115,
            "defectDisputeRate": 0.8,
            "compositeScore": 96.5,
            "grade": "Tier-1 A+",
            "auditSummary": "Ultra-fast local hub fulfillment (24h), low MOQs, clean dispute record, and reliable inventory backing."
        },
        "persona": {
            "type": "Agile Regional Partner",
            "description": "BioCare is ultra-responsive, operates local fulfillment hubs, offers the lowest MOQs, and provides generous Net 45 payment terms. Readily matches competitor prices and waives delivery fees.",
            "baseDiscountMax": 0.12,
            "moqFlexibility": 0.65,
            "expressSurchargeWaivable": True
        },
        "catalog": {
            "MED-AMX-500": {"listPrice": 146.00, "moq": 50, "leadDays": 1, "inStock": True},
            "MED-MET-500": {"listPrice": 84.00, "moq": 60, "leadDays": 1, "inStock": True},
            "MED-AZI-250": {"listPrice": 69.00, "moq": 40, "leadDays": 1, "inStock": True},
            "MED-ATV-20": {"listPrice": 196.00, "moq": 45, "leadDays": 1, "inStock": True},
            "MED-INS-GLA": {"listPrice": 575.00, "moq": 15, "leadDays": 1, "inStock": True},
            "MED-OMP-20": {"listPrice": 72.00, "moq": 50, "leadDays": 1, "inStock": True},
            "MED-SAL-100": {"listPrice": 139.00, "moq": 30, "leadDays": 1, "inStock": True},
            "MED-PAR-650": {"listPrice": 54.00, "moq": 80, "leadDays": 1, "inStock": True},
            "MED-LOS-50": {"listPrice": 114.00, "moq": 35, "leadDays": 1, "inStock": True},
            "MED-CET-10": {"listPrice": 49.00, "moq": 40, "leadDays": 1, "inStock": True},
            "MED-CIP-500": {"listPrice": 124.00, "moq": 30, "leadDays": 1, "inStock": True},
            "MED-PNT-40": {"listPrice": 90.00, "moq": 50, "leadDays": 1, "inStock": True}
        }
    }
]

INITIAL_ORDERS = [
    {
        "poNumber": "PO-2026-0891",
        "date": "2026-09-22",
        "vendorId": "v1",
        "vendorName": "Apex Pharma Wholesalers Ltd.",
        "status": "Delivered & Stock Updated",
        "trackingStatus": "Delivered",
        "trackingNumber": "TRK-APX-98214IN",
        "carrier": "BlueDart ColdChain Pharma",
        "expectedDeliveryDate": "2026-09-23",
        "deliveredDate": "2026-09-23",
        "isDelayed": False,
        "deliveryProgress": 100,
        "items": [
            {
                "sku": "MED-INS-GLA",
                "name": "Insulin Glargine 100 IU/mL SoloStar",
                "quantity": 25,
                "originalPrice": 610.00,
                "negotiatedPrice": 549.00,
                "total": 13725.00,
                "savings": 1525.00
            }
        ],
        "totalAmount": 13725.00,
        "totalSavings": 1525.00,
        "savingsPercentage": 10.0,
        "deliveryDays": 1,
        "paymentTerms": "Net 30 Days",
        "negotiationRounds": 3,
        "aiReasoning": "Urgent cold chain replenishment. AI secured 10% unit discount and guaranteed 24h temperature-controlled dispatch with Tier-1 Apex Pharma.",
        "timeline": [
            {"status": "PO Created", "time": "22 Sep 2026, 09:30 AM", "location": "LifeCare ERP Hub, Mumbai", "desc": "Digital purchase order transmitted and signed."},
            {"status": "Order Confirmed", "time": "22 Sep 2026, 10:15 AM", "location": "Apex Central Logistics, Thane", "desc": "Batch reservation confirmed by Apex Sales Agent."},
            {"status": "Dispatched", "time": "22 Sep 2026, 02:00 PM", "location": "Apex Cold-Storage Facility", "desc": "Refrigerated parcel packed under 2-8°C data logger."},
            {"status": "In Transit", "time": "22 Sep 2026, 07:45 PM", "location": "Mumbai North Transit Hub", "desc": "Shipment in transit via BlueDart ColdChain vehicle."},
            {"status": "Out for Delivery", "time": "23 Sep 2026, 08:30 AM", "location": "BKC Delivery Center", "desc": "Out for dock delivery to LifeCare Community Pharmacy."},
            {"status": "Delivered", "time": "23 Sep 2026, 11:20 AM", "location": "LifeCare Receiving Dock", "desc": "Cold chain verified. GRN goods receipt accepted into ERP."}
        ]
    },
    {
        "poNumber": "PO-2026-0892",
        "date": "2026-09-24",
        "vendorId": "v3",
        "vendorName": "BioCare Regional Distribution",
        "status": "In-Transit",
        "trackingStatus": "In Transit",
        "trackingNumber": "TRK-BIO-67431IN",
        "carrier": "Delhivery Express Pharma Hub",
        "expectedDeliveryDate": "2026-09-25",
        "deliveredDate": None,
        "isDelayed": True,
        "deliveryProgress": 75,
        "items": [
            {
                "sku": "MED-SAL-100",
                "name": "Salbutamol CFC-Free Inhaler 100mcg",
                "quantity": 40,
                "originalPrice": 139.00,
                "negotiatedPrice": 122.00,
                "total": 4880.00,
                "savings": 680.00
            }
        ],
        "totalAmount": 4880.00,
        "totalSavings": 680.00,
        "savingsPercentage": 12.2,
        "deliveryDays": 1,
        "paymentTerms": "Net 45 Days",
        "negotiationRounds": 4,
        "aiReasoning": "AQI spike emergency restock. BioCare agreed to price-match lowest market bid and waived express air cargo fee.",
        "timeline": [
            {"status": "PO Created", "time": "24 Sep 2026, 11:15 AM", "location": "LifeCare ERP Hub, Mumbai", "desc": "Auto-procurement PO dispatched via API."},
            {"status": "Order Confirmed", "time": "24 Sep 2026, 11:45 AM", "location": "BioCare Regional Hub, Bhiwandi", "desc": "Automated order picking sequence initialized."},
            {"status": "Dispatched", "time": "24 Sep 2026, 04:30 PM", "location": "BioCare Distribution Center", "desc": "Handed over to Delhivery Express with tracking ID TRK-BIO-67431IN."},
            {"status": "In Transit", "time": "25 Sep 2026, 06:10 AM", "location": "Western Express Highway Transit", "desc": "Delayed due to heavy highway freight congestion."}
        ]
    }
]

def seed_database(db: Session, force: bool = False):
    """Seed initial data if tables are empty or force is True"""
    if force:
        db.query(Medicine).delete()
        db.query(Vendor).delete()
        db.query(PurchaseOrder).delete()
        db.query(StoreProfile).delete()
        db.commit()

    # Seed Store Profile
    if not db.query(StoreProfile).first():
        profile = StoreProfile(**INITIAL_STORE_PROFILE)
        db.add(profile)

    # Seed Medicines
    if db.query(Medicine).count() == 0:
        for med_data in INITIAL_MEDICINES:
            db.add(Medicine(**med_data))

    # Seed Vendors
    if db.query(Vendor).count() == 0:
        for ven_data in INITIAL_VENDORS:
            db.add(Vendor(**ven_data))

    # Seed Orders
    if db.query(PurchaseOrder).count() == 0:
        for po_data in INITIAL_ORDERS:
            db.add(PurchaseOrder(**po_data))

    db.commit()
