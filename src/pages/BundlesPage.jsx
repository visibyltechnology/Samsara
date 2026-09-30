import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

const MOCK_BUNDLES = [
  {
    id: 'b1',
    name: 'Family Food Bundle',
    description: 'Perfect for a family of 4. Includes rice, beans, yam, and essential spices.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000',
    weekly_price: 15000,
    monthly_price: 55000,
  },
  {
    id: 'b2',
    name: 'Monthly Essentials Bundle',
    description: 'All your pantry staples for the month. Oil, pasta, tomato paste, and more.',
    image_url: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&q=80&w=1000',
    weekly_price: 12000,
    monthly_price: 45000,
  },
  {
    id: 'b3',
    name: 'African Food Bundle',
    description: 'Authentic African ingredients: Garri, Egusi, Ogbono, Palm Oil, and Stockfish.',
    image_url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=1000',
    weekly_price: 18000,
    monthly_price: 68000,
  },
  {
    id: 'b4',
    name: 'Frozen Food Bundle',
    description: 'Premium cuts of chicken, turkey, beef, and assorted seafood.',
    image_url: 'https://images.unsplash.com/photo-1599427303058-f04cb1a5e1ae?auto=format&fit=crop&q=80&w=1000',
    weekly_price: 20000,
    monthly_price: 75000,
  }
];

export default function BundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        // Fallback to mock data if table doesn't exist yet
        setBundles(MOCK_BUNDLES);
      } else {
        setBundles(data && data.length > 0 ? data : MOCK_BUNDLES);
      }
    } catch (err) {
      setBundles(MOCK_BUNDLES);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  const handleSubscribe = (bundle, frequency) => {
    // Navigate to a special checkout page for subscriptions, passing bundle info via state
    navigate('/subscription-checkout', { 
      state: { 
        bundle, 
        frequency,
        price: frequency === 'weekly' ? bundle.weekly_price : bundle.monthly_price
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">Food Bundle Subscriptions</h1>
          <p className="text-lg text-slate-600">
            Get your essential groceries delivered automatically. Choose a bundle, set your schedule, and never run out of food again.
          </p>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="pt-4 flex gap-2">
                    <div className="h-10 bg-slate-200 rounded flex-1"></div>
                    <div className="h-10 bg-slate-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            bundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
                <div className="h-48 relative">
                  <img 
                    src={bundle.image_url} 
                    alt={bundle.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3" /> Auto-Renew
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{bundle.name}</h3>
                  <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3">
                    {bundle.description}
                  </p>
                  
                  <div className="space-y-3 mt-auto">
                    {/* Weekly Option */}
                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm">Weekly</span>
                        <span className="font-bold text-primary">{fmt(bundle.weekly_price)}</span>
                      </div>
                      <button 
                        onClick={() => handleSubscribe(bundle, 'weekly')}
                        className="w-full h-9 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        Subscribe Weekly <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Monthly Option */}
                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm">Monthly</span>
                        <span className="font-bold text-primary">{fmt(bundle.monthly_price)}</span>
                      </div>
                      <button 
                        onClick={() => handleSubscribe(bundle, 'monthly')}
                        className="w-full h-9 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        Subscribe Monthly <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* How it works */}
        <div className="mt-20 border-t border-slate-200 pt-16">
          <h2 className="text-2xl font-bold text-center mb-10">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-bold mb-2">Choose your bundle</h3>
              <p className="text-sm text-slate-600">Select the food bundle that fits your family's needs and diet.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-bold mb-2">Set frequency</h3>
              <p className="text-sm text-slate-600">Decide if you want deliveries every week or every month.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-bold mb-2">Automatic deliveries</h3>
              <p className="text-sm text-slate-600">We'll automatically charge your card and deliver your fresh food.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
