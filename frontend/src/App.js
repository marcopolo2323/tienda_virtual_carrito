import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Store 
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage'; 
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminProductFormPage from './pages/admin/ProductFormPage';
import AdminCategoriesPage from './pages/admin/CategoriesPage';
import AdminBannersPage from './pages/admin/BannerPage'; // ✅ Nueva página
import AdminBannerFormPage from './pages/admin/BannerFormPage'; // ✅ Nueva página
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminOrderDetailPage from './pages/admin/OrderDetailPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminReportsPage from './pages/admin/ReportsPage';

// Utils
import PrivateRoute from './components/utils/PrivateRoute';
import AdminRoute from './components/utils/AdminRoute';

function App() {
  const { initializeAuth, loading: authLoading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    // Inicializar autenticación y luego cargar el carrito si el usuario está logueado
    const initApp = async () => {
      console.log('🚀 Inicializando aplicación...');
      
      try {
        // Esperar a que se complete la inicialización de auth
        const user = await initializeAuth();
        
        if (user) {
          console.log('✅ Usuario autenticado:', user.email);
          console.log('🛒 Cargando carrito del usuario...');
          
          // Esperar a que se cargue el carrito
          await fetchCart();
          console.log('✅ Carrito cargado exitosamente');
        } else {
          console.log('ℹ️ Usuario no autenticado');
        }
      } catch (error) {
        console.error('❌ Error inicializando app:', error);
      } finally {
        setAppInitialized(true);
        console.log('✅ Aplicación inicializada completamente');
      }
    };

    initApp();
  }, [initializeAuth, fetchCart]);

  // Mostrar loader mientras se inicializa la app
  if (!appInitialized || authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
          <Route path="/admin/products/new" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
          <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminProductFormPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
          
          {/* ✅ Rutas de Banners */}
          <Route path="/admin/banners" element={<AdminRoute><AdminBannersPage /></AdminRoute>} />
          <Route path="/admin/banners/new" element={<AdminRoute><AdminBannerFormPage /></AdminRoute>} />
          <Route path="/admin/banners/edit/:id" element={<AdminRoute><AdminBannerFormPage /></AdminRoute>} />
          
          <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
          <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
        </Routes>
      </MainLayout>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </Router>
  );
}

export default App;