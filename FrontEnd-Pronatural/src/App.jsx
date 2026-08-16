import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GlobalDataProvider } from './context/GlobalDataContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './frontend-admin/pages/AdminLayout';
import Login from './frontend-clientes/pages/auth/Login';
import Register from './frontend-clientes/pages/auth/Register';
import RecoverPassword from './frontend-clientes/pages/auth/RecoverPassword';
import Landing from './frontend-clientes/pages/Landing';
import About from './frontend-clientes/pages/About';
import Contact from './frontend-clientes/pages/Contact';
import Reviews from './frontend-clientes/pages/Reviews';
import ProductDetail from './frontend-clientes/pages/ProductDetail';
import Checkout from './frontend-clientes/pages/Checkout';
import Cart from './frontend-clientes/pages/Cart';
import Profile from './frontend-clientes/pages/Profile';
import WhatsappOrder from './frontend-clientes/pages/WhatsappOrder';
import Catalog from './frontend-clientes/pages/Catalog';
import AdminLogin from './frontend-admin/pages/auth/AdminLogin';
import AdminRegister from './frontend-admin/pages/auth/AdminRegister';
import AdminRecoverPassword from './frontend-admin/pages/auth/AdminRecoverPassword';
import AdminCategories from './frontend-admin/pages/AdminCategories';
import AdminCatalog from './frontend-admin/pages/AdminCatalog';
import InventoryManagement from './frontend-admin/pages/InventoryManagement';
import SalesEntry from './frontend-admin/pages/SalesEntry';
import AdminSellers from './frontend-admin/pages/AdminSellers';
import AdminCustomers from './frontend-admin/pages/AdminCustomers';
import Reports from './frontend-admin/pages/Reports';
import VendorDashboard from './frontend-admin/pages/VendorDashboard';
import SalesHistory from './frontend-admin/pages/SalesHistory';
import Settings from './frontend-admin/pages/Settings';
import AdminReviews from './frontend-admin/pages/AdminReviews';
import AdminDashboard from './frontend-admin/pages/AdminDashboard';
import { ADMIN_PREFIX } from './config';

import NotFound from './frontend-clientes/pages/NotFound';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GlobalDataProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  borderRadius: '2px',
                  fontFamily: 'Inter, sans-serif',
                },
              }}
            />
            <Routes>
              {/* Rutas de autenticación de clientes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover" element={<RecoverPassword />} />

              {/* Rutas de autenticación de administración */}
              <Route path={`${ADMIN_PREFIX}/login`} element={<AdminLogin />} />
              <Route path={`${ADMIN_PREFIX}/register`} element={<AdminRegister />} />
              <Route path={`${ADMIN_PREFIX}/recover`} element={<AdminRecoverPassword />} />

              {/* Tienda de Clientes (Acceso público libre para explorar la web) */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Landing />} />
                <Route path="catalogo" element={<Catalog />} />
                <Route path="acerca" element={<About />} />
                <Route path="contacto" element={<Contact />} />
                <Route path="resenas" element={<Reviews />} />
                <Route path="producto/:id" element={<ProductDetail />} />
                <Route path="carrito" element={<Cart />} />
                <Route path="whatsapp-order" element={<WhatsappOrder />} />
                <Route path="perfil" element={<Profile />} />
                <Route
                  path="pago"
                  element={
                    <ProtectedRoute allowedRoles={['Customer', 'Admin', 'Employee']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Rutas de administración y vendedores */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path={ADMIN_PREFIX} element={
                  <ProtectedRoute allowedRoles={['Admin']} authFallback={`${ADMIN_PREFIX}/login`}><AdminDashboard /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/catalogo`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}><AdminCatalog /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/inventario`} element={
                  <ProtectedRoute allowedRoles={['Admin']} authFallback={`${ADMIN_PREFIX}/login`}><InventoryManagement /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/vendedores`} element={
                  <ProtectedRoute allowedRoles={['Admin']} authFallback={`${ADMIN_PREFIX}/login`}><AdminSellers /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/clientes`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}><AdminCustomers /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/reportes`} element={
                  <ProtectedRoute allowedRoles={['Admin']} authFallback={`${ADMIN_PREFIX}/login`}><Reports /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/vendedor`} element={
                  <ProtectedRoute allowedRoles={['Employee']} authFallback={`${ADMIN_PREFIX}/login`}><VendorDashboard /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/ventas/registrar`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}><SalesEntry /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/ventas/historial`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}><SalesHistory /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/ajustes`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}><Settings /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/categorias`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}>
                    <AdminCategories />
                  </ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/resenas`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}><AdminReviews /></ProtectedRoute>
                } />
              </Route>

              {/* Ruta de error 404 para URLs no encontradas */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </GlobalDataProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
export default App;