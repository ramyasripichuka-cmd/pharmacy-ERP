from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class SeasonalTrend(BaseModel):
    factor: float = 1.0
    label: str = "Standard"
    confidence: float = 90.0

class MedicineBase(BaseModel):
    sku: str
    name: str
    generic: Optional[str] = ""
    category: Optional[str] = "General"
    form: Optional[str] = "Tablets"
    currentStock: float = 0
    reorderThreshold: float = 50
    dailySales: float = 5.0
    unitCost: float = 100.0
    mrp: float = 150.0
    expiryDate: Optional[str] = "2027-12-31"
    batchNumber: Optional[str] = ""
    storage: Optional[str] = "Room Temp"
    preferredVendorId: Optional[str] = "v1"
    notes: Optional[str] = ""
    salesHistory: Optional[List[float]] = [5, 6, 5, 6, 7, 5, 6]
    seasonalTrend: Optional[Dict[str, Any]] = None

class MedicineCreate(MedicineBase):
    id: Optional[str] = None

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic: Optional[str] = None
    category: Optional[str] = None
    form: Optional[str] = None
    currentStock: Optional[float] = None
    reorderThreshold: Optional[float] = None
    dailySales: Optional[float] = None
    unitCost: Optional[float] = None
    mrp: Optional[float] = None
    expiryDate: Optional[str] = None
    batchNumber: Optional[str] = None
    storage: Optional[str] = None
    preferredVendorId: Optional[str] = None
    notes: Optional[str] = None
    salesHistory: Optional[List[float]] = None
    seasonalTrend: Optional[Dict[str, Any]] = None

class MedicineResponse(MedicineBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class VendorResponse(BaseModel):
    id: str
    name: str
    shortName: str
    tagline: Optional[str] = ""
    badge: Optional[str] = ""
    reliabilityRating: float = 95.0
    onTimeDeliveryRate: str = "95.0%"
    standardLeadDays: int = 2
    expressLeadDays: int = 1
    freeShippingThreshold: float = 5000.0
    defaultPaymentTerms: str = "Net 30 Days"
    avatar: str = "📦"
    color: str = "#3b82f6"
    reliabilityMetrics: Optional[Dict[str, Any]] = {}
    persona: Optional[Dict[str, Any]] = {}
    catalog: Optional[Dict[str, Any]] = {}

    model_config = ConfigDict(from_attributes=True)

class PurchaseOrderItem(BaseModel):
    sku: str
    name: str
    quantity: int
    originalPrice: float
    negotiatedPrice: float
    total: float
    savings: float

class TimelineItem(BaseModel):
    status: str
    time: str
    location: str
    desc: str

class PurchaseOrderCreate(BaseModel):
    poNumber: Optional[str] = None
    date: Optional[str] = None
    vendorId: str
    vendorName: str
    status: Optional[str] = "PO Created"
    trackingStatus: Optional[str] = "PO Created"
    trackingNumber: Optional[str] = ""
    carrier: Optional[str] = ""
    expectedDeliveryDate: Optional[str] = ""
    deliveredDate: Optional[str] = None
    isDelayed: Optional[bool] = False
    deliveryProgress: Optional[int] = 15
    items: List[Dict[str, Any]]
    totalAmount: float
    totalSavings: float
    savingsPercentage: Optional[float] = 0.0
    deliveryDays: Optional[int] = 2
    paymentTerms: Optional[str] = "Net 30 Days"
    negotiationRounds: Optional[int] = 3
    aiReasoning: Optional[str] = ""
    customNotes: Optional[str] = ""
    timeline: Optional[List[Dict[str, Any]]] = None

class PurchaseOrderUpdateStatus(BaseModel):
    status: str

class PurchaseOrderResponse(BaseModel):
    poNumber: str
    date: str
    vendorId: str
    vendorName: str
    status: str
    trackingStatus: str
    trackingNumber: str
    carrier: str
    expectedDeliveryDate: str
    deliveredDate: Optional[str] = None
    isDelayed: bool
    deliveryProgress: int
    items: List[Dict[str, Any]]
    totalAmount: float
    totalSavings: float
    savingsPercentage: float
    deliveryDays: int
    paymentTerms: str
    negotiationRounds: int
    aiReasoning: str
    customNotes: str
    timeline: List[Dict[str, Any]]
    receivedAt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class StoreProfileResponse(BaseModel):
    name: str
    branch: str
    licenseNo: str
    gstNumber: str
    address: str
    phone: str
    email: str
    pharmacistInCharge: str
    monthlyProcurementBudget: float
    currentMonthSpend: float

    model_config = ConfigDict(from_attributes=True)

class StoreProfileUpdate(BaseModel):
    name: Optional[str] = None
    branch: Optional[str] = None
    licenseNo: Optional[str] = None
    gstNumber: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    pharmacistInCharge: Optional[str] = None
    monthlyProcurementBudget: Optional[float] = None
    currentMonthSpend: Optional[float] = None

class NegotiationRequest(BaseModel):
    sku: str
    vendorId: Optional[str] = None
    strategyKey: Optional[str] = "BALANCED"
    customTargetPrice: Optional[float] = None
    mode: Optional[str] = "single"

class MessageResponse(BaseModel):
    message: str
    success: bool = True
