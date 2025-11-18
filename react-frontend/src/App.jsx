import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StoreFormPage from './pages/StoreFormPage';
import StoreDashboardPage from './pages/StoreDashboardPage';
import ProductFormPage from './pages/ProductFormPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import PublicStorePage from './pages/PublicStorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShoppingCartPage from './pages/cart/ShoppingCartPage';
import CustomerLoginPage from './pages/customer/CustomerLoginPage';
import CustomerRegisterPage from './pages/customer/CustomerRegisterPage';
import CustomerOrderHistoryPage from './pages/customer/CustomerOrderHistoryPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import OrderManagementPage from './pages/OrderManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <CartProvider>
      <Router>
          <Routes>
            {/* Admin Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/store-form" element={<StoreFormPage />} />
            <Route path="/store-dashboard" element={<StoreDashboardPage />} />
            <Route path="/product-form" element={<ProductFormPage />} />
            <Route path="/orders" element={<OrderManagementPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Public Store Routes */}
            <Route path="/store/:slug" element={<PublicStorePage />} />
            <Route path="/store/:slug/product/:productId" element={<ProductDetailPage />} />
            <Route path="/store/:slug/cart" element={<ShoppingCartPage />} />
            <Route path="/store/:slug/checkout" element={<CheckoutPage />} />
            <Route path="/store/:slug/payment-success/:orderId" element={<PaymentSuccessPage />} />
            <Route path="/store/:slug/payment-failed" element={<PaymentFailedPage />} />
            <Route path="/store/:slug/login" element={<CustomerLoginPage />} />
            <Route path="/store/:slug/register" element={<CustomerRegisterPage />} />
            <Route path="/store/:slug/orders" element={<CustomerOrderHistoryPage />} />
          </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
