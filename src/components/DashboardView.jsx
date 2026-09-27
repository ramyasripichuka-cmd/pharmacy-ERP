import React from 'react';
import { usePharmacy, formatINR } from '../context/PharmacyContext';
import { 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  IndianRupee, 
  ArrowRight, 
  Bot, 
  Sparkles, 
  Package, 
  Zap, 
  CheckCircle2, 
  Layers,
  Truck
} from 'lucide-react';

export default function DashboardView() {
  const { 
    stockAudit, 
    purchaseOrders, 
    totalLifetimeSavings, 
    totalPurchasesAmount, 
    setActiveTab, 
    startNegotiation,
    vendors 
  } = usePharmacy();

  const { stats, alerts } = stockAudit;
  const criticalItems = alerts.filter(a => a.isCritical || a.isStockout);
  const nearExpiryItems = alerts.filter(a => a.isNearExpiry);
  const activeShipments = purchaseOrders.filter(p => p.trackingStatus !== 'Delivered');

  const topPriorityAlert = alerts[0];

  return (
    <div className="animate-slide-down">
      {/* Top Welcome / Status Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Store Restocking Intelligence & AI Procurement
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time stock audit, predictive AI demand forecasting, vendor reliability radar, and automated multi-agent bargaining.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {topPriorityAlert && (
            <button 
              className="btn btn-primary"
              onClick={() => startNegotiation(topPriorityAlert, null, "tournament")}
            >
              <Zap size={16} /> Auto-Negotiate Priority ({topPriorityAlert.sku})
            </button>
          )}
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveTab('alerts')}
          >
            View All {stats.alertsCount} Alerts <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        
        {/* Card 1: Critical Stockouts */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--rose-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CRITICAL SHORTAGES</span>
            <div style={{ padding: '6px', background: '#fff1f2', borderRadius: '8px' }}>
              <AlertTriangle size={18} color="var(--rose-500)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px' }}>
            {stats.criticalCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats.lowStockCount} low</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: stats.criticalCount > 0 ? 'var(--rose-500)' : 'var(--emerald-600)', fontWeight: 600 }}>
            {stats.criticalCount > 0 ? 'Stockout imminent (< 2 days of supply)' : 'No immediate stockout threat'}
          </div>
        </div>

        {/* Card 2: Expiry Risk */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--purple-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>EXPIRY VULNERABILITY</span>
            <div style={{ padding: '6px', background: '#faf5ff', borderRadius: '8px' }}>
              <Clock size={18} color="var(--purple-500)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px' }}>
            {stats.nearExpiryCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>SKUs</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--purple-500)', fontWeight: 600 }}>
            Batches expiring within 60 days
          </div>
        </div>

        {/* Card 3: Negotiated Savings Won */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--emerald-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>AI SAVINGS SECURED</span>
            <div style={{ padding: '6px', background: '#ecfdf5', borderRadius: '8px' }}>
              <IndianRupee size={18} color="var(--emerald-500)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-600)', margin: '8px 0 4px' }}>
            {formatINR(totalLifetimeSavings)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {totalPurchasesAmount > 0 
              ? `${((totalLifetimeSavings / (totalPurchasesAmount + totalLifetimeSavings)) * 100).toFixed(1)}% saved vs vendor catalog list` 
              : 'Multi-round bargaining active'}
          </div>
        </div>

        {/* Card 4: Store Health Index */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--cyan-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>INVENTORY HEALTH INDEX</span>
            <div style={{ padding: '6px', background: '#eff6ff', borderRadius: '8px' }}>
              <ShieldCheck size={18} color="var(--cyan-500)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px' }}>
            {stats.healthScore}<span style={{ fontSize: '1rem', color: 'var(--cyan-500)' }}>/100</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {stats.healthyCount} of {stats.totalSKUs} SKUs with optimal buffer
          </div>
        </div>

      </div>

      {/* Main Grid: Priority Action Queue & AI Procurement Feed */}
      <div className="grid-cols-3">
        
        {/* Left 2 Cols: Reorder & Sizing Action Queue */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '24px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--emerald-500)" /> Right-Sized Restock Queue (AI Forecast Powered)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Sizing accounts for daily sales velocity, AI predicted epidemiological trend, safety buffer, and shelf expiration.
                </p>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setActiveTab('inventory')}
              >
                Full Inventory
              </button>
            </div>

            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={40} color="var(--emerald-500)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>All Stock Levels Optimal!</p>
                <p style={{ fontSize: '0.85rem' }}>No medicines are currently below reorder thresholds or nearing expiry.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {alerts.slice(0, 4).map(item => {
                  const daysLeft = item.daysOfSupply;
                  const isSevere = item.isCritical || item.isStockout;
                  const forecast = item.demandForecast;
                  return (
                    <div 
                      key={item.id}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        background: '#ffffff',
                        border: isSevere ? '1px solid #fecdd3' : '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            {item.name}
                          </span>
                          <span className={`badge ${isSevere ? 'badge-critical' : 'badge-low'}`}>
                            {item.statusBadge.replace('_', ' ')}
                          </span>
                          {forecast && (
                            <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                              📈 AI Forecast: {forecast.trendPercentage > 0 ? '+' : ''}{forecast.trendPercentage}% ({forecast.confidenceScore}% conf.)
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>SKU: <strong className="font-mono" style={{ color: 'var(--cyan-500)' }}>{item.sku}</strong></span>
                          <span>Stock: <strong style={{ color: isSevere ? 'var(--rose-500)' : 'var(--amber-500)' }}>{item.currentStock}</strong> / {item.reorderThreshold} min</span>
                          <span>Burn Rate: <strong>{item.dailySales}/day</strong></span>
                          <span>Predicted Velocity: <strong style={{ color: 'var(--emerald-600)' }}>{forecast ? forecast.predictedDailyDemand : item.dailySales}/day</strong></span>
                          <span>Supply Left: <strong style={{ color: daysLeft <= 2 ? 'var(--rose-500)' : 'inherit' }}>{daysLeft} days</strong></span>
                        </div>

                        {/* AI Sizing & Demand Forecast Callout */}
                        <div style={{ 
                          marginTop: '8px', 
                          padding: '8px 12px', 
                          borderRadius: 'var(--radius-sm)', 
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          fontSize: '0.78rem',
                          color: '#065f46',
                          lineHeight: 1.4
                        }}>
                          🎯 <strong>AI Calculated Sizing:</strong> Recommend restock of <strong>{item.recommendedQuantity} units</strong> (~{formatINR(item.estimatedCost)}).
                          {forecast && (
                            <span style={{ display: 'block', marginTop: '2px', color: '#047857' }}>
                              💡 <em>{forecast.impactExplanation}</em>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => startNegotiation(item, null, "single")}
                        >
                          <Bot size={14} /> Bargain Now
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => startNegotiation(item, null, "tournament")}
                          title="Negotiate with all 3 vendors simultaneously"
                        >
                          ⚡ 3-Vendor Duel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Order Tracking Stream & Connected Distributors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* FEATURE 3: Live Order Tracking Widget */}
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--emerald-500)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={17} color="var(--emerald-500)" /> In-Transit PO Tracking
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('tracking')}
                style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              >
                Track All <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeShipments.slice(0, 2).map(po => (
                <div 
                  key={po.poNumber}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--cyan-500)' }}>{po.poNumber}</span>
                    {po.isDelayed ? (
                      <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>Delayed</span>
                    ) : (
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{po.trackingStatus || 'In Transit'}</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {po.items && po.items[0] ? `${po.items[0].quantity}x ${po.items[0].name}` : 'Medicine consignment'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.74rem', marginTop: '4px' }}>
                    <span>ETA: {po.expectedDeliveryDate}</span>
                    <span style={{ fontWeight: 700 }}>{formatINR(po.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Autonomous Procurement Pipeline Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--cyan-500)" /> 5-Stage Restocking Engine
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff1f2', color: 'var(--rose-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>1</div>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Threshold & Expiry Detection</strong>
                  <div style={{ color: 'var(--text-secondary)' }}>Scans inventory real-time for stockouts and shelf-life risks.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: 'var(--cyan-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>2</div>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>AI Demand Forecasting</strong>
                  <div style={{ color: 'var(--text-secondary)' }}>Projects future sales curve using seasonal trend and burn velocity.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fffbeb', color: 'var(--amber-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>3</div>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Vendor Reliability Radar</strong>
                  <div style={{ color: 'var(--text-secondary)' }}>Audits SLA fulfillment and prices; eliminates distributor bulk traps.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ecfdf5', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>4</div>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Multi-Round Bargaining</strong>
                  <div style={{ color: 'var(--text-secondary)' }}>Store Agent bargains down price, relaxes MOQ, and expedites delivery.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: 'var(--blue-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>5</div>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Order Tracking & GRN Write-Back</strong>
                  <div style={{ color: 'var(--text-secondary)' }}>Tracks dispatch milestones and auto-increments stock on dock receipt.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Distributors Overview */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Connected Distributors
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('vendors')}
                style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              >
                Radar <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {vendors.map(v => (
                <div 
                  key={v.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{v.avatar}</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{v.shortName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.badge} • {v.standardLeadDays}d lead</div>
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {v.reliabilityRating}% SLA
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
