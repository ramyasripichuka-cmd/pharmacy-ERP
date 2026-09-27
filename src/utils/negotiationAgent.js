// Multi-Agent Negotiation & Autonomous Bargaining Engine

import { evaluateVendorFit } from './restockEngine';

export const NEGOTIATION_STRATEGIES = {
  BALANCED: {
    id: "BALANCED",
    name: "Balanced Need-Focused (Recommended)",
    description: "Prioritizes store right-sizing, eliminates excess bulk MOQ, and seeks fair 10-15% price discounts without risking supplier relationship.",
    targetDiscount: 0.12,
    moqToleranceRatio: 1.25,
    speedImportance: "MODERATE"
  },
  AGGRESSIVE_COST: {
    id: "AGGRESSIVE_COST",
    name: "Aggressive Margin Maximizer",
    description: "Hard bargaining on unit price. Leverages competitor price benchmarks to squeeze maximum price concessions.",
    targetDiscount: 0.17,
    moqToleranceRatio: 1.5,
    speedImportance: "LOW"
  },
  SAFETY_SPEED: {
    id: "SAFETY_SPEED",
    name: "Urgent Stockout / Speed-First",
    description: "Focuses on guaranteed 24-48h expedited delivery and strict batch expiry freshness, accepting slight price premiums.",
    targetDiscount: 0.08,
    moqToleranceRatio: 1.05,
    speedImportance: "HIGH"
  }
};

/**
 * Generates an intelligent, multi-round negotiation transcript between
 * Store Agent (Dr. Sizer AI) and a specific Vendor Agent.
 */
export function simulateNegotiation({
  medicine,
  vendor,
  recommendedQty,
  strategyKey = "BALANCED",
  customTargetPrice = null
}) {
  const strategy = NEGOTIATION_STRATEGIES[strategyKey] || NEGOTIATION_STRATEGIES.BALANCED;
  const vendorFit = evaluateVendorFit(vendor, medicine, recommendedQty);
  
  if (!vendorFit.available) {
    return {
      success: false,
      error: "Vendor cannot fulfill this SKU"
    };
  }

  const catalogListPrice = vendorFit.listPrice;
  const vendorMOQ = vendorFit.moq;
  const standardLead = vendorFit.leadDays;

  // Sizing dynamics
  const storeIdealQty = recommendedQty;
  const targetPriceGoal = customTargetPrice 
    ? Number(customTargetPrice) 
    : Number((catalogListPrice * (1 - strategy.targetDiscount)).toFixed(2));

  // Concession calculation based on vendor persona and store leverage
  const maxVendorDiscount = vendor.persona.baseDiscountMax || 0.12;
  const moqFlexibility = vendor.persona.moqFlexibility || 0.40;

  // Conceded values after rounds
  const effectiveDiscountRate = Math.min(strategy.targetDiscount, maxVendorDiscount);
  const finalUnitPrice = Number((catalogListPrice * (1 - effectiveDiscountRate)).toFixed(2));
  
  // MOQ concession
  const moqReduction = Math.round((vendorMOQ - storeIdealQty) * moqFlexibility);
  const finalAgreedQty = Math.max(storeIdealQty, vendorMOQ - moqReduction);

  // Delivery concession
  const finalLeadDays = Math.max(1, standardLead > 2 ? standardLead - 1 : standardLead);

  // Initial offer baseline (Vendor's rigid first quote)
  const initialQuoteTotal = Number((vendorMOQ * catalogListPrice).toFixed(2));
  
  // Final agreed order
  const finalOrderTotal = Number((finalAgreedQty * finalUnitPrice).toFixed(2));
  
  // Savings metrics
  // 1. Direct unit price savings on the agreed quantity:
  const unitPriceSavings = Number(((catalogListPrice - finalUnitPrice) * finalAgreedQty).toFixed(2));
  // 2. Capital preserved by avoiding vendor's forced excess MOQ:
  const capitalPreservedFromOverordering = Math.max(0, initialQuoteTotal - finalOrderTotal);
  // Total direct price discount percentage
  const discountPercentage = Number((((catalogListPrice - finalUnitPrice) / catalogListPrice) * 100).toFixed(1));

  // Transcript Generation
  const rounds = [
    {
      round: 1,
      phase: "RFQ_AND_INITIAL_QUOTE",
      title: "Round 1: Request for Quotation & Initial Vendor Terms",
      messages: [
        {
          sender: "STORE_AGENT",
          senderName: "Pharma Restock Agent",
          avatar: "🤖",
          timestamp: "10:14:02 AM",
          role: "buyer",
          content: `Formal RFQ initiated for SKU: ${medicine.sku} (${medicine.name}). Our ERP burn velocity is ${medicine.dailySales} units/day${medicine.demandForecast ? ` (AI Forecast predicts ${medicine.demandForecast.trendPercentage > 0 ? '+' : ''}${medicine.demandForecast.trendPercentage}% demand trend: ${medicine.demandForecast.demandDriver})` : ''}. We have ${medicine.currentStock} units on hand. We request an optimal restock order of ${storeIdealQty} units.`
        },
        {
          sender: "VENDOR_AGENT",
          senderName: `${vendor.shortName} Sales Agent`,
          avatar: vendor.avatar,
          timestamp: "10:14:15 AM",
          role: "seller",
          content: `Thank you for your inquiry. Our standard catalog price for ${medicine.name} is ₹${catalogListPrice.toFixed(2)}/unit. Standard distribution requires a Minimum Order Quantity (MOQ) of ${vendorMOQ} units with ${standardLead}-day ground transit (Terms: ${vendor.defaultPaymentTerms}, Vendor Reliability Score: ${vendor.reliabilityRating}%). Initial quote total: ₹${initialQuoteTotal.toFixed(2)}.`
        }
      ]
    },
    {
      round: 2,
      phase: "STORE_COUNTER_AND_LEVERAGE",
      title: "Round 2: Store Agent Counter & Data-Backed Leverage",
      messages: [
        {
          sender: "STORE_AGENT",
          senderName: "Pharma Restock Agent",
          avatar: "🤖",
          timestamp: "10:14:38 AM",
          role: "buyer",
          content: `We cannot accept ${vendorMOQ} units at catalog list price ₹${catalogListPrice.toFixed(2)}. Based on our consumption rate of ${medicine.dailySales} units/day, ordering ${vendorMOQ} units forces ${vendorFit.daysToConsumeMOQ} days of inventory and ties up ₹${vendorFit.capitalLockedInMOQ.toLocaleString('en-IN')} in working capital with humidity and shelf-life risks. Furthermore, our peer benchmarking index indicates a market target of ₹${targetPriceGoal.toFixed(2)}/unit. We propose: ${storeIdealQty} units at ₹${targetPriceGoal.toFixed(2)}/unit with priority ${finalLeadDays}-day dispatch.`
        }
      ]
    },
    {
      round: 3,
      phase: "VENDOR_CONCESSIONS",
      title: "Round 3: Vendor Flexibility & Compromise Offer",
      messages: [
        {
          sender: "VENDOR_AGENT",
          senderName: `${vendor.shortName} Sales Agent`,
          avatar: vendor.avatar,
          timestamp: "10:15:04 AM",
          role: "seller",
          content: vendor.id === "v2" 
            ? `We acknowledge your velocity constraints. While our policy enforces 180 MOQ, we can offer an exceptional split-tier allocation: We will reduce MOQ from ${vendorMOQ} down to ${finalAgreedQty} units. Additionally, we will drop the unit price from ₹${catalogListPrice.toFixed(2)} to ₹${finalUnitPrice.toFixed(2)} (${discountPercentage}% discount) if signed off today.`
            : `We value LifeCare Pharmacy's tier-1 account standing. We agree to reduce our delivery lead time to ${finalLeadDays} business day(s) with express freight waived. For batch size of ${finalAgreedQty} units, we will adjust the unit price from ₹${catalogListPrice.toFixed(2)} down to ₹${finalUnitPrice.toFixed(2)} (totaling ₹${finalOrderTotal.toFixed(2)}).`
        }
      ]
    },
    {
      round: 4,
      phase: "FINAL_ACCORD",
      title: "Round 4: Accord Finalized & Terms Sealed",
      messages: [
        {
          sender: "STORE_AGENT",
          senderName: "Pharma Restock Agent",
          avatar: "🤖",
          timestamp: "10:15:22 AM",
          role: "buyer",
          content: `Offer accepted! Terms locked at ₹${finalUnitPrice.toFixed(2)}/unit for ${finalAgreedQty} units (Total: ₹${finalOrderTotal.toFixed(2)}). Delivery committed in ${finalLeadDays} day(s) under ${vendor.defaultPaymentTerms}. Net direct savings achieved: ₹${unitPriceSavings.toFixed(2)} (${discountPercentage}% off list). Writing Purchase Order to ERP.`
        },
        {
          sender: "VENDOR_AGENT",
          senderName: `${vendor.shortName} Sales Agent`,
          avatar: vendor.avatar,
          timestamp: "10:15:30 AM",
          role: "seller",
          content: `Confirmed! Batch reservation secured. Digital sales order generated. Ready for ERP Purchase Order transmission.`
        }
      ]
    }
  ];

  // AI Decision & Justification Summary
  const vendorReliability = (vendor.reliabilityMetrics && vendor.reliabilityMetrics.compositeScore) || vendor.reliabilityRating || 90;
  const compositeUtilityScore = Math.round(
    (discountPercentage * 2.2) + 
    ((vendorMOQ - finalAgreedQty) > 0 ? 25 : 15) + 
    (vendorReliability * 0.40) + 
    (finalLeadDays <= 2 ? 20 : 10)
  );

  const aiExecutiveSummary = {
    decision: "DEAL_APPROVED",
    medicineName: medicine.name,
    sku: medicine.sku,
    vendorId: vendor.id,
    vendorName: vendor.name,
    strategyUsed: strategy.name,
    initialListPrice: catalogListPrice,
    initialMOQ: vendorMOQ,
    initialTotal: initialQuoteTotal,
    finalUnitPrice,
    finalQuantity: finalAgreedQty,
    finalTotal: finalOrderTotal,
    finalLeadDays,
    paymentTerms: vendor.defaultPaymentTerms,
    unitPriceSavings,
    capitalPreservedFromOverordering,
    discountPercentage,
    vendorReliability,
    vendorReliabilityGrade: vendor.reliabilityMetrics?.grade || 'Tier-1 A',
    roundsCount: 4,
    compositeUtilityScore,
    keyAccomplishments: [
      `Slashed unit price by ${discountPercentage}% (₹${catalogListPrice.toFixed(2)} → ₹${finalUnitPrice.toFixed(2)})`,
      vendorMOQ > finalAgreedQty 
        ? `Overcame bulk minimum: Reduced mandatory quantity from ${vendorMOQ} to ${finalAgreedQty} units (prevented ₹${capitalPreservedFromOverordering.toLocaleString('en-IN')} working capital lockup)`
        : `Quantity right-sized precisely to store buffer (${finalAgreedQty} units)`,
      `Locked in ${finalLeadDays}-day dispatch SLA with ${vendor.reliabilityRating}% vendor reliability score (${vendor.reliabilityMetrics?.grade || 'Tier-1'})`,
      `Payment terms secured at ${vendor.defaultPaymentTerms}`
    ]
  };

  return {
    success: true,
    vendor,
    medicine,
    rounds,
    aiExecutiveSummary
  };
}

/**
 * Runs a multi-vendor tournament where Store Agent simultaneously negotiates
 * with all available distributors and picks the optimal winner using multi-criteria utility scoring:
 * Considers Price, MOQ Right-Sizing, Delivery SLA, and Vendor Reliability.
 * Does NOT simply pick the cheapest vendor!
 */
export function runMultiVendorTournament({
  medicine,
  vendors,
  recommendedQty,
  strategyKey = "BALANCED"
}) {
  const results = vendors.map(vendor => {
    return simulateNegotiation({
      medicine,
      vendor,
      recommendedQty,
      strategyKey
    });
  }).filter(res => res.success);

  if (results.length === 0) {
    return null;
  }

  // Rank by composite utility score (balances price savings, reliability score, MOQ fit, speed)
  results.sort((a, b) => b.aiExecutiveSummary.compositeUtilityScore - a.aiExecutiveSummary.compositeUtilityScore);

  const bestDeal = results[0];
  const runnersUp = results.slice(1);

  // Check if winner was chosen despite not having the lowest raw catalog price
  const isWinnerLowestListPrice = runnersUp.every(r => r.aiExecutiveSummary.initialListPrice >= bestDeal.aiExecutiveSummary.initialListPrice);
  let reliabilityNuance = "";
  if (!isWinnerLowestListPrice) {
    reliabilityNuance = ` Note: Although an alternate distributor offered a lower initial list price, ${bestDeal.vendor.shortName} was selected due to superior Reliability (${bestDeal.vendor.reliabilityRating}% vs competitors), faster ${bestDeal.aiExecutiveSummary.finalLeadDays}-day dispatch, and flexible MOQ avoiding capital lockup.`;
  } else {
    reliabilityNuance = ` Delivers top reliability rating (${bestDeal.vendor.reliabilityRating}%) alongside optimal unit price economics.`;
  }

  // Selection reasoning explaining multi-criteria choice
  const selectionReasoning = `Selected ${bestDeal.vendor.name} with top composite utility score of ${bestDeal.aiExecutiveSummary.compositeUtilityScore}/100. Delivered ₹${bestDeal.aiExecutiveSummary.unitPriceSavings.toLocaleString('en-IN')} in direct savings (${bestDeal.aiExecutiveSummary.discountPercentage}% discount) with right-sized quantity of ${bestDeal.aiExecutiveSummary.finalQuantity} units and ${bestDeal.aiExecutiveSummary.finalLeadDays}-day delivery SLA.${reliabilityNuance}`;

  return {
    medicine,
    recommendedQty,
    winner: bestDeal,
    allDeals: results,
    runnersUp,
    selectionReasoning,
    timestamp: new Date().toISOString()
  };
}
