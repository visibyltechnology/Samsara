import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadWishlist(user.id);
    } else {
      const local = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistItems(local);
    }
  }, [user]);

  const loadWishlist = async (userId) => {
    const { data } = await supabase
      .from('wishlist_items')
      .select('*, products(id, name, price, compare_at_price, image_url, slug)')
      .eq('user_id', userId);
    if (data) setWishlistItems(data.map(item => ({
      id: item.id,
      product: item.products,
    })));
  };

  const isWishlisted = (productId) => wishlistItems.some(i => i.product?.id === productId);

  const toggleWishlist = async (product) => {
    const already = isWishlisted(product.id);
    if (already) {
      setWishlistItems(prev => {
        const updated = prev.filter(i => i.product?.id !== product.id);
        if (!user) localStorage.setItem('wishlist', JSON.stringify(updated));
        return updated;
      });
      if (user) await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', product.id);
    } else {
      setWishlistItems(prev => {
        const updated = [...prev, { id: Date.now(), product }];
        if (!user) localStorage.setItem('wishlist', JSON.stringify(updated));
        return updated;
      });
      if (user) await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
