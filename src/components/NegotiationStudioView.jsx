import React, { useState, useEffect } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { NEGOTIATION_STRATEGIES } from '../utils/negotiationAgent';
import confetti from 'canvas-confetti';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Zap, 
  TrendingDown, 
  Package, 
  Sliders, 
  UserCheck,
  Award
} from 'lucide-react';

export default function NegotiationStudioView() {
  const { 
    activeNegotiationMed, 
    activeNegotiationVendor, 
    negotiationResult, 
    vendors, 
    refreshNegotiation, 
    strategyKey, 
    setStrategyKey, 
    postPurchaseOrder, 
    setPreviewPO, 
    setActiveTab, 
    stockAudit, 
    startNegotiation,
    formatINR 
  } = usePharmacy();

  const [currentRoundIndex, setCurrentRoundIndex] = useState(4); // Default show all 4 rounds
  const [isSimulating, setIsSimulating] = useState(false);
  const [customCounterPrice, setCustomCounterPrice] = useState('');
  const [showHumanOverride, setShowHumanOverride] = useState(false);

  // If no active medicine, pick the first shortage alert
  const currentMed = activeNegotiationMed || stockAudit.alerts[0] || stockAudit.items[0];
  const currentVendor = activeNegotiationVendor || vendors[0];

  const result = negotiationResult;
  const summary = result ? result.aiExecutiveSummary : null;

  // Run dynamic confetti when deal is agreed
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleRunSimulation = (vendor = currentVendor, strat = strategyKey, price = null) => {
    setIsSimulating(true);
    setCurrentRoundIndex(1);

    setTimeout(() => {
      refreshNegotiation(vendor, strat, price);
      
      // Step through rounds sequentially
      let r = 1;
      const interval = setInterval(() => {
        r++;
        setCurrentRoundIndex(r);
        if (r >= 4) {
          clearInterval(interval);
          setIsSimulating(false);
          triggerConfetti();
        }
      }, 700);
    }, 300);
  };

  const handlePostPO = () => {
    if (!summary) return;
    const po = postPurchaseOrder(summary);
    triggerConfetti();
    setPreviewPO(po);
  };

  return (
    <div className="animate-slide-down">
      {/* Studio Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Autonomous Bargaining Studio
            </h2>
            <span className="badge badge-healthy" style={{ padding: '2px 8px' }}>
              <Sparkles size={11} /> Multi-Agent Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Watch the Pharmacy Store Agent bargain autonomously against Vendor Sales Bots using AI Demand & Reliability leverage.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => handleRunSimulation(currentVendor, strategyKey)}
            disabled={isSimulating}
          >
            <RotateCcw size={14} /> Re-run Bargaining
          </button>

          {summary && (
            <button 
              className="btn btn-primary"
              onClick={handlePostPO}
              disabled={isSimulating}
            >
              <FileText size={16} /> Generate PO & Write to ERP
            </button>
          )}
        </div>
      </div>

      {/* Target Drug & Strategy Configuration Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Active Medicine Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-600)',
              fontSize: '1.2rem'
            }}>
              💊
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {currentMed.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                SKU: <strong className="font-mono" style={{ color: 'var(--cyan-600)' }}>{currentMed.sku}</strong> • 
                Velocity: <strong>{currentMed.dailySales} / day</strong> • 
                Sized Demand: <strong style={{ color: 'var(--emerald-600)' }}>{currentMed.recommendedQuantity || 60} units</strong>
              </div>
            </div>
          </div>

          {/* Strategy Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={16} color="var(--emerald-500)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Agent Persona:</span>
              <select
                value={strategyKey}
                onChange={(e) => {
                  setStrategyKey(e.target.value);
                  handleRunSimulation(currentVendor, e.target.value);
                }}
                style={{
                  padding: '7px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                {Object.values(NEGOTIATION_STRATEGIES).map(strat => (
                  <option key={strat.id} value={strat.id}>{strat.name}</option>
                ))}
              </select>
            </div>

            {/* Vendor Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Vendor:</span>
              <select
                value={currentVendor.id}
                onChange={(e) => {
                  const targetV = vendors.find(v => v.id === e.target.value);
                  if (targetV) handleRunSimulation(targetV, strategyKey);
                }}
                style={{
                  padding: '7px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.shortName} (Score: {v.reliabilityMetrics?.compositeScore || v.reliabilityRating} • {v.badge})
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowHumanOverride(!showHumanOverride)}
            >
              <UserCheck size={14} /> {showHumanOverride ? 'Hide Counter-Bid' : 'Manual Counter-Bid'}
            </button>
          </div>

        </div>

        {/* Human Override Drawer */}
        {showHumanOverride && (
          <div style={{ 
            marginTop: '14px', 
            paddingTop: '14px', 
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Pharmacist In-The-Loop Counter Offer (₹/unit):
            </span>
            <input 
              type="number"
              placeholder={`e.g. ${Math.round(summary?.finalUnitPrice ? summary.finalUnitPrice * 0.95 : 100)}`}
              value={customCounterPrice}
              onChange={(e) => setCustomCounterPrice(e.target.value)}
              style={{
                width: '130px',
                padding: '6px 10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-focus)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
            <button 
              className="btn btn-accent btn-sm"
              onClick={() => handleRunSimulation(currentVendor, strategyKey, customCounterPrice)}
            >
              Force Agent Counter-Offer
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Area: Chat Transcript vs Deal Concession Analytics */}
      <div className="grid-cols-3" style={{ alignItems: 'start' }}>
        
        {/* Left 2 Cols: Live Negotiation Transcript */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-indicator"></span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Multi-Round Negotiation Transcript
                  </h3>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                  {isSimulating ? 'Simulating Rounds...' : 'Agreement Sealed'}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Rounds: <strong>{Math.min(currentRoundIndex, 4)} / 4</strong>
              </div>
            </div>

            {/* Messages Feed */}
            {result && result.rounds ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {result.rounds.slice(0, currentRoundIndex).map((round) => (
                  <div key={round.round} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Round Header Badge */}
                    <div style={{ 
                      textAlign: 'center', 
                      margin: '6px 0', 
                      position: 'relative'
                    }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        color: 'var(--cyan-700)', 
                        background: 'rgba(6, 182, 212, 0.1)', 
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        padding: '3px 12px', 
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {round.title}
                      </span>
                    </div>

                    {/* Messages in this Round */}
                    {round.messages.map((msg, mIdx) => {
                      const isStoreAgent = msg.sender === 'STORE_AGENT';
                      return (
                        <div 
                          key={mIdx}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                            flexDirection: isStoreAgent ? 'row' : 'row-reverse'
                          }}
                        >
                          {/* Avatar */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isStoreAgent 
                              ? 'linear-gradient(135deg, var(--emerald-500), var(--cyan-500))' 
                              : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            {msg.avatar}
                          </div>

                          {/* Bubble Content */}
                          <div style={{
                            maxWidth: '82%',
                            padding: '14px 16px',
                            borderRadius: 'var(--radius-lg)',
                            background: isStoreAgent 
                              ? 'rgba(16, 185, 129, 0.08)' 
                              : '#f1f5f9',
                            border: isStoreAgent 
                              ? '1px solid rgba(16, 185, 129, 0.3)' 
                              : '1px solid #cbd5e1',
                            textAlign: 'left',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              gap: '12px', 
                              marginBottom: '6px' 
                            }}>
                              <span style={{ 
                                fontSize: '0.78rem', 
                                fontWeight: 700, 
                                color: isStoreAgent ? 'var(--emerald-600)' : '#2563eb' 
                              }}>
                                {msg.senderName}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {msg.timestamp}
                              </span>
                            </div>

                            <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
                              {msg.content}
                            </p>
                          </div>

                        </div>
                      );
                    })}

                  </div>
                ))}
              </div>
            ) : null}

          </div>
        </div>

        {/* Right 1 Col: Concession Barometer & Value Creation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {summary && (
            <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid var(--emerald-500)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingDown size={18} color="var(--emerald-600)" /> Deal Concessions
                </h3>
                <span className="badge badge-healthy">
                  +{summary.discountPercentage}% Savings
                </span>
              </div>

              {/* Before vs After Metric Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                
                {/* Metric 1: Unit Price */}
                <div style={{ 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(15, 23, 42, 0.02)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Unit Purchase Price
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {formatINR(summary.initialListPrice)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--emerald-600)' }}>→</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                      {formatINR(summary.finalUnitPrice)}
                    </span>
                  </div>
                </div>

                {/* Metric 2: Order Quantity (MOQ Right-Sizing) */}
                <div style={{ 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(15, 23, 42, 0.02)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Quantity (Overcoming Bulk Minimum)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#e11d48', textDecoration: 'line-through' }}>
                      {summary.initialMOQ} units
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cyan-600)' }}>→</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {summary.finalQuantity} units
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--cyan-600)', marginTop: '4px' }}>
                    🎯 Right-sized to {Math.round(summary.finalQuantity / currentMed.dailySales)} days of buffer
                  </div>
                </div>

                {/* Metric 3: Lead Time SLA & Reliability */}
                <div style={{ 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(15, 23, 42, 0.02)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Guaranteed Dispatch SLA & Partner Score
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                    {summary.finalLeadDays} Business Day(s)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Vendor Reliability: <strong style={{ color: 'var(--emerald-600)' }}>{currentVendor.reliabilityMetrics?.compositeScore || currentVendor.reliabilityRating}/100</strong> • Terms: {summary.paymentTerms}
                  </div>
                </div>

                {/* Metric 4: Total Value & Direct Savings */}
                <div style={{ 
                  padding: '14px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--emerald-700)', fontWeight: 600 }}>Total Final PO Value</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatINR(summary.finalTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Net Direct Price Savings</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald-600)' }}>+{formatINR(summary.unitPriceSavings)}</span>
                  </div>
                  {summary.capitalPreservedFromOverordering > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--cyan-700)' }}>Capital Preserved vs Bulk MOQ</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyan-700)' }}>+{formatINR(summary.capitalPreservedFromOverordering)}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Key AI Wins */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Negotiation Highlights:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {summary.keyAccomplishments.map((win, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                      <CheckCircle2 size={14} color="var(--emerald-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{win}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call-to-action */}
              <button 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%' }}
                onClick={handlePostPO}
              >
                <FileText size={18} /> Confirm Order & Post to ERP
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
