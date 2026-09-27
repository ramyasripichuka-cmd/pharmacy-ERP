import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Bot, 
  Layers, 
  ArrowRight, 
  ShieldAlert, 
  HelpCircle, 
  Sliders, 
  Zap, 
  PackageMinus,
  TrendingUp,
  BrainCircuit,
  Activity
} from 'lucide-react';

export default function AlertsView() {
  const { 
    stockAudit, 
    targetBufferDays, 
    setTargetBufferDays, 
    startNegotiation,
    formatINR 
  } = usePharmacy();

  const { alerts, stats } = stockAudit;

  return (
    <div className="animate-slide-down">
      {/* Title & Interactive Buffer Slider */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={26} color="var(--amber-500)" /> Smart Reorder & Expiry Sizing Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Autonomous shortage detection paired with mathematically right-sized demand calculations & AI forecasting.
          </p>
        </div>

        {/* Dynamic Buffer Slider */}
        <div className="glass-panel" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="var(--emerald-500)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Target Buffer Window:</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{targetBufferDays} Days</strong>
          </div>
          <input 
            type="range"
            min="14"
            max="45"
            step="1"
            value={targetBufferDays}
            onChange={(e) => setTargetBufferDays(Number(e.target.value))}
            style={{ width: '110px', accentColor: 'var(--emerald-500)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Sizing Logic Formula Banner */}
      <div className="glass-panel" style={{ 
        padding: '16px 20px', 
        marginBottom: '24px', 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.08))',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px' }}>
            <BrainCircuit size={20} color="var(--emerald-600)" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Feature 1: AI Demand Forecasting & Smart Sizing Integration:
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Instead of accepting distributor minimums (e.g., 200 units), the agent blends historical moving averages, seasonal trends, and current stock:
              <span className="font-mono" style={{ color: 'var(--emerald-600)', marginLeft: '6px', fontWeight: 600 }}>
                Requirement = (Predicted Daily Velocity × {targetBufferDays}d Buffer × 1.15 Safety) - Usable Stock (adjusted for near-expiry waste)
              </span>.
              The predicted demand provides mathematical leverage during multi-agent supplier negotiation.
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      {alerts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <ShieldAlert size={48} color="var(--emerald-500)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>Zero Stock Vulnerabilities Detected</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Every medicine maintains over {targetBufferDays} days of supply and no batches expire within 60 days.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.map((item, index) => {
            const isCritical = item.isCritical || item.isStockout;
            const isExpiry = item.isNearExpiry;
            const forecast = item.demandForecast || {
              predictedDailyRate: item.dailySales,
              trendPercentage: 0,
              forecast30Day: item.dailySales * 30,
              confidenceScore: 90,
              explanation: "Calculated from baseline sales rate."
            };

            return (
              <div 
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '22px',
                  borderLeft: `5px solid ${isCritical ? 'var(--rose-500)' : isExpiry ? 'var(--purple-500)' : 'var(--amber-500)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                  
                  {/* Left: Drug Details & Badge */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {index + 1}. {item.name}
                      </span>
                      <span className={`badge ${isCritical ? 'badge-critical' : isExpiry ? 'badge-expiry' : 'badge-low'}`}>
                        {item.statusBadge.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>SKU: <strong className="font-mono" style={{ color: 'var(--cyan-600)' }}>{item.sku}</strong></span>
                      <span>•</span>
                      <span>Generic: <strong style={{ color: 'var(--text-main)' }}>{item.generic}</strong></span>
                      <span>•</span>
                      <span>Category: <strong>{item.category}</strong></span>
                    </div>
                  </div>

                  {/* Right: Quick Restock Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => startNegotiation(item, null, "single")}
                    >
                      <Bot size={15} /> Negotiate with Preferred
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => startNegotiation(item, null, "tournament")}
                      title="Run simultaneous multi-agent tournament against all distributors"
                    >
                      <Zap size={15} color="var(--amber-500)" /> 3-Vendor Tournament
                    </button>
                  </div>

                </div>

                {/* Sizing Breakdown Metrics Bar */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
                  gap: '12px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '14px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Stock</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isCritical ? '#e11d48' : 'var(--text-main)' }}>
                      {item.currentStock} units
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Min threshold: {item.reorderThreshold}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Daily Sales Velocity</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--cyan-600)' }}>
                      {item.dailySales} / day
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Prescription rate</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Depletion Countdown</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: item.daysOfSupply <= 2 ? '#e11d48' : '#d97706' }}>
                      {item.daysOfSupply} Days
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Time to stockout</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Batch Expiry</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isExpiry ? '#9333ea' : 'var(--text-main)' }}>
                      {item.daysToExpiry} Days
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lot: {item.batchNumber}</div>
                  </div>

                  <div style={{ 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--emerald-600)', fontWeight: 700, textTransform: 'uppercase' }}>
                      AI Right-Sized Need
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
                      {item.recommendedQuantity} units
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--emerald-600)' }}>Est. ~{formatINR(item.estimatedCost)}</div>
                  </div>
                </div>

                {/* AI Demand Forecasting Feature Card */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05))',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '6px' }}>
                      <Activity size={16} color="var(--blue-500)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>AI Demand Forecast:</span>
                        <span style={{ color: 'var(--blue-600)', fontWeight: 800 }}>{forecast.predictedDailyRate}/day</span>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          padding: '1px 6px', 
                          borderRadius: '4px',
                          background: forecast.trendPercentage >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: forecast.trendPercentage >= 0 ? 'var(--emerald-600)' : 'var(--rose-600)',
                          fontWeight: 700
                        }}>
                          {forecast.trendPercentage >= 0 ? `+${forecast.trendPercentage}%` : `${forecast.trendPercentage}%`} Trend
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          (30d Projected: <strong>{forecast.forecast30Day} units</strong> • Confidence: <strong>{forecast.confidenceScore}%</strong>)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        💡 <strong>Quantity Impact:</strong> {forecast.explanation}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning Statements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {item.reasoning.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--emerald-500)' }}>▸</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
