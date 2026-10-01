import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Plus, Minus, ShoppingBag, Package } from 'lucide-react';

export default function BundlesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the custom subscription basket: { productId: quantity }
  const [basket, setBasket] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBundleData();
  }, [location]);

  const fetchBundleData = async () => {
    try {
      setLoading(true);
      const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_bundle', true);
      
      if (catError || !cats || cats.length === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }
      setCategories(cats);

      const categoryIds = cats.map(c => c.id);
      const { data: prods, error: prodError } = await supabase
        .from('products')
        .select('*')
        .in('category_id', categoryIds);
      
      if (!prodError) {
        setProducts(prods || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  const updateQuantity = (productId, delta) => {
    setBasket(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const newBasket = { ...prev };
      if (next === 0) {
        delete newBasket[productId];
      } else {
        newBasket[productId] = next;
      }
      return newBasket;
    });
  };

  const selectedProducts = Object.entries(basket).map(([productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return { product, quantity, total: (product?.price || 0) * quantity };
  }).filter(item => item.product);

  const baseTotal = selectedProducts.reduce((sum, item) => sum + item.total, 0);

  const handleSubscribe = (frequency) => {
    if (baseTotal === 0) return;
    
    const customBundle = {
      id: 'custom',
      name: 'Custom Food Subscription',
      description: `Your custom selection of ${selectedProducts.length} items.`,
      image_url: selectedProducts[0]?.product?.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000',
      weekly_price: baseTotal,
      monthly_price: baseTotal * 4,
      items: selectedProducts 
    };

    navigate('/subscription-checkout', { 
      state: { 
        bundle: customBundle, 
        frequency,
        price: frequency === 'weekly' ? baseTotal : (baseTotal * 4)
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
             <Package className="h-6 w-6 text-primary" />
          </div>
          <div className="h-6 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/5 py-20 border-b border-border">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-multiply" />
        </div>

        <div className="container relative z-10 px-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border shadow-sm text-xs font-semibold text-primary mb-6">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Flexible Recurring Deliveries
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-6">
            Build Your <span className="text-primary">Custom</span> Subscription
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Select essential food items from our bundle categories to create your own recurring delivery. 
            Fresh food delivered automatically, weekly or monthly!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-3xl shadow-sm max-w-2xl mx-auto">
            <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold font-display">No Bundle Categories Found</h3>
            <p className="text-muted-foreground mt-2">The admin hasn't designated any categories as food bundles yet.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map(category => {
              const categoryProducts = products.filter(p => p.category_id === category.id);
              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id} className="scroll-mt-24">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-display font-bold">{category.name}</h2>
                    <div className="h-px bg-border flex-1 mt-2"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map(product => {
                      const quantity = basket[product.id] || 0;
                      return (
                        <div key={product.id} className="group flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                            )}
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                            <p className="text-primary font-bold text-lg mt-auto mb-5">{fmt(product.price)}</p>
                            
                            {quantity === 0 ? (
                              <button 
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-full h-11 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                              >
                                <Plus className="h-4 w-4" /> Add Item
                              </button>
                            ) : (
                              <div className="flex items-center justify-between border-2 border-primary rounded-xl h-11 px-2 bg-primary/5">
                                <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-background shadow-sm text-foreground hover:bg-muted transition-colors">
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-bold text-primary w-8 text-center">{quantity}</span>
                                <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors">
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating Subscription Footer - Glassmorphism */}
      {baseTotal > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 animate-in slide-in-from-bottom-full duration-300">
          <div className="container mx-auto px-4 h-24 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground font-medium mb-1">Your Basket ({selectedProducts.reduce((acc, i) => acc + i.quantity, 0)} items)</p>
              <p className="text-2xl font-display font-bold">{fmt(baseTotal)} <span className="text-sm font-normal text-muted-foreground">/ order</span></p>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <button 
                onClick={() => handleSubscribe('monthly')}
                className="hidden sm:flex h-12 items-center px-6 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-colors"
              >
                Subscribe Monthly ({fmt(baseTotal * 4)})
              </button>
              <button 
                onClick={() => handleSubscribe('weekly')}
                className="h-12 flex items-center px-6 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 gap-2 group"
              >
                Subscribe Weekly
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
