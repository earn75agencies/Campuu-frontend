import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import AdvancedSearch from './pages/AdvancedSearch';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import SellerProfile from './pages/SellerProfile';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import EditProfile from './pages/EditProfile';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentRedirect from './pages/PaymentRedirect';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Seller Pages
import SellerDashboard from './pages/SellerDashboard';
import SellerOrders from './pages/SellerOrders';
import SellerProducts from './pages/SellerProducts';
import SellerAddProduct from './pages/SellerAddProduct';
import EditProduct from './pages/EditProduct';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';

// Components
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/search" element={<AdvancedSearch />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:categoryName" element={<CategoryProducts />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/orders/:id/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/seller/:id" element={<SellerProfile />} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
              <Route path="/payment/redirect/:orderId" element={<PaymentRedirect />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/not-found" element={<NotFound />} />

              {/* Seller Routes */}
              <Route
                path="/seller/dashboard"
                element={
                  <SellerRoute>
                    <SellerDashboard />
                  </SellerRoute>
                }
              />
              <Route
                path="/seller/orders"
                element={
                  <SellerRoute>
                    <SellerOrders />
                  </SellerRoute>
                }
              />
              <Route
                path="/seller/products"
                element={
                  <SellerRoute>
                    <SellerProducts />
                  </SellerRoute>
                }
              />
              <Route
                path="/seller/add-product"
                element={
                  <SellerRoute>
                    <SellerAddProduct />
                  </SellerRoute>
                }
              />
              <Route
                path="/seller/products/edit/:id"
                element={
                  <SellerRoute>
                    <EditProduct />
                  </SellerRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />

              {/* Catch all routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
