import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import SuperLayout from './layouts/SuperLayout';
import MerchantLayout from './layouts/MerchantLayout';
import SuperDashboard from './pages/super/SuperDashboard';
import SuperMerchants from './pages/super/SuperMerchants';
import SuperSupport from './pages/super/SuperSupport';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantOrders from './pages/merchant/MerchantOrders';
import MerchantBankSync from './pages/merchant/MerchantBankSync';
import MerchantSettings from './pages/merchant/MerchantSettings';

function ProtectedRoute({ children, requireSuper }: { children: React.ReactNode; requireSuper?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireSuper && user.role !== 'super_admin') return <Navigate to="/merchant/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/super"
        element={
          <ProtectedRoute requireSuper>
            <SuperLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/super/dashboard" replace />} />
        <Route path="dashboard" element={<SuperDashboard />} />
        <Route path="merchants" element={<SuperMerchants />} />
        <Route path="support" element={<SuperSupport />} />
      </Route>
      <Route
        path="/merchant"
        element={
          <ProtectedRoute>
            <MerchantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/merchant/dashboard" replace />} />
        <Route path="dashboard" element={<MerchantDashboard />} />
        <Route path="orders" element={<MerchantOrders />} />
        <Route path="bank-sync" element={<MerchantBankSync />} />
        <Route path="settings" element={<MerchantSettings />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
