import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBanner from './components/TopBanner';
import Navbar from './components/Navbar';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Cart from './components/Cart';
import SubscriptionModal from './components/SubscriptionModal';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useApp } from './context/AppContext';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_NAME } from './data/products';
import './index.css';

function AppInner() {
  const { setCartOpen, cartTotal, clearCart, addOrder, user, activateSubscription } = useApp();
  const [showSubModal, setShowSubModal] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Load Korapay script once
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://korapay.com/merchant/api/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { try { document.body.removeChild(script); } catch {} };
  }, []);

  const initiateKorapayCheckout = (amount, onSuccess) => {
    if (!window.Korapay) { alert('Payment is loading, please try again.'); return; }
    window.Korapay.initialize({
      key: 'pk_live_ZEMDixqt5DcwbTVE35hR5rouew2LPu3UXPsWRNnG',
      reference: `samsara_${Date.now()}`,
      amount,
      currency: 'NGN',
      customer: {
        name: user?.name || 'Guest',
        email: user?.email || 'guest@samsarachoice.com',
      },
      onSuccess: (data) => { if (onSuccess) onSuccess(data); },
      onClose: () => {},
    });
  };

  const handleCheckout = () => {
    // Show subscription modal first
    setCartOpen(false);
    setShowSubModal(true);
    setPendingCheckout(true);
  };

  const proceedWithPayment = (withSubscription) => {
    setShowSubModal(false);
    const orderAmount = cartTotal;

    if (withSubscription) {
      // Pay cart + subscription
      const total = orderAmount + SUBSCRIPTION_PRICE;
      initiateKorapayCheckout(total, (data) => {
        addOrder({ amount: orderAmount, reference: data.reference, items: [] });
        activateSubscription({ name: SUBSCRIPTION_NAME, price: SUBSCRIPTION_PRICE });
        clearCart();
      });
    } else {
      // Just pay cart
      initiateKorapayCheckout(orderAmount, (data) => {
        addOrder({ amount: orderAmount, reference: data.reference, items: [] });
        clearCart();
      });
    }
  };

  return (
    <BrowserRouter>
      <TopBanner />
      <Navbar onCartClick={() => setCartOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <FloatingWhatsApp />
      <Cart onCheckout={handleCheckout} />
      {showSubModal && (
        <SubscriptionModal
          onClose={() => setShowSubModal(false)}
          onSubscribe={() => proceedWithPayment(true)}
          onSkip={() => proceedWithPayment(false)}
        />
      )}
    </BrowserRouter>
  );
}

function App() {
  return <AppInner />;
}

export default App;
