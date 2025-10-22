import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StoreFormPage from './pages/StoreFormPage';
import StoreDashboardPage from './pages/StoreDashboardPage';
import ProductFormPage from './pages/ProductFormPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import PublicStorePage from './pages/PublicStorePage';

function App() {
  return (
    <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/store-form" element={<StoreFormPage />} />
          <Route path="/store-dashboard" element={<StoreDashboardPage />} />
          <Route path="/product-form" element={<ProductFormPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Public Store Routes */}
          <Route path="/store/:slug" element={<PublicStorePage />} />
        </Routes>
    </Router>
  );
}

export default App;
