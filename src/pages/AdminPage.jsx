import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Users, ShoppingCart, CheckCircle, Clock, CheckCircle2, ChevronDown, ChevronUp, Package, PauseCircle, XCircle, RefreshCw, Plus, Trash2, Edit2 } from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('orders'); // 'whitelist' or 'orders'

  const [users, setUsers] = useState([]);
  const [whitelistQuery, setWhitelistQuery] = useState('');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [adminSubs, setAdminSubs] = useState([]);
  const [adminSubsLoading, setAdminSubsLoading] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [bundleForm, setBundleForm] = useState({ name: '', description: '', image_url: '', weekly_price: '', monthly_price: '', is_active: true });
  const [editingBundle, setEditingBundle] = useState(null);
  const [bundleModal, setBundleModal] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      // Grant admin access to the specific email
      if (session.user.email === 'samsarachoice1@gmail.com') {
        setIsAdmin(true); 
        fetchUsers();
        fetchOrders();
        fetchAdminSubs();
        fetchBundles();
      } else {
        navigate('/'); // Kick non-admins out
      }
    };
    checkAccess();
  }, [navigate]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    // Join with profiles to get user details
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (full_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching orders:", error);
    setOrders(data || []);
    setOrdersLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert("Failed to update status");
    }
  };

  const fetchAdminSubs = async () => {
    setAdminSubsLoading(true);
    const { data } = await supabase
      .from('subscriptions')
      .select('*, bundles(name), profiles(full_name, email)')
      .order('created_at', { ascending: false });
    setAdminSubs(data || []);
    setAdminSubsLoading(false);
  };

  const fetchBundles = async () => {
    const { data } = await supabase.from('bundles').select('*').order('created_at', { ascending: false });
    setBundles(data || []);
  };

  const saveBundle = async (e) => {
    e.preventDefault();
    const payload = {
      ...bundleForm,
      weekly_price: parseFloat(bundleForm.weekly_price),
      monthly_price: parseFloat(bundleForm.monthly_price),
    };
    if (editingBundle) {
      await supabase.from('bundles').update(payload).eq('id', editingBundle.id);
    } else {
      await supabase.from('bundles').insert([payload]);
    }
    await fetchBundles();
    setBundleModal(false);
    setEditingBundle(null);
    setBundleForm({ name: '', description: '', image_url: '', weekly_price: '', monthly_price: '', is_active: true });
  };

  const deleteBundle = async (id) => {
    if (!window.confirm('Delete this bundle?')) return;
    await supabase.from('bundles').delete().eq('id', id);
    await fetchBundles();
  };

  const updateSubStatus = async (subId, status) => {
    await supabase.from('subscriptions').update({ status }).eq('id', subId);
    await fetchAdminSubs();
  };



  if (loading && !isAdmin) return <div className="container py-20 text-center animate-pulse">Verifying access...</div>;
  if (!isAdmin) return null;

  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n || 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border">Pending</span>;
      case 'pending_confirmation': return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full border border-amber-200">Awaiting Receipt</span>;
      case 'processing': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200">Processing</span>;
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">Completed</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full border border-red-200">Cancelled</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <div className="container py-12 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Sidebar Menu */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`p-4 rounded-xl border text-left font-medium transition-colors ${activeTab === 'orders' ? 'bg-muted border-border text-primary' : 'bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground'}`}
          >
            <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Orders</div>
          </button>
          <button 
            onClick={() => setActiveTab('whitelist')}
            className={`p-4 rounded-xl border text-left font-medium transition-colors ${activeTab === 'whitelist' ? 'bg-muted border-border text-primary' : 'bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground'}`}
          >
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Whitelist</div>
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`p-4 rounded-xl border text-left font-medium transition-colors ${activeTab === 'subscriptions' ? 'bg-muted border-border text-primary' : 'bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground'}`}
          >
            <div className="flex items-center gap-2"><Package className="h-4 w-4" /> Subscriptions</div>
          </button>
          <button 
            onClick={() => setActiveTab('bundles')}
            className={`p-4 rounded-xl border text-left font-medium transition-colors ${activeTab === 'bundles' ? 'bg-muted border-border text-primary' : 'bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground'}`}
          >
            <div className="flex items-center gap-2"><Package className="h-4 w-4" /> Bundles</div>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-4">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Order Management
                </h2>
                <button onClick={fetchOrders} className="text-xs bg-muted px-3 py-1.5 rounded-md hover:bg-muted/80">Refresh</button>
              </div>

              {ordersLoading ? (
                <div className="py-10 text-center animate-pulse text-muted-foreground">Loading orders...</div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border rounded-xl bg-background overflow-hidden transition-all">
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-mono text-xs font-bold">{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{order.profiles?.full_name || order.shipping_address?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{order.profiles?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-bold text-sm">{fmt(order.total_amount)}</p>
                            <p className="text-xs text-muted-foreground uppercase">{order.payment_method?.replace('_', ' ')}</p>
                          </div>
                          <div className="w-24 text-right">
                            {getStatusBadge(order.status)}
                          </div>
                          {expandedOrder === order.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>

                      {/* Expanded Order Details */}
                      {expandedOrder === order.id && (
                        <div className="p-4 bg-muted/20 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Payment & Status Info */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment Details</h4>
                              <div className="bg-card border rounded-lg p-3 text-sm space-y-2">
                                <div className="flex justify-between"><span>Method</span><span className="font-medium uppercase">{order.payment_method}</span></div>
                                <div className="flex justify-between"><span>Reference</span><span className="font-mono text-xs">{order.payment_reference || 'N/A'}</span></div>
                                
                                {/* Custom Instalment Meta Data Display */}
                                {order.payment_method === 'installment' && order.payment_meta && (
                                  <div className="mt-3 pt-3 border-t space-y-1">
                                    <p className="text-xs font-bold text-green-600 mb-2">Instalment Plan Details</p>
                                    <div className="flex justify-between text-xs"><span>Plan</span><span>{order.payment_meta.plan}</span></div>
                                    <div className="flex justify-between text-xs"><span>Deposit Paid</span><span>{fmt(order.payment_meta.deposit_amount)}</span></div>
                                    <div className="flex justify-between text-xs"><span>Recurring (x{order.payment_meta.duration})</span><span>{fmt(order.payment_meta.recurring_amount)}</span></div>
                                    <div className="flex justify-between text-xs">
                                      <span>Continuous Processing</span>
                                      <span className="font-bold text-primary capitalize">{order.payment_meta.continuous_payment_method}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Admin Actions</h4>
                              <div className="flex gap-2">
                                {order.status === 'pending_confirmation' && (
                                  <button onClick={() => updateOrderStatus(order.id, 'processing')} className="bg-green-500 text-white hover:bg-green-600 px-3 py-1.5 text-xs font-medium rounded">
                                    Confirm Receipt & Process
                                  </button>
                                )}
                                {(order.status === 'pending' || order.status === 'processing') && (
                                  <button onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1.5 text-xs font-medium rounded">
                                    Mark Completed
                                  </button>
                                )}
                                {order.status !== 'cancelled' && (
                                  <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="border border-destructive text-destructive hover:bg-destructive/10 px-3 py-1.5 text-xs font-medium rounded">
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Shipping Info */}
                          <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Shipping Address</h4>
                            <div className="bg-card border rounded-lg p-3 text-sm">
                              {order.shipping_address ? (
                                <>
                                  <p className="font-medium">{order.shipping_address.full_name}</p>
                                  <p>{order.shipping_address.phone}</p>
                                  <p className="mt-1">{order.shipping_address.address_line1}</p>
                                  <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                                </>
                              ) : (
                                <p className="text-muted-foreground text-xs">No address provided</p>
                              )}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                  {orders.length === 0 && <div className="text-center py-10 text-muted-foreground border rounded-xl">No orders found.</div>}
                </div>
              )}
            </div>
          )}

          {/* WHITELIST TAB */}
          {activeTab === 'whitelist' && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" /> User Whitelist
                </h2>
                <input
                  type="text"
                  placeholder="Search email..."
                  value={whitelistQuery}
                  onChange={e => setWhitelistQuery(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 text-center">Whitelisted</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.filter(u => u.email?.toLowerCase().includes(whitelistQuery.toLowerCase())).map(user => (
                      <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{user.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3 text-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs font-medium text-destructive hover:underline">
                            Revoke Access
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS TAB */}
          {activeTab === 'subscriptions' && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" /> All Subscriptions
                </h2>
                <button onClick={fetchAdminSubs} className="text-xs bg-muted px-3 py-1.5 rounded-md hover:bg-muted/80 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
              {adminSubsLoading ? (
                <div className="py-10 text-center animate-pulse text-muted-foreground">Loading subscriptions...</div>
              ) : adminSubs.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">No subscriptions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Customer</th>
                        <th className="text-left px-4 py-3 font-semibold">Bundle</th>
                        <th className="text-left px-4 py-3 font-semibold">Frequency</th>
                        <th className="text-left px-4 py-3 font-semibold">Next Billing</th>
                        <th className="text-left px-4 py-3 font-semibold">Status</th>
                        <th className="text-left px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {adminSubs.map(sub => (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{sub.profiles?.full_name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{sub.profiles?.email}</p>
                          </td>
                          <td className="px-4 py-3">{sub.bundles?.name || 'N/A'}</td>
                          <td className="px-4 py-3 capitalize">{sub.frequency}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(sub.next_billing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              sub.status === 'active' ? 'bg-green-100 text-green-700' :
                              sub.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={sub.status}
                              onChange={(e) => updateSubStatus(sub.id, e.target.value)}
                              className="text-xs border rounded px-2 py-1 bg-background"
                            >
                              <option value="active">Active</option>
                              <option value="paused">Paused</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* BUNDLES TAB */}
          {activeTab === 'bundles' && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" /> Bundle Management
                </h2>
                <button
                  onClick={() => { setEditingBundle(null); setBundleForm({ name: '', description: '', image_url: '', weekly_price: '', monthly_price: '', is_active: true }); setBundleModal(true); }}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" /> New Bundle
                </button>
              </div>
              <div className="space-y-3">
                {bundles.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">No bundles yet. Create one!</div>
                ) : bundles.map(bundle => (
                  <div key={bundle.id} className="flex items-center gap-4 p-4 border rounded-xl bg-background hover:bg-muted/20 transition-colors">
                    {bundle.image_url && (
                      <img src={bundle.image_url} alt={bundle.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{bundle.name}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${bundle.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {bundle.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{bundle.description}</p>
                      <p className="text-xs font-medium mt-1">
                        Weekly: {fmt(bundle.weekly_price)} · Monthly: {fmt(bundle.monthly_price)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditingBundle(bundle); setBundleForm({ name: bundle.name, description: bundle.description || '', image_url: bundle.image_url || '', weekly_price: bundle.weekly_price, monthly_price: bundle.monthly_price, is_active: bundle.is_active }); setBundleModal(true); }}
                        className="p-2 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={() => deleteBundle(bundle.id)}
                        className="p-2 rounded-lg border hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bundle Modal */}
      {bundleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-5">{editingBundle ? 'Edit Bundle' : 'Create Bundle'}</h3>
            <form onSubmit={saveBundle} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Bundle Name</label>
                <input required className="w-full h-10 px-3 rounded-md border text-sm bg-background" value={bundleForm.name} onChange={e => setBundleForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-md border text-sm bg-background resize-none" value={bundleForm.description} onChange={e => setBundleForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Image URL</label>
                <input className="w-full h-10 px-3 rounded-md border text-sm bg-background" placeholder="https://..." value={bundleForm.image_url} onChange={e => setBundleForm(f => ({ ...f, image_url: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Weekly Price (₦)</label>
                  <input required type="number" min="0" className="w-full h-10 px-3 rounded-md border text-sm bg-background" value={bundleForm.weekly_price} onChange={e => setBundleForm(f => ({ ...f, weekly_price: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Monthly Price (₦)</label>
                  <input required type="number" min="0" className="w-full h-10 px-3 rounded-md border text-sm bg-background" value={bundleForm.monthly_price} onChange={e => setBundleForm(f => ({ ...f, monthly_price: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={bundleForm.is_active} onChange={e => setBundleForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
                <label htmlFor="is_active" className="text-sm font-medium">Active (visible to customers)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setBundleModal(false)} className="flex-1 h-10 rounded-lg border font-medium text-sm hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="flex-1 h-10 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors">
                  {editingBundle ? 'Save Changes' : 'Create Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
