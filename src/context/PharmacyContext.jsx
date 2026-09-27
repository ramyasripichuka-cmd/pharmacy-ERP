import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialMedicines, initialVendors, initialPurchaseOrders, storeProfile, ORDER_TRACKING_STAGES } from '../data/mockData';
import { analyzeAllStock, analyzeStockItem } from '../utils/restockEngine';
import { simulateNegotiation, runMultiVendorTournament } from '../utils/negotiationAgent';
import api from '../utils/api';

export function formatINR(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const PharmacyContext = createContext(null);

const STORAGE_KEY_MEDICINES = "pharma_erp_medicines_v2";
const STORAGE_KEY_ORDERS = "pharma_erp_orders_v2";

export function PharmacyProvider({ children }) {
  // Load initial data with fallback to localStorage
  const [medicines, setMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEDICINES);
      return saved ? JSON.parse(saved) : initialMedicines;
    } catch {
      return initialMedicines;
    }
  });

  const [vendors, setVendors] = useState(initialVendors);
  const [profile, setProfile] = useState(storeProfile);
  
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
      return saved ? JSON.parse(saved) : initialPurchaseOrders;
    } catch {
      return initialPurchaseOrders;
    }
  });

  // Backend connection status
  const [backendConnected, setBackendConnected] = useState(false);

  // Settings
  const [targetBufferDays, setTargetBufferDays] = useState(21);
  const [strategyKey, setStrategyKey] = useState("BALANCED");
  
  // Navigation / Active View
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, inventory, alerts, vendors, negotiation, orders, tracking, analytics

  // Active negotiation workflow state
  const [activeNegotiationMed, setActiveNegotiationMed] = useState(null);
  const [activeNegotiationVendor, setActiveNegotiationVendor] = useState(null);
  const [negotiationResult, setNegotiationResult] = useState(null);
  const [negotiationMode, setNegotiationMode] = useState("single"); // 'single' | 'tournament'

  // Modal states
  const [previewPO, setPreviewPO] = useState(null);
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEDICINES, JSON.stringify(medicines));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [medicines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(purchaseOrders));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [purchaseOrders]);

  // Derived stock analysis with AI demand forecasting
  const stockAudit = analyzeAllStock(medicines, targetBufferDays);

  // Sync with FastAPI backend if available
  const syncWithBackend = useCallback(async () => {
    try {
      const isHealthy = await api.checkHealth();
      if (!isHealthy) {
        setBackendConnected(false);
        return;
      }
      setBackendConnected(true);

      const [medsRes, vendorsRes, ordersRes, profileRes] = await Promise.allSettled([
        api.getMedicines(),
        api.getVendors(),
        api.getOrders(),
        api.getStoreProfile()
      ]);

      if (medsRes.status === 'fulfilled' && Array.isArray(medsRes.value) && medsRes.value.length > 0) {
        setMedicines(medsRes.value);
      }
      if (vendorsRes.status === 'fulfilled' && Array.isArray(vendorsRes.value) && vendorsRes.value.length > 0) {
        setVendors(vendorsRes.value);
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) && ordersRes.value.length > 0) {
        setPurchaseOrders(ordersRes.value);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfile(profileRes.value);
      }
      console.log("[FastAPI] Synced state with SQLite backend.");
    } catch (e) {
      setBackendConnected(false);
      console.warn("[FastAPI] Backend unavailable, running with local storage cache.", e);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Notification helper
  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  /**
   * Starts a negotiation session for a specific medicine
   */
  const startNegotiation = (medicine, preferredVendor = null, mode = "single") => {
    const analyzed = analyzeStockItem(medicine, targetBufferDays);
    const targetVendor = preferredVendor || vendors.find(v => v.id === medicine.preferredVendorId) || vendors[0];
    
    setActiveNegotiationMed(analyzed);
    setActiveNegotiationVendor(targetVendor);
    setNegotiationMode(mode);

    if (mode === "tournament") {
      const tournament = runMultiVendorTournament({
        medicine: analyzed,
        vendors,
        recommendedQty: analyzed.recommendedQuantity,
        strategyKey
      });
      setNegotiationResult(tournament.winner);
    } else {
      const res = simulateNegotiation({
        medicine: analyzed,
        vendor: targetVendor,
        recommendedQty: analyzed.recommendedQuantity,
        strategyKey
      });
      setNegotiationResult(res);
    }

    setActiveTab("negotiation");
    addToast(`Negotiation AI initialized for ${medicine.name}`, "success");
  };

  /**
   * Re-runs the current negotiation with a new vendor or strategy
   */
  const refreshNegotiation = (vendor, newStrategyKey = strategyKey, customPrice = null) => {
    if (!activeNegotiationMed) return;

    setActiveNegotiationVendor(vendor);
    if (newStrategyKey) setStrategyKey(newStrategyKey);

    const res = simulateNegotiation({
      medicine: activeNegotiationMed,
      vendor,
      recommendedQty: activeNegotiationMed.recommendedQuantity,
      strategyKey: newStrategyKey || strategyKey,
      customTargetPrice: customPrice
    });

    setNegotiationResult(res);
    addToast(`Negotiated updated terms with ${vendor.shortName}`, "info");
  };

  /**
   * Posts finalized negotiated agreement to Mock ERP Ledger & initiates Order Tracking
   */
  const postPurchaseOrder = (dealSummary, customDeliveryNotes = "") => {
    const nextPoNum = `PO-2026-${String(purchaseOrders.length + 893).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const leadDays = dealSummary.finalLeadDays || 2;
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + leadDays);
    const expectedDeliveryDate = expDate.toISOString().split('T')[0];

    const carrierPrefix = dealSummary.vendorName.includes('Apex') ? 'BlueDart ColdChain' : dealSummary.vendorName.includes('BioCare') ? 'Delhivery Express Pharma' : 'VRL Medical Courier';
    const trackingNumber = `TRK-${dealSummary.vendorName.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 89999)}IN`;

    const newPO = {
      poNumber: nextPoNum,
      date: today,
      vendorId: dealSummary.vendorId,
      vendorName: dealSummary.vendorName,
      status: "PO Created",
      trackingStatus: "PO Created",
      trackingNumber,
      carrier: carrierPrefix,
      expectedDeliveryDate,
      deliveryProgress: 15,
      isDelayed: false,
      items: [
        {
          sku: dealSummary.sku,
          name: dealSummary.medicineName,
          quantity: dealSummary.finalQuantity,
          originalPrice: dealSummary.initialListPrice,
          negotiatedPrice: dealSummary.finalUnitPrice,
          total: dealSummary.finalTotal,
          savings: dealSummary.unitPriceSavings
        }
      ],
      totalAmount: dealSummary.finalTotal,
      totalSavings: dealSummary.unitPriceSavings,
      savingsPercentage: dealSummary.discountPercentage,
      deliveryDays: leadDays,
      paymentTerms: dealSummary.paymentTerms,
      negotiationRounds: dealSummary.roundsCount || 4,
      aiReasoning: dealSummary.keyAccomplishments ? dealSummary.keyAccomplishments.join(". ") : "AI optimized procurement terms.",
      customNotes: customDeliveryNotes,
      timeline: [
        {
          status: "PO Created",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: "LifeCare ERP Hub, Mumbai",
          desc: "Purchase Order verified by AI bargaining agent & written to ledger."
        }
      ]
    };

    // Sync to backend SQLite
    api.createOrder(newPO).catch(err => console.warn("[API] Failed to persist PO to backend:", err));

    setPurchaseOrders(prev => [newPO, ...prev]);
    addToast(`🎉 Purchase Order ${nextPoNum} posted to ERP! Total savings: ₹${dealSummary.unitPriceSavings.toLocaleString('en-IN')}`, "success");
    return newPO;
  };

  /**
   * FEATURE 3: Advance Order Tracking Stage
   * PO Created → Order Confirmed → Dispatched → In Transit → Out for Delivery → Delivered
   */
  const advanceOrderStatus = (poNumber) => {
    const STAGES = [
      { status: "PO Created", progress: 15, desc: "Digital purchase order transmitted and signed." },
      { status: "Order Confirmed", progress: 35, desc: "Vendor distributor confirmed batch allocation." },
      { status: "Dispatched", progress: 55, desc: "Package labeled and handed to pharmaceutical carrier." },
      { status: "In Transit", progress: 75, desc: "Shipment in transit between fulfillment hubs." },
      { status: "Out for Delivery", progress: 90, desc: "Assigned to courier van for pharmacy dock delivery." },
      { status: "Delivered", progress: 100, desc: "Delivered at pharmacy dock. Awaiting GRN verification." }
    ];

    setPurchaseOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.poNumber !== poNumber) return order;

        const currentIdx = STAGES.findIndex(s => s.status === (order.trackingStatus || order.status));
        const nextIdx = Math.min(STAGES.length - 1, currentIdx + 1);
        const nextStage = STAGES[nextIdx];

        const newTimeline = [...(order.timeline || [])];
        if (nextIdx !== currentIdx) {
          newTimeline.push({
            status: nextStage.status,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: nextStage.status === "Delivered" ? "LifeCare Receiving Dock" : "En-route Hub",
            desc: nextStage.desc
          });
        }

        const isNowDelivered = nextStage.status === "Delivered";

        return {
          ...order,
          status: isNowDelivered ? "Delivered (Awaiting GRN)" : nextStage.status,
          trackingStatus: nextStage.status,
          deliveryProgress: nextStage.progress,
          isDelayed: false,
          timeline: newTimeline
        };
      });
    });

    // Sync status change to backend
    api.advanceOrderStatus(poNumber).catch(e => console.warn("[API] Advance order error:", e));
    addToast(`Updated tracking status for ${poNumber}`, "info");
  };

  /**
   * Updates an order status directly
   */
  const updateOrderStatus = (poNumber, newStatus) => {
    const stageMap = {
      "PO Created": 15,
      "Order Confirmed": 35,
      "Dispatched": 55,
      "In Transit": 75,
      "Out for Delivery": 90,
      "Delivered": 100
    };

    setPurchaseOrders(prev => prev.map(o => {
      if (o.poNumber === poNumber) {
        return {
          ...o,
          status: newStatus,
          trackingStatus: newStatus,
          deliveryProgress: stageMap[newStatus] || 50
        };
      }
      return o;
    }));

    api.updateOrderStatus(poNumber, newStatus).catch(e => console.warn("[API] Update status error:", e));
  };

  /**
   * Toggles delayed order simulation for a purchase order
   */
  const toggleOrderDelayed = (poNumber) => {
    setPurchaseOrders(prev => prev.map(o => {
      if (o.poNumber === poNumber) {
        const nextState = !o.isDelayed;
        return {
          ...o,
          isDelayed: nextState
        };
      }
      return o;
    }));

    api.toggleOrderDelayed(poNumber).catch(e => console.warn("[API] Toggle delay error:", e));
    addToast(`Toggled delay simulation for PO ${poNumber}`, "info");
  };

  /**
   * Simulates Goods Received Note (GRN) - updates ERP inventory immediately!
   */
  const receiveGoods = (poNumber) => {
    const po = purchaseOrders.find(p => p.poNumber === poNumber);
    if (!po) return;

    if (po.status === "Delivered & Stock Updated") {
      addToast(`Order ${poNumber} is already received and stocked.`, "info");
      return;
    }

    // Increment stock for each item in the order
    setMedicines(prevMeds => {
      return prevMeds.map(med => {
        const orderItem = po.items.find(item => item.sku === med.sku);
        if (orderItem) {
          const newStock = med.currentStock + orderItem.quantity;
          return {
            ...med,
            currentStock: newStock
          };
        }
        return med;
      });
    });

    // Update PO status
    setPurchaseOrders(prevOrders => {
      return prevOrders.map(p => {
        if (p.poNumber === poNumber) {
          return {
            ...p,
            status: "Delivered & Stock Updated",
            trackingStatus: "Delivered",
            deliveryProgress: 100,
            receivedAt: new Date().toISOString()
          };
        }
        return p;
      });
    });

    // Sync to backend SQLite
    api.receiveGoods(poNumber).catch(e => console.warn("[API] GRN sync error:", e));

    addToast(`📦 Goods Receipt (GRN) confirmed! Stock updated for PO ${poNumber}.`, "success");
  };

  /**
   * Simulates daily pharmacy sales across stock to test dynamic reorder threshold alerts
   */
  const simulateDailySales = () => {
    setMedicines(prev => {
      return prev.map(m => {
        const sales = Math.min(m.currentStock, Math.round(m.dailySales));
        return {
          ...m,
          currentStock: Math.max(0, m.currentStock - sales)
        };
      });
    });

    api.simulateDailySales().catch(e => console.warn("[API] Simulate sales error:", e));
    addToast("Simulated 24 hours of customer prescriptions and OTC sales.", "info");
  };

  /**
   * Instant trigger to simulate urgent stockout on a chosen medicine
   */
  const triggerUrgentStockout = (sku) => {
    setMedicines(prev => {
      return prev.map(m => {
        if (m.sku === sku) {
          return {
            ...m,
            currentStock: 2
          };
        }
        return m;
      });
    });

    api.triggerUrgentStockout(sku).catch(e => console.warn("[API] Urgent stockout error:", e));
    addToast(`Critical stockout triggered for ${sku}. Sizing engine flagged immediate replenishment.`, "warning");
  };

  /**
   * Adds a new medicine SKU to the ERP
   */
  const addMedicine = (newMed) => {
    const medWithId = {
      ...newMed,
      id: `med-${Date.now()}`,
      currentStock: Number(newMed.currentStock) || 0,
      reorderThreshold: Number(newMed.reorderThreshold) || 50,
      dailySales: Number(newMed.dailySales) || 5,
      unitCost: Number(newMed.unitCost) || 120,
      mrp: Number(newMed.mrp) || 210,
      expiryDate: newMed.expiryDate || "2027-12-31",
      salesHistory: [5, 6, 5, 6, 7, 5, 6],
      seasonalTrend: { factor: 1.10, label: "New Listing Standard Velocity", confidence: 90 }
    };

    setMedicines(prev => [medWithId, ...prev]);

    // Sync to backend SQLite
    api.createMedicine(medWithId).catch(e => console.warn("[API] Add medicine error:", e));

    addToast(`Added ${newMed.name} to pharmacy inventory database.`, "success");
  };

  /**
   * Resets all demo data to clean defaults
   */
  const resetToDefaults = () => {
    setMedicines(initialMedicines);
    setPurchaseOrders(initialPurchaseOrders);
    localStorage.removeItem(STORAGE_KEY_MEDICINES);
    localStorage.removeItem(STORAGE_KEY_ORDERS);

    api.resetDefaults()
      .then(() => syncWithBackend())
      .catch(e => console.warn("[API] Reset defaults error:", e));

    addToast("Pharmacy ERP restored to initial demonstration dataset.", "info");
  };

  // Cumulative savings calculation
  const totalLifetimeSavings = purchaseOrders.reduce((sum, po) => sum + (po.totalSavings || 0), 0);
  const totalPurchasesAmount = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        vendors,
        storeProfile: profile,
        purchaseOrders,
        backendConnected,
        syncWithBackend,
        stockAudit,
        activeTab,
        setActiveTab,
        targetBufferDays,
        setTargetBufferDays,
        strategyKey,
        setStrategyKey,
        activeNegotiationMed,
        activeNegotiationVendor,
        negotiationResult,
        negotiationMode,
        setNegotiationMode,
        startNegotiation,
        refreshNegotiation,
        postPurchaseOrder,
        advanceOrderStatus,
        updateOrderStatus,
        toggleOrderDelayed,
        receiveGoods,
        simulateDailySales,
        triggerUrgentStockout,
        addMedicine,
        resetToDefaults,
        previewPO,
        setPreviewPO,
        isAddMedicineOpen,
        setIsAddMedicineOpen,
        toasts,
        addToast,
        totalLifetimeSavings,
        totalPurchasesAmount,
        formatINR
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error("usePharmacy must be used within a PharmacyProvider");
  }
  return context;
}
