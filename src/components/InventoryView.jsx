import React, { useState } from 'react';
import { usePharmacy, formatINR } from '../context/PharmacyContext';
import { 
  Search, 
  Filter, 
  Pill, 
  AlertTriangle, 
  Flame, 
  Bot, 
  PlusCircle, 
  Clock, 
  Layers, 
  ArrowUpDown,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function InventoryView() {
  const { 
    stockAudit, 
    startNegotiation, 
    triggerUrgentStockout, 
    setIsAddMedicineOpen 
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const { items, stats } = stockAudit;

  // Filter logic
  const categories = ['ALL', ...new Set(items.map(i => i.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.generic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'CRITICAL') matchesStatus = item.isCritical || item.isStockout;
    else if (selectedStatus === 'LOW') matchesStatus = item.isLowStock;
    else if (selectedStatus === 'EXPIRY') matchesStatus = item.isNearExpiry;
    else if (selectedStatus === 'HEALTHY') matchesStatus = item.statusBadge === 'HEALTHY';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="animate-slide-down">
      {/* Title & Actions Bar */}
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
            Pharmacy Stock Management & Demand Forecast
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Active inventory tracking, AI predictive sales curve, days-of-supply burn analysis, and automated threshold alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddMedicineOpen(true)}
          >
            <PlusCircle size={16} /> Add Medicine SKU
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '20px', 
        flexWrap: 'wrap', 
        fontSize: '0.85rem' 
      }}>
        <div className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total Tracked SKUs:</span>
          <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{stats.totalSKUs}</strong>
        </div>
        <div className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total Inventory Valuation:</span>
          <strong style={{ color: 'var(--emerald-600)', fontSize: '1rem' }}>{formatINR(stats.totalInventoryValue)}</strong>
        </div>
        <div className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Shortages Flagged:</span>
          <strong style={{ color: stats.alertsCount > 0 ? 'var(--rose-500)' : 'var(--emerald-600)', fontSize: '1rem' }}>
            {stats.alertsCount} items
          </strong>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text"
              placeholder="Search medicine name, generic formula, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}
            >
              <option value="ALL">All Items</option>
              <option value="CRITICAL">Critical Shortages (&lt; 2d)</option>
              <option value="LOW">Below Reorder Level</option>
              <option value="EXPIRY">Near Expiry (&lt; 60d)</option>
              <option value="HEALTHY">Healthy Buffer</option>
            </select>
          </div>

        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Medicine & SKU</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Stock / Threshold</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Burn Rate & Supply</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Demand Forecast</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Batch Expiry</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Unit Cost</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isSevere = item.isCritical || item.isStockout;
                  const isLow = item.isLowStock;
                  const isNearExp = item.isNearExpiry;
                  const forecast = item.demandForecast;

                  return (
                    <tr 
                      key={item.id}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Name & SKU */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                          <span className="font-mono" style={{ color: 'var(--cyan-500)', fontWeight: 600 }}>{item.sku}</span>
                          <span>•</span>
                          <span>{item.form}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ 
                          fontSize: '0.78rem', 
                          padding: '3px 8px', 
                          background: '#f1f5f9', 
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          {item.category}
                        </span>
                      </td>

                      {/* Stock vs Threshold */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ 
                            fontSize: '1rem', 
                            fontWeight: 800, 
                            color: isSevere ? 'var(--rose-500)' : isLow ? 'var(--amber-500)' : 'var(--emerald-600)' 
                          }}>
                            {item.currentStock}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            / min {item.reorderThreshold}
                          </span>
                        </div>

                        {/* Progress meter */}
                        <div style={{ 
                          width: '100px', 
                          height: '4px', 
                          background: '#e2e8f0', 
                          borderRadius: '2px', 
                          marginTop: '6px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min(100, (item.currentStock / (item.reorderThreshold * 1.5)) * 100)}%`,
                            height: '100%',
                            background: isSevere ? 'var(--rose-500)' : isLow ? 'var(--amber-500)' : 'var(--emerald-500)'
                          }}></div>
                        </div>
                      </td>

                      {/* Burn Rate & Days of Supply */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.dailySales} units/day</div>
                        <div style={{ fontSize: '0.78rem', color: item.daysOfSupply <= 2 ? 'var(--rose-500)' : 'var(--text-secondary)', fontWeight: item.daysOfSupply <= 2 ? 700 : 400 }}>
                          {item.daysOfSupply} days left
                        </div>
                      </td>

                      {/* FEATURE 1: AI Demand Forecast Column */}
                      <td style={{ padding: '14px 16px' }}>
                        {forecast ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                                {forecast.predictedDailyDemand}/day
                              </span>
                              <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                                {forecast.trendPercentage > 0 ? '+' : ''}{forecast.trendPercentage}%
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Est. 30d: ~{forecast.predicted30dDemand} units
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Baseline</span>
                        )}
                      </td>

                      {/* Expiry Date */}
                      <td style={{ padding: '14px 16px' }}>
                        <div className="font-mono" style={{ fontSize: '0.82rem', color: isNearExp ? 'var(--rose-500)' : 'var(--text-main)', fontWeight: isNearExp ? 700 : 500 }}>
                          {item.expiryDate}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isNearExp ? 'var(--rose-500)' : 'var(--text-muted)' }}>
                          {item.daysToExpiry > 0 ? `${item.daysToExpiry} days left` : 'Expired'}
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatINR(item.unitCost)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MRP {formatINR(item.mrp)}</div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${
                          isSevere ? 'badge-critical' : isLow ? 'badge-low' : isNearExp ? 'badge-expiry' : 'badge-healthy'
                        }`}>
                          {item.statusBadge.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => startNegotiation(item)}
                            title="Start AI bargaining with vendors"
                          >
                            <Bot size={13} /> Restock
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => triggerUrgentStockout(item.sku)}
                            title="Simulate sudden stock drop to 2 units to test AI triggers"
                          >
                            <Flame size={13} color="#f43f5e" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
