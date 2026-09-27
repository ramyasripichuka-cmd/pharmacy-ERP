from sqlalchemy import Column, String, Integer, Float, Boolean, Text, JSON, DateTime
from datetime import datetime
from .database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False, index=True)
    generic = Column(String, default="")
    category = Column(String, default="General", index=True)
    form = Column(String, default="Tablets")
    currentStock = Column(Float, default=0)
    reorderThreshold = Column(Float, default=50)
    dailySales = Column(Float, default=5.0)
    unitCost = Column(Float, default=100.0)
    mrp = Column(Float, default=150.0)
    expiryDate = Column(String, default="")
    batchNumber = Column(String, default="")
    storage = Column(String, default="Room Temp")
    preferredVendorId = Column(String, default="v1")
    notes = Column(Text, default="")
    salesHistory = Column(JSON, default=list)
    seasonalTrend = Column(JSON, default=dict)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "sku": self.sku,
            "name": self.name,
            "generic": self.generic,
            "category": self.category,
            "form": self.form,
            "currentStock": self.currentStock,
            "reorderThreshold": self.reorderThreshold,
            "dailySales": self.dailySales,
            "unitCost": self.unitCost,
            "mrp": self.mrp,
            "expiryDate": self.expiryDate,
            "batchNumber": self.batchNumber,
            "storage": self.storage,
            "preferredVendorId": self.preferredVendorId,
            "notes": self.notes,
            "salesHistory": self.salesHistory or [],
            "seasonalTrend": self.seasonalTrend or {"factor": 1.0, "label": "Normal", "confidence": 90}
        }


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    shortName = Column(String, nullable=False)
    tagline = Column(String, default="")
    badge = Column(String, default="")
    reliabilityRating = Column(Float, default=95.0)
    onTimeDeliveryRate = Column(String, default="95.0%")
    standardLeadDays = Column(Integer, default=2)
    expressLeadDays = Column(Integer, default=1)
    freeShippingThreshold = Column(Float, default=5000.0)
    defaultPaymentTerms = Column(String, default="Net 30 Days")
    avatar = Column(String, default="📦")
    color = Column(String, default="#3b82f6")
    reliabilityMetrics = Column(JSON, default=dict)
    persona = Column(JSON, default=dict)
    catalog = Column(JSON, default=dict)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "shortName": self.shortName,
            "tagline": self.tagline,
            "badge": self.badge,
            "reliabilityRating": self.reliabilityRating,
            "onTimeDeliveryRate": self.onTimeDeliveryRate,
            "standardLeadDays": self.standardLeadDays,
            "expressLeadDays": self.expressLeadDays,
            "freeShippingThreshold": self.freeShippingThreshold,
            "defaultPaymentTerms": self.defaultPaymentTerms,
            "avatar": self.avatar,
            "color": self.color,
            "reliabilityMetrics": self.reliabilityMetrics or {},
            "persona": self.persona or {},
            "catalog": self.catalog or {}
        }


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    poNumber = Column(String, primary_key=True, index=True)
    date = Column(String, nullable=False)
    vendorId = Column(String, nullable=False, index=True)
    vendorName = Column(String, nullable=False)
    status = Column(String, default="PO Created")
    trackingStatus = Column(String, default="PO Created")
    trackingNumber = Column(String, default="")
    carrier = Column(String, default="")
    expectedDeliveryDate = Column(String, default="")
    deliveredDate = Column(String, nullable=True)
    isDelayed = Column(Boolean, default=False)
    deliveryProgress = Column(Integer, default=15)
    items = Column(JSON, default=list)
    totalAmount = Column(Float, default=0.0)
    totalSavings = Column(Float, default=0.0)
    savingsPercentage = Column(Float, default=0.0)
    deliveryDays = Column(Integer, default=2)
    paymentTerms = Column(String, default="Net 30 Days")
    negotiationRounds = Column(Integer, default=3)
    aiReasoning = Column(Text, default="")
    customNotes = Column(Text, default="")
    timeline = Column(JSON, default=list)
    receivedAt = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "poNumber": self.poNumber,
            "date": self.date,
            "vendorId": self.vendorId,
            "vendorName": self.vendorName,
            "status": self.status,
            "trackingStatus": self.trackingStatus,
            "trackingNumber": self.trackingNumber,
            "carrier": self.carrier,
            "expectedDeliveryDate": self.expectedDeliveryDate,
            "deliveredDate": self.deliveredDate,
            "isDelayed": self.isDelayed,
            "deliveryProgress": self.deliveryProgress,
            "items": self.items or [],
            "totalAmount": self.totalAmount,
            "totalSavings": self.totalSavings,
            "savingsPercentage": self.savingsPercentage,
            "deliveryDays": self.deliveryDays,
            "paymentTerms": self.paymentTerms,
            "negotiationRounds": self.negotiationRounds,
            "aiReasoning": self.aiReasoning,
            "customNotes": self.customNotes,
            "timeline": self.timeline or [],
            "receivedAt": self.receivedAt
        }


class StoreProfile(Base):
    __tablename__ = "store_profile"

    id = Column(Integer, primary_key=True, default=1)
    name = Column(String, nullable=False)
    branch = Column(String, default="")
    licenseNo = Column(String, default="")
    gstNumber = Column(String, default="")
    address = Column(String, default="")
    phone = Column(String, default="")
    email = Column(String, default="")
    pharmacistInCharge = Column(String, default="")
    monthlyProcurementBudget = Column(Float, default=350000.0)
    currentMonthSpend = Column(Float, default=185000.0)

    def to_dict(self):
        return {
            "name": self.name,
            "branch": self.branch,
            "licenseNo": self.licenseNo,
            "gstNumber": self.gstNumber,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "pharmacistInCharge": self.pharmacistInCharge,
            "monthlyProcurementBudget": self.monthlyProcurementBudget,
            "currentMonthSpend": self.currentMonthSpend
        }
