import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  ArrowDownToLine,
  Truck
} from 'lucide-react';

export default function PurchaseOrderModal() {
  const { previewPO, setPreviewPO, storeProfile, formatINR } = usePharmacy();

  if (!previewPO) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '36px',
          position: 'relative'
        }}
      >
        {/* Modal Controls (Not printed) */}
        <div className="no-print" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-healthy" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
              <CheckCircle2 size={12} /> Confirmed & Written to ERP
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              PO Number: <strong>{previewPO.poNumber}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint} style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
              <Printer size={15} /> Print / Save PDF
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setPreviewPO(null)}
              style={{ padding: '6px', color: '#0f172a' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Purchase Order Document */}
        <div id="printable-po">
          {/* Document Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {storeProfile.name}
                </h2>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                <div>{storeProfile.address}</div>
                <div>Drug License: <strong>{storeProfile.licenseNo}</strong> • GSTIN: <strong>{storeProfile.gstNumber}</strong></div>
                <div>Email: {storeProfile.email} • Ph: {storeProfile.phone}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                color: '#059669', 
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                PURCHASE ORDER
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {previewPO.poNumber}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                Date: <strong>{previewPO.date}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Terms: <strong>{previewPO.paymentTerms}</strong>
              </div>
            </div>
          </div>

          {/* Vendor vs Ship-to Split */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px', 
            padding: '16px', 
            background: '#f8fafc', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
            fontSize: '0.85rem'
          }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                VENDOR / DISTRIBUTOR:
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{previewPO.vendorName}</div>
              <div style={{ color: '#475569', marginTop: '2px' }}>Authorized Pharmaceutical Supply Partner</div>
              <div style={{ color: '#475569' }}>Standard Delivery SLA: {previewPO.deliveryDays} Business Day(s)</div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                SHIP TO & INVOICE DESTINATION:
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{storeProfile.name} - Receiving Dock</div>
              <div style={{ color: '#475569', marginTop: '2px' }}>{storeProfile.address}</div>
              <div style={{ color: '#475569' }}>Attention: {storeProfile.pharmacistInCharge}</div>
            </div>
          </div>

          {/* Logistics & Order Tracking Strip */}
          {previewPO.trackingNumber && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} color="#2563eb" />
                <span style={{ color: '#1e40af', fontWeight: 600 }}>Logistics & Order Tracking:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>{previewPO.trackingNumber}</span>
                <span style={{ color: '#64748b' }}>via {previewPO.carrier}</span>
              </div>
              <div style={{ color: '#1e40af' }}>
                ETA: <strong>{previewPO.expectedDeliveryDate || 'Within SLA'}</strong>
              </div>
            </div>
          )}

          {/* Itemized Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: '#334155' }}>Item & SKU</th>
                <th style={{ padding: '10px 12px', color: '#334155', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px 12px', color: '#334155', textAlign: 'right' }}>Catalog Price</th>
                <th style={{ padding: '10px 12px', color: '#334155', textAlign: 'right' }}>Agreed Price</th>
                <th style={{ padding: '10px 12px', color: '#334155', textAlign: 'right' }}>Direct Savings</th>
                <th style={{ padding: '10px 12px', color: '#334155', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {previewPO.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>SKU: {item.sku}</div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatINR(item.originalPrice)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                    {formatINR(item.negotiatedPrice)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                    -{formatINR(item.savings)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                    {formatINR(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals Callout */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Standard Catalog Subtotal:</span>
                <span>{formatINR(previewPO.totalAmount + previewPO.totalSavings)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                <span>AI Bargaining Savings ({previewPO.savingsPercentage}%):</span>
                <span>-{formatINR(previewPO.totalSavings)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #cbd5e1', paddingTop: '8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                <span>Net Purchase Amount:</span>
                <span>{formatINR(previewPO.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* AI Procurement Rationale & Regulatory Compliance */}
          <div style={{ 
            padding: '12px 16px', 
            background: '#ecfdf5', 
            border: '1px solid #a7f3d0', 
            borderRadius: '6px', 
            fontSize: '0.78rem',
            color: '#065f46',
            lineHeight: 1.5,
            marginBottom: '28px'
          }}>
            <strong>AI Procurement Optimization Log:</strong> {previewPO.aiReasoning}
          </div>

          {/* Footer & Digital Authorization Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
            <div>
              <div style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '1rem', color: '#334155' }}>
                ||||| | |||| |||||| || | ||||
              </div>
              <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>E-VERIFIED PO ID: {previewPO.poNumber}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
                Authorized Signature:
              </div>
              <div style={{ borderTop: '1px dashed #94a3b8', paddingTop: '4px', minWidth: '180px' }}>
                Dr. Elena Vance, PharmD
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
