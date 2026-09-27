import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { 
  FileText, 
  CheckCircle2, 
  Truck, 
  PackageCheck, 
  Printer, 
  Search, 
  Sparkles, 
  Clock, 
  TrendingUp,
  IndianRupee,
  Navigation
} from 'lucide-react';

export default function ErpLedgerView() {
  const { 
    purchaseOrders, 
    receiveGoods, 
    setPreviewPO, 
    totalLifetimeSavings, 
    totalPurchasesAmount,
    setActiveTab,
    formatINR 
  } = usePharmacy();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      po.items.some(i => i.name.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-slide-down">
      {/* Title & Stats */}
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
            ERP Purchase Order Ledger & Goods Receipt (GRN)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live record of automated AI restock contracts, delivery status tracking, and stock write-backs.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px' }}>
            <FileText size={18} color="var(--blue-500)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total ERP Orders</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{purchaseOrders.length} Orders</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px' }}>
            <IndianRupee size={18} color="var(--emerald-500)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Procurement Spend</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatINR(totalPurchasesAmount)}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px' }}>
            <TrendingUp size={18} color="var(--emerald-500)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cumulative Savings Won</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-600)' }}>{formatINR(totalLifetimeSavings)}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input 
              type="text"
              placeholder="Search PO#, vendor name, or medicine..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="In-Transit">In-Transit (Awaiting Dock GRN)</option>
              <option value="Delivered & Stock Updated">Delivered & Stock Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>PO Number & Date</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Vendor Distributor</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Ordered Items & Qty</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Agreed Amount</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Savings Won</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>ERP Status</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No purchase orders in this view.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(po => {
                  const isDelivered = po.status === 'Delivered & Stock Updated';
                  return (
                    <tr 
                      key={po.poNumber}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* PO Number */}
                      <td style={{ padding: '14px 16px' }}>
                        <div className="font-mono" style={{ fontWeight: 800, color: 'var(--cyan-700)', fontSize: '0.9rem' }}>
                          {po.poNumber}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {po.date} • {po.paymentTerms}
                        </div>
                      </td>

                      {/* Vendor */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{po.vendorName}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          SLA: {po.deliveryDays} Day(s) Transit
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '14px 16px' }}>
                        {po.items.map((item, idx) => (
                          <div key={idx}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.quantity}x</span> {item.name}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                              (@{formatINR(item.negotiatedPrice)})
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {formatINR(po.totalAmount)}
                        </div>
                      </td>

                      {/* Savings */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                          +{formatINR(po.totalSavings)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--emerald-600)' }}>
                          ({po.savingsPercentage}% off list)
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {isDelivered ? (
                          <span className="badge badge-healthy" style={{ fontSize: '0.72rem' }}>
                            <PackageCheck size={13} /> Stock Updated
                          </span>
                        ) : (
                          <span className="badge badge-low" style={{ fontSize: '0.72rem' }}>
                            <Truck size={13} /> In-Transit
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setActiveTab('tracking')}
                            title="Open live order tracking timeline"
                          >
                            <Navigation size={13} color="var(--blue-500)" /> Track
                          </button>

                          {!isDelivered && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => receiveGoods(po.poNumber)}
                              title="Goods Received Note: Instantly increment medicine stock in ERP!"
                            >
                              <PackageCheck size={14} /> Receive GRN
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setPreviewPO(po)}
                            title="View / Print Official Purchase Order"
                          >
                            <Printer size={14} /> View PO
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
