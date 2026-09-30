import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Package, Users, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n || 0);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSales: 0, orders: 0, products: 0, customers: 0 });
  const [pendingOrders, setPendingOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, productsRes, customersRes, recentRes] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status, created_at'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount, status, created_at, shipping_address').order('created_at', { ascending: false }).limit(8),
      ]);

      const orders = ordersRes.data || [];
      const totalSales = orders.filter(o => ['processing','completed','shipped','delivered'].includes(o.status)).reduce((s, o) => s + (o.total_amount || 0), 0);
      const pending = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

      setStats({
        totalSales,
        orders: orders.length,
        products: productsRes.count || 0,
        customers: customersRes.count || 0,
      });
      setPendingOrders(pending);
      setRecentOrders(recentRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const statusColors = {
    pending:    'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped:    'bg-purple-100 text-purple-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
    completed:  'bg-green-100 text-green-700',
  };

  const statCards = [
    { label: 'Total Sales', value: fmt(stats.totalSales), icon: TrendingUp, color: 'bg-green-500', change: '+12%' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-blue-500', change: `${pendingOrders} pending` },
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-orange-500', change: 'in store' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'bg-purple-500', change: 'registered' },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-800 rounded-2xl border" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alert for pending */}
      {pendingOrders > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">{pendingOrders} order{pendingOrders > 1 ? 's' : ''} pending processing</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-slate-400">{card.change}</span>
            </div>
            <p className="text-2xl font-black text-white">{card.value}</p>
            <p className="text-sm text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="font-bold text-white">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-300">Order ID</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-300">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-300">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-300">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-900 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-200">#{order.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-5 py-3.5 text-slate-200">{order.shipping_address?.full_name || 'N/A'}</td>
                  <td className="px-5 py-3.5 font-bold text-primary">{fmt(order.total_amount)}</td>
                  <td className="px-5 py-3.5 text-slate-400">{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
