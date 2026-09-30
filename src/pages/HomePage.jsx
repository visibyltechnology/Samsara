import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Zap, Leaf, ArrowRight, Star, ShoppingCart, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';

// ─── FEATURE STRIP ────────────────────────────────────────────────────────────
const features = [
  { icon: Truck,        label: 'Free Delivery',   desc: 'On all orders' },
  { icon: ShieldCheck,  label: 'Secure Payment',  desc: '100% protected' },
  { icon: Zap,          label: 'Fast Delivery',   desc: 'Same day service' },
  { icon: Leaf,         label: 'Fresh Quality',   desc: 'Farm to table' },
];



// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: cats }, { data: featured }, { data: newProds }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*, categories(name)').eq('is_featured', true).eq('is_active', true).limit(8),
        supabase.from('products').select('*, categories(name)').eq('is_active', true).order('created_at', { ascending: false }).limit(12),
      ]);
      setCategories(cats || []);
      setFeaturedProducts(featured || []);
      setNewProducts(newProds || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div>
      {/* ─── HERO BANNER ──────────────────────────────────────────────────────── */}
      <HeroBanner />

      {/* ─── FEATURE STRIP ────────────────────────────────────────────────────── */}
      <section className="border-b bg-card">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(f => (
              <div key={f.label} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SHOP BY CATEGORY ─────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="container py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-display font-bold">Shop by Category</h2>
            <Link to="/shop" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: 'hsl(145 63% 22%)' }}>
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map(cat => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
              >
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent"></div>
                <p className="absolute bottom-3 left-3 right-3 text-card font-semibold text-sm">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── SPECIAL OFFERS ───────────────────────────────────────────────────── */}
      <section className="container py-10">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12 text-primary-foreground text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold">Special Offers</h2>
          <p className="mt-2 text-primary-foreground/80">Get up to 30% off on selected items. Fresh deals every day!</p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 font-medium transition-colors hover:bg-secondary/80 h-10 px-4 py-2 mt-4 rounded-full"
            style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
          >
            Shop Deals
          </Link>
        </div>
      </section>

      {/* ─── ALL PRODUCTS ───────────────────────────────────────────────────────── */}
      {newProducts.length > 0 && (
        <section className="container pb-10">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-6">All Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {loading && (
        <div className="container py-20 text-center text-muted-foreground">Loading...</div>
      )}
    </div>
  );
};

export default HomePage;
