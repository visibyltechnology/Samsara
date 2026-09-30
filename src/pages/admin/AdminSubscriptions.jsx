import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Search, ChevronDown, ChevronUp } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n || 0);

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    setLoading(true);
    const { data } = await supabase.from('subscriptions').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
    setSubscriptions(data || []);
    setLoading(false);
  };

  const updateSubStatus = async (id, status) => {
    await supabase.from('subscriptions').update({ status }).eq('id', id);
    setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status } : s));
  };

  const filtered = subscriptions.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) || 
    (s.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.delivery_address?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Food Subscriptions</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading subscriptions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-300">ID</th>
                  <th className="px-5 py-3 font-semibold text-slate-300">Customer</th>
                  <th className="px-5 py-3 font-semibold text-slate-300">Next Delivery</th>
                  <th className="px-5 py-3 font-semibold text-slate-300">Status</th>
                  <th className="px-5 py-3 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">#{sub.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-200">{sub.profiles?.full_name || sub.delivery_address?.full_name || 'Guest'}</p>
                      <p className="text-xs text-slate-500">{sub.profiles?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {new Date(sub.next_delivery_date).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={\`px-2.5 py-1 rounded-full text-xs font-semibold \${
                        sub.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        sub.status === 'paused' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-slate-700 text-slate-300'
                      }\`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select 
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                        value={sub.status}
                        onChange={(e) => updateSubStatus(sub.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">No subscriptions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
