import React from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import AlertsView from './components/AlertsView';
import VendorComparisonView from './components/VendorComparisonView';
import NegotiationStudioView from './components/NegotiationStudioView';
import ErpLedgerView from './components/ErpLedgerView';
import OrderTrackingView from './components/OrderTrackingView';
import AnalyticsView from './components/AnalyticsView';
import PurchaseOrderModal from './components/PurchaseOrderModal';
import AddMedicineModal from './components/AddMedicineModal';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

function AppContent() {
  const { activeTab, toasts } = usePharmacy();

  return (
    <div>
      <Navbar />

      <main className="app-container">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'vendors' && <VendorComparisonView />}
        {activeTab === 'negotiation' && <NegotiationStudioView />}
        {activeTab === 'orders' && <ErpLedgerView />}
        {activeTab === 'tracking' && <OrderTrackingView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      <PurchaseOrderModal />
      <AddMedicineModal />

      {/* Floating Toast Notification Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        maxWidth: '380px'
      }}>
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          return (
            <div
              key={toast.id}
              className="glass-panel"
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: isSuccess ? 'rgba(16, 185, 129, 0.95)' : isWarning ? 'rgba(245, 158, 11, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                color: isSuccess || isWarning ? '#0f172a' : '#ffffff',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.84rem',
                fontWeight: 600,
                border: 'none',
                animation: 'slideDown 0.2s ease-out'
              }}
            >
              {isSuccess && <CheckCircle2 size={18} color="#064e3b" />}
              {isWarning && <AlertTriangle size={18} color="#78350f" />}
              {!isSuccess && !isWarning && <Info size={18} color="var(--cyan-500)" />}
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PharmacyProvider>
      <AppContent />
    </PharmacyProvider>
  );
}
