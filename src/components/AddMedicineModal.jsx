import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { X, PlusCircle, Pill } from 'lucide-react';

export default function AddMedicineModal() {
  const { isAddMedicineOpen, setIsAddMedicineOpen, addMedicine } = usePharmacy();

  const [formData, setFormData] = useState({
    name: '',
    sku: `MED-${Math.floor(100 + Math.random() * 900)}`,
    generic: '',
    category: 'Antibiotics',
    form: 'Tablets (Box of 100)',
    currentStock: 15,
    reorderThreshold: 50,
    dailySales: 6,
    unitCost: 120.00,
    mrp: 220.00,
    expiryDate: '2027-09-30',
    batchNumber: `BN-2025-${Math.floor(10 + Math.random() * 90)}X`,
    storage: 'Room Temp (15-25°C)',
    preferredVendorId: 'v1'
  });

  if (!isAddMedicineOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addMedicine(formData);
    setIsAddMedicineOpen(false);
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
          maxWidth: '580px',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px' }}>
              <Pill size={20} color="var(--emerald-600)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Add Medicine to ERP</h3>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAddMedicineOpen(false)}
            style={{ padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Medicine Brand Name *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Augmentin 625mg Duo"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>SKU Code</label>
              <input 
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Generic Formula</label>
              <input 
                type="text"
                placeholder="e.g. Amoxicillin + Clavulanic Acid"
                value={formData.generic}
                onChange={e => setFormData({ ...formData, generic: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Therapeutic Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Antidiabetic">Antidiabetic</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Analgesics / Antipyretic">Analgesics / Antipyretic</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Critical / Cold Chain">Critical / Cold Chain</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Current Stock</label>
              <input 
                type="number"
                value={formData.currentStock}
                onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Reorder Level</label>
              <input 
                type="number"
                value={formData.reorderThreshold}
                onChange={e => setFormData({ ...formData, reorderThreshold: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Daily Sales</label>
              <input 
                type="number"
                step="0.5"
                value={formData.dailySales}
                onChange={e => setFormData({ ...formData, dailySales: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Unit Cost (₹)</label>
              <input 
                type="number"
                step="1"
                value={formData.unitCost}
                onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Retail MRP (₹)</label>
              <input 
                type="number"
                step="1"
                value={formData.mrp}
                onChange={e => setFormData({ ...formData, mrp: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Expiry Date</label>
              <input 
                type="date"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsAddMedicineOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} /> Save to Inventory
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
