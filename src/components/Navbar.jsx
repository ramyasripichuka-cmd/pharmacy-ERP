import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { 
  LayoutDashboard, 
  Pill, 
  AlertTriangle, 
  Store, 
  Bot, 
  FileText, 
  Truck,
  BarChart3, 
  RotateCcw, 
  Flame, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function Navbar() {
  const { 
    activeTab, 
    setActiveTab, 
    stockAudit, 
    storeProfile, 
    purchaseOrders,
    backendConnected,
    simulateDailySales, 
    resetToDefaults, 
    setIsAddMedicineOpen 
  } = usePharmacy();

  const alertsCount = stockAudit.stats.alertsCount;
  const criticalCount = stockAudit.stats.criticalCount;
  const inTransitCount = purchaseOrders.filter(p => p.trackingStatus !== 'Delivered').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Pill },
    { 
      id: 'alerts', 
      label: 'Alerts & Forecast', 
      icon: AlertTriangle,
      badge: alertsCount > 0 ? alertsCount : null,
      badgeClass: criticalCount > 0 ? 'badge-critical' : 'badge-low'
    },
    { id: 'vendors', label: 'Vendor Radar & Reliability', icon: Store },
    { 
      id: 'negotiation', 
      label: 'AI Bargaining Studio', 
      icon: Bot,
      highlight: true
    },
    { 
      id: 'tracking', 
      label: 'Order Tracking', 
      icon: Truck,
      badge: inTransitCount > 0 ? inTransitCount : null,
      badgeClass: 'badge-info'
    },
    { id: 'orders', label: 'ERP Ledger & POs', icon: FileText },
    { id: 'analytics', label: 'Savings Analytics', icon: BarChart3 }
  ];

  return (
    <header className="glass-panel no-print" style={{ 
      margin: '16px 24px', 
      padding: '12px 24px', 
      position: 'sticky',
      top: '12px',
      zIndex: 50,
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Store Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-emerald)'
          }}>
            <Pill size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Pharma<span style={{ color: 'var(--emerald-500)' }}>ERP</span>
              </h1>
              <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                <Sparkles size={11} /> AI Restock & Bargain Agent
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span>{storeProfile.name}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: backendConnected ? 'var(--emerald-600)' : 'var(--text-muted)', fontWeight: 600 }}>
                <span className={backendConnected ? "pulse-indicator" : ""} style={{ width: '7px', height: '7px', borderRadius: '50%', background: backendConnected ? '#10b981' : '#94a3b8' }}></span>
                {backendConnected ? 'FastAPI + SQLite Live' : 'ERP Local Cache'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Simulator Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={simulateDailySales}
            title="Simulate 24 hours of drug prescriptions and OTC sales"
          >
            <Flame size={14} color="#f59e0b" /> Simulate 24h Sales
          </button>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setIsAddMedicineOpen(true)}
          >
            <PlusCircle size={14} /> Add Medicine
          </button>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={resetToDefaults}
            title="Reset ERP data to original state"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        marginTop: '12px', 
        paddingTop: '10px', 
        borderTop: '1px solid #e2e8f0',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? (item.highlight ? 'var(--emerald-600)' : 'var(--text-main)') : 'var(--text-secondary)',
                background: isActive 
                  ? (item.highlight ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))' : '#f1f5f9') 
                  : 'transparent',
                border: isActive 
                  ? (item.highlight ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #cbd5e1') 
                  : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? (item.highlight ? 'var(--emerald-600)' : 'var(--text-main)') : 'var(--text-muted)'} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {item.badge}
                </span>
              )}
              {item.highlight && !item.badge && (
                <span style={{ 
                  background: 'linear-gradient(135deg, var(--emerald-500), var(--cyan-500))', 
                  color: '#ffffff', 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  padding: '1px 6px', 
                  borderRadius: '10px' 
                }}>
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
