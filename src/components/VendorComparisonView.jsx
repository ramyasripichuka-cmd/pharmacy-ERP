import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { evaluateVendorFit } from '../utils/restockEngine';
import { 
  Store, 
  Bot, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Award,
  TrendingUp,
  Percent,
  History,
  FileCheck
} from 'lucide-react';

export default function VendorComparisonView() {
  const { 
    medicines, 
    vendors, 
    stockAudit, 
    startNegotiation,
    formatINR 
  } = usePharmacy();

  // Pick first flagged shortage or default to first medicine
  const defaultMed = stockAudit.alerts[0] || stockAudit.items[0];
  const [selectedSku, setSelectedSku] = useState(defaultMed ? defaultMed.sku : medicines[0].sku);

  const selectedMed = stockAudit.items.find(m => m.sku === selectedSku) || defaultMed;
  const recommendedQty = selectedMed.recommendedQuantity || 60;

  return (
    <div className="animate-slide-down">
      {/* Title & Medicine Selector */}
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
            <Store size={26} color="var(--cyan-600)" /> Multi-Distributor Comparison Radar
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Evaluate catalog pricing, restrictive MOQs, transit SLAs, and multi-factor Vendor Reliability Scores.
          </p>
        </div>

        {/* Medicine Dropdown Selector */}
        <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Select SKU to Compare:</span>
          <select
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            style={{
              padding: '6px 12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
              maxWidth: '320px'
            }}
          >
            {stockAudit.items.map(m => (
              <option key={m.sku} value={m.sku}>
                {m.name} ({m.sku}) {m.isLowStock || m.isCritical ? '⚠️ Shortage' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Sizing Header for Selected Drug */}
      <div className="glass-panel" style={{ 
        padding: '18px 24px', 
        marginBottom: '24px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: '4px solid var(--emerald-500)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {selectedMed.name}
            </h3>
            <span className="font-mono badge badge-info">{selectedMed.sku}</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Daily Sales: <strong>{selectedMed.dailySales} units/day</strong> • Current Stock: <strong>{selectedMed.currentStock}</strong> • Days Left: <strong style={{ color: selectedMed.daysOfSupply <= 2 ? '#e11d48' : 'inherit' }}>{selectedMed.daysOfSupply} days</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald-600)', fontWeight: 700 }}>STORE RIGHT-SIZED NEED</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
              {recommendedQty} units
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => startNegotiation(selectedMed, null, "tournament")}
          >
            <Zap size={16} /> Bargain With All 3 Simultaneously
          </button>
        </div>
      </div>

      {/* Feature 2: Vendor Selection Philosophy Alert Banner */}
      <div className="glass-panel" style={{
        padding: '14px 18px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(99, 102, 241, 0.08))',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <div style={{ padding: '8px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '8px', flexShrink: 0 }}>
          <Award size={20} color="var(--cyan-600)" />
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-main)' }}>AI Reliability Balancing Engine:</strong> The AI Restock Agent evaluates multi-dimensional utility (40% Price + 25% Reliability + 20% MOQ Fit + 15% Lead SLA). It will <strong style={{ color: 'var(--rose-600)' }}>never automatically pick the cheapest vendor</strong> if poor historical fulfillment, high defect rates, or delayed SLAs risk store stockouts.
        </div>
      </div>

      {/* 3 Distributor Side-by-Side Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '28px' }}>
        {vendors.map(vendor => {
          const fit = evaluateVendorFit(vendor, selectedMed, recommendedQty);
          const isPreferred = selectedMed.preferredVendorId === vendor.id;
          const rel = vendor.reliabilityMetrics || {
            compositeScore: vendor.reliabilityRating,
            grade: "A",
            deliveryPerformance: vendor.reliabilityRating,
            orderFulfillmentRate: 98.0,
            priceConsistency: 95.0,
            successfulOrdersCount: 80,
            defectDisputeRate: 0.8,
            auditSummary: "Standard performance record."
          };

          const isOverkill = fit.fitGrade === "BULK_OVERKILL";
          const isExcess = fit.fitGrade === "MODERATE_EXCESS";

          return (
            <div 
              key={vendor.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isPreferred ? '2px solid rgba(16, 185, 129, 0.6)' : '1px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              {isPreferred && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '16px',
                  background: 'var(--emerald-600)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  letterSpacing: '0.05em'
                }}>
                  PRIMARY ERP DISTRIBUTOR
                </div>
              )}

              {/* Vendor Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '2rem' }}>{vendor.avatar}</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {vendor.name}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {vendor.persona.type}
                    </div>
                  </div>
                </div>

                {/* FEATURE 2: Highlighting Reliability Scorecard Badge */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: rel.compositeScore >= 90 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${rel.compositeScore >= 90 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Reliability Score
                    </span>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: rel.compositeScore >= 90 ? 'var(--emerald-600)' : 'var(--amber-600)',
                      color: '#ffffff'
                    }}>
                      {rel.compositeScore}/100 • Grade {rel.grade}
                    </span>
                  </div>

                  {/* Micro Breakdown Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.74rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      🚚 On-Time: <strong style={{ color: 'var(--text-main)' }}>{rel.deliveryPerformance}%</strong>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      📦 Fulfillment: <strong style={{ color: 'var(--text-main)' }}>{rel.orderFulfillmentRate}%</strong>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      💰 Price Match: <strong style={{ color: 'var(--text-main)' }}>{rel.priceConsistency}%</strong>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      ✅ Past Orders: <strong style={{ color: 'var(--text-main)' }}>{rel.successfulOrdersCount}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.3 }}>
                    "{rel.auditSummary}"
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginBottom: '16px', 
                  flexWrap: 'wrap' 
                }}>
                  <span className="badge badge-healthy" style={{ fontSize: '0.7rem' }}>
                    <Truck size={12} /> {fit.leadDays}d Lead Time
                  </span>
                  <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
                    {vendor.defaultPaymentTerms}
                  </span>
                </div>

                {/* Offer Comparison Rows */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  padding: '14px', 
                  background: 'rgba(15, 23, 42, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Catalog List Price:</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{formatINR(fit.listPrice)}/unit</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mandatory Vendor MOQ:</span>
                    <strong style={{ color: isOverkill ? '#e11d48' : isExcess ? '#d97706' : '#059669' }}>
                      {fit.moq} units
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Capital Locked in MOQ:</span>
                    <strong style={{ color: isOverkill ? '#e11d48' : 'var(--text-main)' }}>{formatINR(fit.capitalLockedInMOQ)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Days of Supply at MOQ:</span>
                    <strong style={{ color: fit.daysToConsumeMOQ > 60 ? '#e11d48' : 'inherit' }}>
                      {fit.daysToConsumeMOQ} days
                    </strong>
                  </div>
                </div>

                {/* AI Warning or Match Callout */}
                {fit.moqWarning && (
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: isOverkill ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${isOverkill ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    fontSize: '0.78rem',
                    color: isOverkill ? '#e11d48' : '#d97706',
                    marginBottom: '16px',
                    lineHeight: 1.4
                  }}>
                    ⚠️ {fit.moqWarning}
                  </div>
                )}

                {/* Predicted Bargaining Concession */}
                <div style={{ 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)', 
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-600)', marginBottom: '4px' }}>
                    🤖 AI Predicted Negotiation Target:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    Can negotiate price down to <strong>{formatINR(fit.listPrice * (1 - vendor.persona.baseDiscountMax))}/unit</strong> and relax MOQ down by <strong>{Math.round(vendor.persona.moqFlexibility * 100)}%</strong>.
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => startNegotiation(selectedMed, vendor, "single")}
              >
                <Bot size={15} /> Launch AI Bargaining with {vendor.shortName}
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}
