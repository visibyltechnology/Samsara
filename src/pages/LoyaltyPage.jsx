import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, Gift, ShoppingBag } from 'lucide-react';

const LoyaltyPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const [{ data: p }, { data: h }] = await Promise.all([
        supabase.from('profiles').select('loyalty_points, full_name').eq('id', session.user.id).single(),
        supabase.from('loyalty_transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20),
      ]);

      setProfile(p);
      setHistory(h || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  if (loading) return <div className="container py-20 text-center animate-pulse">Loading loyalty points...</div>;

  const points = profile?.loyalty_points || 0;
  const nairaValue = (points * 10).toLocaleString(); // 1 point = ₦10

  const tiers = [
    { name: 'Bronze', min: 0, max: 499, color: 'bg-orange-700' },
    { name: 'Silver', min: 500, max: 1999, color: 'bg-slate-400' },
    { name: 'Gold', min: 2000, max: 4999, color: 'bg-yellow-500' },
    { name: 'Platinum', min: 5000, max: Infinity, color: 'bg-purple-500' },
  ];
  const currentTier = tiers.find(t => points >= t.min && points <= t.max) || tiers[0];

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-display font-bold mb-8">Loyalty Points</h1>

      {/* Points Card */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
            <span className="text-primary-foreground/70 text-sm font-medium">Your Balance</span>
          </div>
          <p className="text-5xl font-bold mb-1">{points.toLocaleString()}</p>
          <p className="text-primary-foreground/70 text-sm">pts ≈ ₦{nairaValue} value</p>
          <div className="mt-6 flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${currentTier.color}`}>{currentTier.name}</span>
            <span className="text-primary-foreground/70 text-xs">Member</span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <ShoppingBag className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-semibold text-sm mb-1">Earn Points</h3>
          <p className="text-xs text-muted-foreground">Earn 1 point for every ₦100 spent on orders.</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <Gift className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-semibold text-sm mb-1">Redeem Points</h3>
          <p className="text-xs text-muted-foreground">100 points = ₦1,000 off your next order.</p>
        </div>
      </div>

      {/* Tier Progress */}
      <div className="bg-card border rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="font-semibold mb-4">Membership Tiers</h2>
        <div className="flex gap-2">
          {tiers.map(tier => (
            <div key={tier.name} className={`flex-1 rounded-lg p-3 text-center text-white text-xs font-bold ${tier.name === currentTier.name ? tier.color + ' ring-2 ring-offset-2 ring-ring' : 'bg-muted text-muted-foreground'}`}>
              {tier.name}
              <div className="text-[10px] font-normal mt-0.5">
                {tier.max === Infinity ? `${tier.min}+` : `${tier.min}–${tier.max}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Transaction History</h2>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6">No transactions yet. Start shopping to earn points!</p>
        ) : (
          <div className="divide-y divide-border">
            {history.map(tx => (
              <div key={tx.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-medium">{tx.description || 'Points transaction'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-destructive'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPage;
