// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('samsara_cart')) || []; } catch { return []; }
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('samsara_user')) || null; } catch { return null; }
  });
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('samsara_orders')) || []; } catch { return []; }
  });
  const [subscription, setSubscription] = useState(() => {
    try { return JSON.parse(localStorage.getItem('samsara_subscription')) || null; } catch { return null; }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => { localStorage.setItem('samsara_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('samsara_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('samsara_subscription', JSON.stringify(subscription)); }, [subscription]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('samsara_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('samsara_user');
  };

  const addOrder = (order) => {
    const newOrder = { ...order, id: `ORD-${Date.now()}`, date: new Date().toISOString(), status: 'Processing' };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const activateSubscription = (plan) => {
    const sub = { ...plan, startDate: new Date().toISOString(), nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), active: true };
    setSubscription(sub);
  };

  const cancelSubscription = () => setSubscription(s => s ? { ...s, active: false } : null);

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount,
      user, login, logout,
      orders, addOrder,
      subscription, activateSubscription, cancelSubscription,
      cartOpen, setCartOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
