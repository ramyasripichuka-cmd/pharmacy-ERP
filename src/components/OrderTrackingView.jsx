import React, { useState } from 'react';
import { usePharmacy, formatINR } from '../context/PharmacyContext';
import { ORDER_TRACKING_STAGES } from '../data/mockData';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Building2, 
  ArrowRight, 
  RotateCw, 
  FileText, 
  ShieldAlert,
  Search,
  Sparkles,
  PackageCheck
} from 'lucide-react';

export default function OrderTrackingView() {
  const { 
    purchaseOrders, 
    advanceOrderStatus, 
    toggleOrderDelayed, 
    receiveGoods, 
    setPreviewPO,
    setActiveTab 
  } = usePharmacy();

  const [selectedPoNumber, setSelectedPoNumber] = useState(
    purchaseOrders[0] ? purchaseOrders[0].poNumber : null
  );
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const activeOrder = purchaseOrders.find(p => p.poNumber === selectedPoNumber) || purchaseOrders[0];

  const filteredOrders = purchaseOrders.filter(po => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(term) ||
      po.vendorName.toLowerCase().includes(term) ||
      (po.trackingNumber && po.trackingNumber.toLowerCase().includes(term)) ||
      po.items.some(i => i.name.toLowerCase().includes(term));

    let matchesFilter = true;
    if (filterStatus === 'IN_TRANSIT') matchesFilter = po.trackingStatus !== 'Delivered';
    else if (filterStatus === 'DELAYED') matchesFilter = po.isDelayed;
    else if (filterStatus === 'DELIVERED') matchesFilter = po.trackingStatus === 'Delivered';

    return matchesSearch && matchesFilter;
  });

  const inTransitCount = purchaseOrders.filter(p => p.trackingStatus !== 'Delivered').length;
  const delayedCount = purchaseOrders.filter(p => p.isDelayed).length;

  return (
    <div className="animate-slide-down">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={28} color="var(--emerald-500)" /> Live PO Order Tracking & Dispatch SLA
            </h2>
            <span className="badge badge-healthy" style={{ fontSize: '0.72rem' }}>
              <Sparkles size={11} /> Real-Time Telemetry
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track vendor fulfillment pipeline: PO Created → Order Confirmed → Dispatched → In Transit → Out for Delivery → Delivered.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('orders')}
          >
            <FileText size={15} /> View ERP Ledger
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '10px' }}>
            <Package size={20} color="var(--blue-500)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Shipments</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>{inTransitCount} In Transit</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: delayedCount > 0 ? '#fff1f2' : '#ecfdf5', borderRadius: '10px' }}>
            <AlertTriangle size={20} color={delayedCount > 0 ? 'var(--rose-500)' : 'var(--emerald-500)'} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>SLA Delayed Orders</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: delayedCount > 0 ? 'var(--rose-500)' : 'var(--emerald-500)' }}>
              {delayedCount} Delayed
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '10px' }}>
            <CheckCircle2 size={20} color="var(--emerald-500)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Fulfilled</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-500)' }}>
              {purchaseOrders.filter(p => p.trackingStatus === 'Delivered').length} Delivered
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders List & Detailed Tracking Timeline */}
      <div className="grid-cols-3" style={{ alignItems: 'start', gap: '24px' }}>
        
        {/* Left Column: Orders Selector */}
        <div>
          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input 
                  type="text"
                  placeholder="Search PO#, tracking#, medicine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 32px',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button 
                  className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterStatus('ALL')}
                >
                  All ({purchaseOrders.length})
                </button>
                <button 
                  className={`btn btn-sm ${filterStatus === 'IN_TRANSIT' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterStatus('IN_TRANSIT')}
                >
                  In Transit ({inTransitCount})
                </button>
                <button 
                  className={`btn btn-sm ${filterStatus === 'DELAYED' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterStatus('DELAYED')}
                  style={{ color: filterStatus !== 'DELAYED' && delayedCount > 0 ? 'var(--rose-500)' : undefined }}
                >
                  Delayed ({delayedCount})
                </button>
              </div>
            </div>

            {/* List of Orders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No orders match this filter.
                </div>
              ) : (
                filteredOrders.map(po => {
                  const isSelected = activeOrder && activeOrder.poNumber === po.poNumber;
                  const isDelivered = po.trackingStatus === 'Delivered';
                  return (
                    <div 
                      key={po.poNumber}
                      onClick={() => setSelectedPoNumber(po.poNumber)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#ffffff',
                        border: isSelected ? '2px solid var(--emerald-500)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--emerald-500)' : 'var(--cyan-500)' }}>
                          {po.poNumber}
                        </span>
                        {po.isDelayed ? (
                          <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            <AlertTriangle size={10} /> Delayed
                          </span>
                        ) : isDelivered ? (
                          <span className="badge badge-healthy" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            Delivered
                          </span>
                        ) : (
                          <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            {po.trackingStatus || 'In Transit'}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
                        {po.items && po.items[0] ? `${po.items[0].quantity}x ${po.items[0].name}` : 'Medicine restock'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        <span>{po.vendorName.split(' ')[0]}</span>
                        <span>{formatINR(po.totalAmount)}</span>
                      </div>

                      {/* Mini progress bar */}
                      <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${po.deliveryProgress || 40}%`,
                          height: '100%',
                          background: po.isDelayed ? 'var(--rose-500)' : isDelivered ? 'var(--emerald-500)' : 'var(--cyan-500)'
                        }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Right 2 Columns: Selected Order Active Tracking Timeline */}
        <div style={{ gridColumn: 'span 2' }}>
          {activeOrder ? (
            <div className="glass-panel" style={{ padding: '24px' }}>
              
              {/* Order Header Summary */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                paddingBottom: '20px', 
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {activeOrder.poNumber}
                    </h3>
                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                      {activeOrder.trackingNumber || 'TRK-IND-PENDING'}
                    </span>
                    {activeOrder.isDelayed && (
                      <span className="badge badge-critical" style={{ fontSize: '0.75rem' }}>
                        <AlertTriangle size={12} /> Delivery Delayed Past SLA
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>Vendor: <strong style={{ color: 'var(--text-main)' }}>{activeOrder.vendorName}</strong></span>
                    <span>Carrier: <strong style={{ color: 'var(--text-main)' }}>{activeOrder.carrier || 'Express Courier'}</strong></span>
                    <span>Order Date: <strong>{activeOrder.date}</strong></span>
                    <span>Expected Delivery: <strong style={{ color: activeOrder.isDelayed ? 'var(--rose-500)' : 'var(--emerald-500)' }}>{activeOrder.expectedDeliveryDate || 'N/A'}</strong></span>
                  </div>
                </div>

                {/* Simulation Control Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {activeOrder.trackingStatus !== 'Delivered' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => advanceOrderStatus(activeOrder.poNumber)}
                      title="Advance to next courier milestone"
                    >
                      <RotateCw size={14} /> Advance Order Stage
                    </button>
                  )}

                  <button 
                    className={`btn btn-sm ${activeOrder.isDelayed ? 'btn-secondary' : 'btn-danger'}`}
                    onClick={() => toggleOrderDelayed(activeOrder.poNumber)}
                    title="Simulate delay condition"
                  >
                    <AlertTriangle size={14} /> {activeOrder.isDelayed ? 'Clear Delay' : 'Simulate Delay'}
                  </button>

                  {activeOrder.trackingStatus === 'Delivered' && activeOrder.status !== 'Delivered & Stock Updated' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => receiveGoods(activeOrder.poNumber)}
                    >
                      <PackageCheck size={14} /> Confirm Goods GRN
                    </button>
                  )}

                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPreviewPO(activeOrder)}
                  >
                    <FileText size={14} /> View PO Document
                  </button>
                </div>
              </div>

              {/* Delayed Warning Alert Box */}
              {activeOrder.isDelayed && (
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius-md)', 
                  background: '#fff1f2', 
                  border: '1px solid #fecdd3', 
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.85rem',
                  color: '#9f1239'
                }}>
                  <ShieldAlert size={20} color="var(--rose-500)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>SLA Breach Warning:</strong> Current simulated date exceeds the expected delivery commitment ({activeOrder.expectedDeliveryDate}). Courier reported transit corridor delay. Vendor reliability metrics automatically adjust.
                  </div>
                </div>
              )}

              {/* Visual 6-Stage Progress Stepper */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Fulfillment Pipeline (Stage: {activeOrder.trackingStatus || 'PO Created'})
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(6, 1fr)', 
                  gap: '8px', 
                  position: 'relative' 
                }}>
                  {ORDER_TRACKING_STAGES.map((stage, idx) => {
                    const currentStepNum = ORDER_TRACKING_STAGES.findIndex(s => s.label === (activeOrder.trackingStatus || 'PO Created')) + 1;
                    const isCompleted = currentStepNum >= stage.step;
                    const isCurrent = currentStepNum === stage.step;

                    return (
                      <div key={stage.key} style={{ textAlign: 'center' }}>
                        {/* Step Circle */}
                        <div style={{
                          width: '34px',
                          height: '34px',
                          margin: '0 auto 8px',
                          borderRadius: '50%',
                          background: isCurrent 
                            ? 'var(--emerald-500)' 
                            : isCompleted 
                              ? '#d1fae5' 
                              : '#f1f5f9',
                          color: isCurrent 
                            ? '#ffffff' 
                            : isCompleted 
                              ? '#065f46' 
                              : '#94a3b8',
                          border: isCurrent 
                            ? '2px solid var(--emerald-500)' 
                            : isCompleted 
                              ? '1px solid #a7f3d0' 
                              : '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          boxShadow: isCurrent ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
                          transition: 'all 0.2s ease'
                        }}>
                          {isCompleted && !isCurrent ? <CheckCircle2 size={16} /> : stage.step}
                        </div>

                        {/* Label */}
                        <div style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: isCurrent ? 800 : isCompleted ? 600 : 500, 
                          color: isCurrent ? 'var(--emerald-500)' : isCompleted ? 'var(--text-main)' : 'var(--text-muted)',
                          lineHeight: 1.2
                        }}>
                          {stage.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Connecting Progress Line */}
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  background: '#e2e8f0', 
                  borderRadius: '3px', 
                  marginTop: '14px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{
                    width: `${activeOrder.deliveryProgress || 15}%`,
                    height: '100%',
                    background: activeOrder.isDelayed 
                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
                      : 'linear-gradient(90deg, #10b981, #06b6d4)',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
              </div>

              {/* Items in this Order */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Ordered Pharmaceuticals:
                </div>
                <div style={{ 
                  padding: '12px 16px', 
                  background: '#f8fafc', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    {activeOrder.items && activeOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {item.quantity} Units
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>•</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</span>
                        <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--cyan-500)' }}>({item.sku})</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Contract Agreed Total:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatINR(activeOrder.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Real-Time Tracking Timeline Events */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Milestone Route Activity Log:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '8px' }}>
                  {(activeOrder.timeline || []).map((event, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {/* Timeline dot */}
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: '#ecfdf5', 
                        border: '2px solid var(--emerald-500)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        <CheckCircle2 size={13} color="var(--emerald-500)" />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {event.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {event.time}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--cyan-500)', fontWeight: 600, marginTop: '1px' }}>
                          📍 {event.location}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                          {event.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a purchase order to view tracking details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
