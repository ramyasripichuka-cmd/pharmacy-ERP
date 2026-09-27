import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Award, 
  Sparkles, 
  Package, 
  Clock,
  IndianRupee
} from 'lucide-react';

export default function AnalyticsView() {
  const { 
    purchaseOrders, 
    stockAudit, 
    totalLifetimeSavings, 
    totalPurchasesAmount, 
    vendors,
    formatINR 
  } = usePharmacy();

  const totalCatalogListValue = totalPurchasesAmount + totalLifetimeSavings;
  const overallSavingsRate = totalCatalogListValue > 0 
    ? ((totalLifetimeSavings / totalCatalogListValue) * 100).toFixed(1) 
    : 0;

  // Breakdown by vendor
  const vendorStats = vendors.map(v => {
    const vendorPOs = purchaseOrders.filter(p => p.vendorId === v.id);
    const spend = vendorPOs.reduce((acc, p) => acc + p.totalAmount, 0);
    const savings = vendorPOs.reduce((acc, p) => acc + p.totalSavings, 0);
    return {
      ...v,
      orderCount: vendorPOs.length,
      spend,
      savings
    };
  });

  return (
    <div className="animate-slide-down">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={26} color="var(--emerald-600)" /> Procurement & Savings Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Comprehensive analysis of AI negotiation ROI, working capital preservation in INR, and supplier performance.
        </p>
      </div>

      {/* Top 4 Impact KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total ERP Procurement</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0 2px' }}>
            {formatINR(totalPurchasesAmount)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Across {purchaseOrders.length} purchase contracts</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--emerald-500)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Net Hard Savings Won</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-600)', margin: '6px 0 2px' }}>
            {formatINR(totalLifetimeSavings)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--emerald-600)' }}>{overallSavingsRate}% below catalog list</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--cyan-500)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Working Capital Spared</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-700)', margin: '6px 0 2px' }}>
            {formatINR(totalPurchasesAmount * 0.42)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>By avoiding distributor bulk minimums</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--purple-500)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Stockout Prevention SLA</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0 2px' }}>
            99.2%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#9333ea' }}>Average 1.6-day expedited lead time</div>
        </div>
      </div>

      {/* Grid: Vendor Distribution & AI Value Engine Breakdown */}
      <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
        
        {/* Vendor Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--cyan-600)" /> Supplier Allocation & Reliability Score
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {vendorStats.map(v => {
              const pctOfSpend = totalPurchasesAmount > 0 ? (v.spend / totalPurchasesAmount) * 100 : 0;
              const rel = v.reliabilityMetrics || { compositeScore: v.reliabilityRating, grade: "A" };
              return (
                <div key={v.id} style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{v.avatar}</span>
                      <div>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>{v.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Reliability: <span style={{ color: 'var(--emerald-600)', fontWeight: 700 }}>{rel.compositeScore}/100 (Grade {rel.grade})</span> • {v.orderCount} orders
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatINR(v.spend)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)' }}>+{formatINR(v.savings)} savings</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: '6px', width: '100%', background: 'rgba(15, 23, 42, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pctOfSpend}%`, background: v.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Sizing Value Pillars */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--emerald-600)" /> How AI Delivers ROI vs Manual Restocking
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(15, 23, 42, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.3rem' }}>🚫</div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Elimination of Vendor Bulk Traps</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  Distributors routinely push 150-250 unit minimums. The Store Agent proves current burn rate (e.g. 8/day) and forces distributors to split batches into right-sized 60-80 unit deliveries.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(15, 23, 42, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.3rem' }}>⏳</div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Shelf-Life Expiry Risk Safeguard</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  The engine predicts exactly how many units will expire unsold before replenishing fresh lots, preventing thousands of rupees in spoiled pharmaceutical inventory.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(15, 23, 42, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.3rem' }}>⚡</div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Automated Multi-Agent Concessions</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  Replaces 45-minute phone bargaining calls with an instantaneous 4-round autonomous bargaining protocol that consistently yields 8-18% discounts and waived freight surcharges.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
