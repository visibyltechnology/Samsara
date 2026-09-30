import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Search, Filter, Eye, CheckCircle2, Package, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n || 0);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select(`*, profiles (full_name, email)`)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId, status) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
      case 'processing': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Processing</span>;
      case 'shipped': return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Shipped</span>;
      case 'delivered': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Delivered</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Cancelled</span>;
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  const filtered = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.profiles?.full_name || o.shipping_address?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading orders...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(order => (
              <div key={order.id} className="transition-all hover:bg-slate-50/50">
                <div 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-4"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-sm font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        {order.profiles?.full_name || order.shipping_address?.full_name || 'Guest User'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-14 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-primary">{fmt(order.total_amount)}</p>
                      <p className="text-xs text-slate-500 font-medium uppercase mt-0.5">{order.payment_method?.replace('_', ' ')}</p>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      {expandedOrder === order.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      
                      {/* Customer & Shipping */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Details</h4>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm space-y-2">
                            <p><span className="text-slate-500">Email:</span> <span className="font-medium">{order.profiles?.email || 'N/A'}</span></p>
                            <p><span className="text-slate-500">Phone:</span> <span className="font-medium">{order.shipping_address?.phone || 'N/A'}</span></p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
                            {order.shipping_address ? (
                              <>
                                <p className="font-medium">{order.shipping_address.full_name}</p>
                                <p className="mt-1">{order.shipping_address.address}</p>
                                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                              </>
                            ) : (
                              <p className="text-slate-400 italic">No shipping details</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment & Actions */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Meta</h4>
                          <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-slate-500">Method:</span> <span className="font-bold uppercase">{order.payment_method}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Reference:</span> <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{order.payment_reference || 'N/A'}</span></div>
                            
                            {order.payment_method === 'installment' && order.payment_meta && (
                              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                                <p className="text-xs font-bold text-primary mb-2">Klump Instalment Details</p>
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Plan</span><span className="font-medium">{order.payment_meta.plan}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Deposit Paid</span><span className="font-medium">{fmt(order.payment_meta.deposit_amount)}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-slate-500">Recurring (x{order.payment_meta.duration})</span><span className="font-medium">{fmt(order.payment_meta.recurring_amount)}</span></div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Status</h4>
                          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2">
                            <button onClick={() => updateStatus(order.id, 'processing')} className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">Mark Processing</button>
                            <button onClick={() => updateStatus(order.id, 'shipped')} className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100">Mark Shipped</button>
                            <button onClick={() => updateStatus(order.id, 'delivered')} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">Mark Delivered</button>
                            <button onClick={() => updateStatus(order.id, 'cancelled')} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">Cancel Order</button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {filtered.length === 0 && (
              <div className="p-12 text-center">
                <ShoppingCart className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No orders found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
