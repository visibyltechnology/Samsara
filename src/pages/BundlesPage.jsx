import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function BundlesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the custom subscription basket: { productId: quantity }
  const [basket, setBasket] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we landed here from a specific category query, we could pre-select or scroll to it
    fetchBundleData();
  }, [location]);

  const fetchBundleData = async () => {
    try {
      setLoading(true);
      // 1. Fetch categories designated as bundles
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

      // 2. Fetch products that belong to these categories
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

  // Calculate totals
  const selectedProducts = Object.entries(basket).map(([productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return { product, quantity, total: (product?.price || 0) * quantity };
  }).filter(item => item.product);

  const baseTotal = selectedProducts.reduce((sum, item) => sum + item.total, 0);

  const handleSubscribe = (frequency) => {
    if (baseTotal === 0) return;
    
    // Create a dynamic bundle object to pass to checkout
    const customBundle = {
      id: 'custom',
      name: 'Custom Food Subscription',
      description: `Your custom selection of ${selectedProducts.length} items.`,
      image_url: selectedProducts[0]?.product?.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000',
      weekly_price: baseTotal,
      monthly_price: baseTotal * 4,
      items: selectedProducts // We can pass items to checkout for metadata
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
      <div className="min-h-screen bg-slate-50 pt-20 pb-32">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-64 bg-slate-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-32">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">Build Your Subscription</h1>
          <p className="text-lg text-slate-600">
            Select essential food items from our bundle categories to create your own recurring delivery. 
            Fresh food delivered automatically, weekly or monthly!
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No Bundle Categories Found</h3>
            <p className="text-slate-500 mt-2">The admin hasn't designated any categories as food bundles yet.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map(category => {
              const categoryProducts = products.filter(p => p.category_id === category.id);
              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">{category.name}</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map(product => {
                      const quantity = basket[product.id] || 0;
                      return (
                        <div key={product.id} className="border border-slate-200 rounded-xl overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                          <div className="aspect-square relative overflow-hidden bg-slate-100">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1">{product.name}</h3>
                            <p className="text-primary font-bold mt-auto mb-4">{fmt(product.price)}</p>
                            
                            {quantity === 0 ? (
                              <button 
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-full h-10 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                              >
                                Add to Subscription
                              </button>
                            ) : (
                              <div className="flex items-center justify-between border border-slate-200 rounded-lg h-10 px-2 bg-slate-50">
                                <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900">
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-semibold text-slate-900 w-8 text-center">{quantity}</span>
                                <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 flex items-center justify-center rounded bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900">
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

      {/* Floating Subscription Footer */}
      {baseTotal > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 animate-in slide-in-from-bottom-full duration-300">
          <div className="container mx-auto px-4 h-24 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-500 font-medium mb-1">Your Custom Selection ({selectedProducts.reduce((acc, i) => acc + i.quantity, 0)} items)</p>
              <p className="text-2xl font-bold text-slate-900">{fmt(baseTotal)} <span className="text-sm font-normal text-slate-500">/ order</span></p>
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
                className="h-12 flex items-center px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 gap-2"
              >
                Subscribe Weekly
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
