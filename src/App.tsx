import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Pos from './pages/Pos';
import PrimaryProductsPage from './pages/PrimaryProductsPage';
import DistributorsPage from './pages/DistributorsPage';
import SubproductFormPage from './pages/SubproductFormPage';
import SubproductsListPage from './pages/SubproductsListPage';
import FinalProductsListPage from './pages/FinalProductsListPage';
import BatchPreparationPage from './pages/BatchPreparationPage';
import FinalProductFormPage from './pages/FinalProductFormPage';
import MenuOverviewPage from './pages/MenuOverviewPage';
import ResaleItemsPage from './pages/ResaleItemsPage';
import LiveInventoryPage from './pages/LiveInventoryPage';
import POSPage from './pages/POSPage';
import CashSessionSummaryPage from './pages/CashSessionSummaryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ShoppingListPage from './pages/ShoppingListPage';
import { Navigation } from './components/Navigation';
import { RoleGuard } from './components/RoleGuard';
import { WebSocketProvider } from './providers/WebSocketProvider';
import api from './api/axios';
import { useAuthStore } from './store/authStore';

export default function App() {
  const [loading, setLoading] = useState(true);
  const { setAuth, accessToken, role } = useAuthStore();

  useEffect(() => {
    // Attempt silent refresh on app load to hydrate session
    const hydrateSession = async () => {
      try {
        const response = await api.post('/api/auth/refresh', {}, { withCredentials: true });
        const { accessToken } = response.data;
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        setAuth(accessToken, payload.role);
      } catch (error) {
        // No valid session, let them stay logged out
      } finally {
        setLoading(false);
      }
    };
    hydrateSession();
  }, [setAuth]);

  if (loading) return <div>Cargando...</div>;

  return (
    <>
      <Toaster position="top-right" richColors />
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={accessToken ? <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/pos'} replace /> : <Login />} />
            
            {/* Protected Routes for CASHIER or ADMIN */}
          <Route element={<RoleGuard allowedRoles={['CASHIER', 'ADMIN']} />}>
            <Route path="/pos" element={<Pos />} />
          </Route>

          {/* Protected Routes for ADMIN ONLY */}
          <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
            <Route path="/admin/*" element={
              <div className="admin-container" style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
                <Navigation />
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="shopping-list" element={<ShoppingListPage />} />
                    <Route path="pos" element={<POSPage />} />
                    <Route path="cashier-summary" element={<CashSessionSummaryPage />} />
                    <Route path="inventory" element={<PrimaryProductsPage />} />
                    <Route path="distributors" element={<DistributorsPage />} />
                    <Route path="recipes/new" element={<SubproductFormPage />} />
                    <Route path="recipes" element={<SubproductsListPage />} />
                    <Route path="batches" element={<BatchPreparationPage />} />
                    <Route path="menu" element={<MenuOverviewPage />} />
                    <Route path="menu/new" element={<FinalProductFormPage />} />
                    <Route path="menu/list" element={<FinalProductsListPage />} />
                    <Route path="resale" element={<ResaleItemsPage />} />
                    <Route path="live-inventory" element={<LiveInventoryPage />} />
                    <Route path="*" element={<Navigate to="/admin/inventory" replace />} />
                  </Routes>
                </div>
              </div>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </>
  );
}
