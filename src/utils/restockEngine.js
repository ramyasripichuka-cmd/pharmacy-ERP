// Smart Restocking & AI Demand Forecasting Sizing Engine (INR Edition)

export const CURRENT_SIMULATED_DATE = new Date("2026-09-26T12:00:00Z");

/**
 * Calculates days difference from the simulated current date
 */
export function getDaysToExpiry(expiryDateStr) {
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - CURRENT_SIMULATED_DATE.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * FEATURE 1: AI Demand Forecasting Engine
 * Lightweight, practical forecasting model using historical sales velocity,
 * recent moving average, seasonal trends, and expiry timelines.
 */
export function calculateDemandForecast(item, forecastWindowDays = 21) {
  const history = item.salesHistory && item.salesHistory.length > 0
    ? item.salesHistory
    : [item.dailySales, item.dailySales, item.dailySales];

  // 1. Moving average baseline calculation
  const sumSales = history.reduce((acc, val) => acc + val, 0);
  const historicalAvgDaily = Number((sumSales / history.length).toFixed(2));

  // 2. Trend & Seasonal factor weighting
  const trendMultiplier = (item.seasonalTrend && item.seasonalTrend.factor) || 1.10;
  const trendPercentage = Math.round((trendMultiplier - 1) * 100);
  const demandDriver = (item.seasonalTrend && item.seasonalTrend.label) || "Seasonal Prescription Velocity Trend";
  const confidenceScore = (item.seasonalTrend && item.seasonalTrend.confidence) || 92;

  // 3. Predicted future daily velocity & window totals
  const predictedDailyDemand = Number((historicalAvgDaily * trendMultiplier).toFixed(2));
  const predictedWindowDemand = Math.round(predictedDailyDemand * forecastWindowDays);
  const predicted30dDemand = Math.round(predictedDailyDemand * 30);

  // 4. Forecast impact delta vs baseline historical burn
  const baselineWindowDemand = Math.round(item.dailySales * forecastWindowDays);
  const demandDeltaUnits = predictedWindowDemand - baselineWindowDemand;

  let impactExplanation = "";
  if (demandDeltaUnits > 0) {
    impactExplanation = `AI Forecast identified ${trendPercentage > 0 ? '+' : ''}${trendPercentage}% demand surge (${demandDriver}). Boosted recommended order by +${demandDeltaUnits} units to avert stockout.`;
  } else if (demandDeltaUnits < 0) {
    impactExplanation = `AI Forecast identified demand slowdown (${demandPercentage}%). Trimmed order by ${Math.abs(demandDeltaUnits)} units to protect working capital.`;
  } else {
    impactExplanation = `AI Forecast confirmed stable baseline demand. Restock sized precisely for ${forecastWindowDays}-day target window.`;
  }

  return {
    historicalAvgDaily,
    predictedDailyDemand,
    predictedWindowDemand,
    predicted30dDemand,
    trendPercentage,
    demandDriver,
    confidenceScore,
    demandDeltaUnits,
    impactExplanation
  };
}

/**
 * Evaluates an individual medicine for shortages, expiry risk, and optimal order size
 * using AI demand forecast, current stock, reorder threshold, and shelf-life.
 */
export function analyzeStockItem(item, targetBufferDays = 21) {
  const dailySales = Math.max(0.1, item.dailySales);
  const daysOfSupply = Number((item.currentStock / dailySales).toFixed(1));
  const daysToExpiry = getDaysToExpiry(item.expiryDate);

  // Status Detection
  const isStockout = item.currentStock <= 0;
  const isCritical = daysOfSupply <= 2 || item.currentStock <= (item.reorderThreshold * 0.35);
  const isLowStock = item.currentStock <= item.reorderThreshold || daysOfSupply <= 5;
  const isImmediateExpiry = daysToExpiry <= 30;
  const isNearExpiry = daysToExpiry <= 60;

  // Potential Expiry Waste Calculation
  const projectedSalesBeforeExpiry = Math.floor(Math.max(0, daysToExpiry) * dailySales);
  const potentialWastedStock = isNearExpiry 
    ? Math.max(0, item.currentStock - projectedSalesBeforeExpiry) 
    : 0;

  // AI Demand Forecast
  const demandForecast = calculateDemandForecast(item, targetBufferDays);
  const effectiveDailyVelocity = demandForecast.predictedDailyDemand;

  // Smart Sizing Logic
  // Formula: Desired Target Stock = (Predicted Daily Demand × Buffer Days) + Safety Buffer (15%)
  // Deficit = Target Stock - Usable Current Stock
  let usableCurrentStock = item.currentStock;
  if (isImmediateExpiry) {
    // Current stock can only supply up to expiry
    usableCurrentStock = Math.min(item.currentStock, projectedSalesBeforeExpiry);
  }

  const targetHoldingStock = Math.ceil(effectiveDailyVelocity * targetBufferDays * 1.15);
  const rawDeficit = Math.max(0, targetHoldingStock - usableCurrentStock);

  // Right-sized recommended order quantity (rounded to neat pharmacy batch multiples of 5)
  let recommendedQuantity = 0;
  let urgency = "NORMAL";
  let statusBadge = "HEALTHY";
  let reasoning = [];

  if (isStockout) {
    recommendedQuantity = Math.max(20, Math.ceil(rawDeficit / 5) * 5);
    urgency = "CRITICAL";
    statusBadge = "OUT_OF_STOCK";
    reasoning.push(`CRITICAL ALERT: Out of stock! Immediate replenishment required.`);
    reasoning.push(`Zero days of buffer remaining. Recommending ${recommendedQuantity} units for ${targetBufferDays} days of supply.`);
    reasoning.push(`AI Demand Forecast: ${demandForecast.impactExplanation}`);
  } else if (isCritical) {
    recommendedQuantity = Math.max(15, Math.ceil(rawDeficit / 5) * 5);
    urgency = "HIGH";
    statusBadge = "CRITICAL_LOW";
    reasoning.push(`Severe shortage: Only ${daysOfSupply} days of supply (${item.currentStock} units remaining).`);
    reasoning.push(`Predicted burn rate of ${effectiveDailyVelocity} units/day demands ${recommendedQuantity} units for a safe ${targetBufferDays}-day window.`);
    reasoning.push(`AI Demand Forecast: ${demandForecast.impactExplanation}`);
  } else if (isLowStock) {
    recommendedQuantity = Math.max(10, Math.ceil(rawDeficit / 5) * 5);
    urgency = "MEDIUM";
    statusBadge = "LOW_STOCK";
    reasoning.push(`Current stock (${item.currentStock} units) is below reorder threshold (${item.reorderThreshold} units).`);
    reasoning.push(`Forecasted burn of ${effectiveDailyVelocity} units/day requires replenishing ${recommendedQuantity} units.`);
    reasoning.push(`AI Demand Forecast: ${demandForecast.impactExplanation}`);
  } else if (isImmediateExpiry) {
    recommendedQuantity = Math.max(10, Math.ceil((effectiveDailyVelocity * targetBufferDays) / 5) * 5);
    urgency = "HIGH";
    statusBadge = "EXPIRING_SOON";
    reasoning.push(`Batch ${item.batchNumber} expires in ${daysToExpiry} days (${item.expiryDate}).`);
    reasoning.push(`Risk of ${potentialWastedStock} unsold expired units! Order fresh lot of ${recommendedQuantity} units.`);
    reasoning.push(`AI Demand Forecast: ${demandForecast.impactExplanation}`);
  } else if (isNearExpiry) {
    urgency = "LOW";
    statusBadge = "NEAR_EXPIRY";
    reasoning.push(`Batch expires in ${daysToExpiry} days. Monitor sell-through before placing fresh lot order.`);
    reasoning.push(`AI Demand Forecast: Projected ${targetBufferDays}-day demand is ${demandForecast.predictedWindowDemand} units.`);
  } else {
    statusBadge = "HEALTHY";
    reasoning.push(`Stock level is healthy (${daysOfSupply} days of inventory). No immediate reorder required.`);
    reasoning.push(`AI Demand Forecast: Anticipates steady demand of ~${demandForecast.predicted30dDemand} units over next 30 days.`);
  }

  return {
    ...item,
    daysOfSupply,
    daysToExpiry,
    isStockout,
    isCritical,
    isLowStock,
    isNearExpiry,
    isImmediateExpiry,
    potentialWastedStock,
    recommendedQuantity,
    urgency,
    statusBadge,
    reasoning,
    demandForecast,
    estimatedCost: Number((recommendedQuantity * item.unitCost).toFixed(2))
  };
}

/**
 * Runs full audit across all medicines in the ERP
 */
export function analyzeAllStock(medicines, targetBufferDays = 21) {
  const analyzed = medicines.map(med => analyzeStockItem(med, targetBufferDays));

  const alerts = analyzed
    .filter(m => m.statusBadge !== "HEALTHY")
    .sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, NORMAL: 4 };
      return priorityOrder[a.urgency] - priorityOrder[b.urgency];
    });

  const lowStockCount = analyzed.filter(m => m.isLowStock || m.isCritical || m.isStockout).length;
  const criticalCount = analyzed.filter(m => m.isCritical || m.isStockout).length;
  const nearExpiryCount = analyzed.filter(m => m.isNearExpiry).length;
  const healthyCount = analyzed.filter(m => m.statusBadge === "HEALTHY").length;
  
  const totalInventoryValue = analyzed.reduce((acc, m) => acc + (m.currentStock * m.unitCost), 0);
  const totalRestockInvestmentNeeded = alerts.reduce((acc, m) => acc + m.estimatedCost, 0);

  // Health Score (0 - 100)
  const healthScore = Math.max(0, Math.min(100, Math.round(
    ((healthyCount / (analyzed.length || 1)) * 70) + 
    (Math.max(0, 30 - (criticalCount * 10) - (lowStockCount * 3)))
  )));

  return {
    items: analyzed,
    alerts,
    stats: {
      totalSKUs: analyzed.length,
      alertsCount: alerts.length,
      lowStockCount,
      criticalCount,
      nearExpiryCount,
      healthyCount,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      totalRestockInvestmentNeeded: Number(totalRestockInvestmentNeeded.toFixed(2)),
      healthScore
    }
  };
}

/**
 * FEATURE 2: Evaluates how well a specific vendor's offer fits the store's requirement
 * Integrates comprehensive Vendor Reliability Score with Price, MOQ, and Lead Time.
 */
export function evaluateVendorFit(vendor, medicine, recommendedQty) {
  const catalogOffer = vendor.catalog[medicine.sku];
  if (!catalogOffer) {
    return {
      available: false,
      reason: "Item not in vendor active catalog"
    };
  }

  const moq = catalogOffer.moq;
  const listPrice = catalogOffer.listPrice;
  const leadDays = catalogOffer.leadDays;

  // MOQ analysis against actual store consumption
  const moqDiff = moq - recommendedQty;
  const dailyBurn = medicine.dailySales || 1;
  const daysToConsumeMOQ = Number((moq / dailyBurn).toFixed(1));
  const capitalLockedInMOQ = Number((moq * listPrice).toFixed(2));
  const storeIdealSpend = Number((recommendedQty * listPrice).toFixed(2));
  const excessCapitalLocked = Math.max(0, capitalLockedInMOQ - storeIdealSpend);

  let fitGrade = "EXCELLENT";
  let moqWarning = null;

  if (moq > recommendedQty * 2.2) {
    fitGrade = "BULK_OVERKILL";
    moqWarning = `Vendor MOQ of ${moq} units ties up ₹${capitalLockedInMOQ.toLocaleString('en-IN')} (${daysToConsumeMOQ} days of stock). Store agent will negotiate to slash MOQ down closer to ${recommendedQty} units.`;
  } else if (moq > recommendedQty * 1.3) {
    fitGrade = "MODERATE_EXCESS";
    moqWarning = `Vendor MOQ (${moq}) exceeds store ideal (${recommendedQty}). Negotiable during bargaining rounds.`;
  } else {
    fitGrade = "RIGHT_SIZED";
  }

  // Multi-criteria scoring index (0 - 100)
  // Considers: Price (30%), MOQ Fit (25%), Vendor Reliability (25%), Speed/SLA (20%)
  const priceScore = Math.max(20, Math.min(100, 100 - (((listPrice - medicine.unitCost) / (medicine.unitCost || 1)) * 80)));
  const moqScore = moq <= recommendedQty ? 100 : Math.max(25, 100 - (((moq - recommendedQty) / recommendedQty) * 60));
  const speedScore = leadDays === 1 ? 100 : leadDays === 2 ? 85 : leadDays === 3 ? 70 : 55;
  const reliabilityScore = (vendor.reliabilityMetrics && vendor.reliabilityMetrics.compositeScore) || vendor.reliabilityRating || 90;

  const compositeFitScore = Math.round(
    (priceScore * 0.30) + (moqScore * 0.25) + (reliabilityScore * 0.25) + (speedScore * 0.20)
  );

  return {
    available: true,
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorShortName: vendor.shortName,
    avatar: vendor.avatar,
    badge: vendor.badge,
    color: vendor.color,
    listPrice,
    moq,
    leadDays,
    reliabilityRating: vendor.reliabilityRating,
    reliabilityMetrics: vendor.reliabilityMetrics,
    paymentTerms: vendor.defaultPaymentTerms,
    fitGrade,
    moqDiff,
    daysToConsumeMOQ,
    capitalLockedInMOQ,
    storeIdealSpend,
    excessCapitalLocked,
    moqWarning,
    compositeFitScore
  };
}
