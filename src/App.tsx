import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AIReceptionistWidget } from './components/common/AIReceptionistWidget';

// Customer Pages
import { LandingPage } from './pages/customer/LandingPage';
import { AISearchPage } from './pages/customer/AISearchPage';
import { ShopsDirectoryPage } from './pages/customer/ShopsDirectoryPage';
import { ShopDetailPage } from './pages/customer/ShopDetailPage';
import { OrderCheckoutPage } from './pages/customer/OrderCheckoutPage';
import { OrderStatusPage } from './pages/customer/OrderStatusPage';
import { CustomerOrdersListPage } from './pages/customer/CustomerOrdersListPage';
import { CustomerKhataPage } from './pages/customer/CustomerKhataPage';

// Shopkeeper Pages
import { ShopkeeperDashboardLayout } from './pages/shopkeeper/ShopkeeperDashboardLayout';
import { ShopOverview } from './pages/shopkeeper/ShopOverview';
import { ManaAiPage } from './pages/shopkeeper/ManaAiPage';
import { ShopAIAssistant } from './pages/shopkeeper/ShopAIAssistant';
import { InventoryManagement } from './pages/shopkeeper/InventoryManagement';
import { OrdersManagement } from './pages/shopkeeper/OrdersManagement';
import { KhataManagement } from './pages/shopkeeper/KhataManagement';
import { SalesExpensesPage } from './pages/shopkeeper/SalesExpensesPage';
import { ReportsPage } from './pages/shopkeeper/ReportsPage';
import { ShopProfilePage } from './pages/shopkeeper/ShopProfilePage';

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Customer Shell Layout
const CustomerShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <AIReceptionistWidget />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Customer Experience Routes */}
          <Route
            path="/"
            element={
              <CustomerShell>
                <LandingPage />
              </CustomerShell>
            }
          />
          <Route
            path="/search"
            element={
              <CustomerShell>
                <AISearchPage />
              </CustomerShell>
            }
          />
          <Route
            path="/shops"
            element={
              <CustomerShell>
                <ShopsDirectoryPage />
              </CustomerShell>
            }
          />
          <Route
            path="/shop/:id"
            element={
              <CustomerShell>
                <ShopDetailPage />
              </CustomerShell>
            }
          />
          <Route
            path="/checkout/:shopId"
            element={
              <CustomerShell>
                <OrderCheckoutPage />
              </CustomerShell>
            }
          />
          <Route
            path="/order-status/:id"
            element={
              <CustomerShell>
                <OrderStatusPage />
              </CustomerShell>
            }
          />
          <Route
            path="/orders"
            element={
              <CustomerShell>
                <CustomerOrdersListPage />
              </CustomerShell>
            }
          />
          <Route
            path="/my-khata"
            element={
              <CustomerShell>
                <CustomerKhataPage />
              </CustomerShell>
            }
          />
          <Route
            path="/customer/khata"
            element={
              <CustomerShell>
                <CustomerKhataPage />
              </CustomerShell>
            }
          />

          {/* Shopkeeper Dashboard Experience */}
          <Route path="/shopkeeper" element={<ShopkeeperDashboardLayout />}>
            <Route index element={<ShopOverview />} />
            <Route path="mana-ai" element={<ManaAiPage />} />
            <Route path="ai-assistant" element={<Navigate to="/shopkeeper/mana-ai" replace />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="khata" element={<KhataManagement />} />
            <Route path="sales-expenses" element={<SalesExpensesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="profile" element={<ShopProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={
              <CustomerShell>
                <LandingPage />
              </CustomerShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
