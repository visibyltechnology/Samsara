import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // Keep user in sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load cart from localStorage (guest) or Supabase (logged in)
  useEffect(() => {
    if (user) {
      loadServerCart(user.id);
    } else {
      const local = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(local);
    }
  }, [user]);

  const loadServerCart = async (userId) => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, compare_at_price, image_url, slug)')
      .eq('user_id', userId);
    if (data) setCartItems(data.map(item => ({
      id: item.id,
      product: item.products,
      quantity: item.quantity,
    })));
  };

  const saveLocal = (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = async (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product?.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map(i =>
          i.product?.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updated = [...prev, { product, quantity, id: Date.now() }];
      }
      if (!user) saveLocal(updated);
      return updated;
    });

    if (user) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity });
      }
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) { removeFromCart(cartItemId); return; }
    setCartItems(prev => {
      const updated = prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i);
      if (!user) saveLocal(updated);
      return updated;
    });
    if (user) await supabase.from('cart_items').update({ quantity: newQty }).eq('id', cartItemId);
  };

  const removeFromCart = async (cartItemId) => {
    setCartItems(prev => {
      const updated = prev.filter(i => i.id !== cartItemId);
      if (!user) saveLocal(updated);
      return updated;
    });
    if (user) await supabase.from('cart_items').delete().eq('id', cartItemId);
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    if (user) await supabase.from('cart_items').delete().eq('user_id', user.id);
  };

  const cartTotal = cartItems.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
