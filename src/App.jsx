import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import BundlesPage from './pages/BundlesPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SubscriptionCheckoutPage from './pages/SubscriptionCheckoutPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AddressBookPage from './pages/AddressBookPage';
import LoyaltyPage from './pages/LoyaltyPage';
import SubscriptionDashboardPage from './pages/SubscriptionDashboardPage';

// Admin Imports
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminDeliveryZones from './pages/admin/AdminDeliveryZones';
import AdminLoyalty from './pages/admin/AdminLoyalty';
import AdminAbandonedCarts from './pages/admin/AdminAbandonedCarts';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import { Outlet } from 'react-router-dom';

const queryClient = new QueryClient();

const StoreLayout = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              {/* Store Routes */}
              <Route path="/" element={<StoreLayout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="bundles" element={<BundlesPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="subscription-checkout" element={<SubscriptionCheckoutPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="address-book" element={<AddressBookPage />} />
                <Route path="loyalty" element={<LoyaltyPage />} />
                <Route path="my-subscriptions" element={<SubscriptionDashboardPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="delivery-zones" element={<AdminDeliveryZones />} />
                <Route path="loyalty" element={<AdminLoyalty />} />
                <Route path="abandoned-carts" element={<AdminAbandonedCarts />} />
                <Route path="referrals" element={<AdminReferrals />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
