import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1, subscribe: false }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const toggleSubscribe = (id, value) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, subscribe: value } : i));
  };

  const saveForLater = (id) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      setSavedItems(prev => [...prev.filter(i => i.id !== id), item]);
      removeFromCart(id);
    }
  };

  const moveToCart = (id) => {
    const item = savedItems.find(i => i.id === id);
    if (item) {
      addToCart(item);
      setSavedItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const removeSaved = (id) => setSavedItems(prev => prev.filter(i => i.id !== id));

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, savedItems, isCartOpen, setIsCartOpen,
      addToCart, removeFromCart, updateQty,
      toggleSubscribe, saveForLater, moveToCart, removeSaved,
      cartTotal, cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
