import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function MerchantLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#1e293b', color: '#fff', padding: 16 }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 18 }}>ArmAI</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavLink to="/merchant/dashboard" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Dashboard
          </NavLink>
          <NavLink to="/merchant/orders" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Orders
          </NavLink>
          <NavLink to="/merchant/products" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Products
          </NavLink>
          <NavLink to="/merchant/categories" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Categories
          </NavLink>
          <NavLink to="/merchant/knowledge" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Knowledge
          </NavLink>
          <NavLink to="/merchant/promotions" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Promotions
          </NavLink>
          <NavLink to="/merchant/payment-accounts" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Payment accounts
          </NavLink>
          <NavLink to="/merchant/bank-sync" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Bank Sync
          </NavLink>
          <NavLink to="/merchant/settings" style={({ isActive }) => ({ color: isActive ? '#93c5fd' : '#cbd5e1', padding: 8, borderRadius: 4 })}>
            Settings
          </NavLink>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ display: 'block', marginTop: 8, padding: '6px 12px', background: 'transparent', color: '#cbd5e1', border: '1px solid #475569', borderRadius: 4 }}>
            Sign out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
