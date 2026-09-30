import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  User, Mail, Save, AlertCircle, LogOut, ShoppingBag,
  MapPin, Gift, RotateCcw, ChevronRight, Phone, Edit2, CheckCircle
} from 'lucide-react';

const ADMIN_EMAILS = ['samsarachoice1@gmail.com', 'macchristar.ng@gmail.com'];
const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n || 0);

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);

  // Stats
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      setUser(session.user);

      // Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        setName(profile.full_name || session.user.user_metadata?.full_name || '');
        setPhone(profile.phone || '');
        setLoyaltyPoints(profile.loyalty_points || 0);
      } else {
        setName(session.user.user_metadata?.full_name || '');
      }

      // Orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (orders) {
        setRecentOrders(orders);
        setOrdersCount(orders.length);
        setTotalSpent(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0));
      }

      setLoading(false);
    };
    fetchAll();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: name, phone, updated_at: new Date().toISOString() });
    if (error) setMessage(`Error: ${error.message}`);
    else { setMessage('Profile updated!'); setEditing(false); }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'text-green-600 bg-green-50';
    if (status === 'processing') return 'text-blue-600 bg-blue-50';
    if (status === 'cancelled') return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  if (loading) return <div className="container py-20 text-center animate-pulse text-slate-400">Loading your profile...</div>;

  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  return (
    <div className="container py-12 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">My Account</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors border rounded-lg px-4 py-2 hover:border-destructive/30">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {(name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate">{name || 'Your Name'}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 mt-1 inline-block">Admin</span>
                )}
              </div>
            </div>

            {!editing ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{user?.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{phone || 'No phone added'}</div>
                <button onClick={() => setEditing(true)} className="mt-4 w-full h-9 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors">
                  <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-3">
                {message && (
                  <div className={`p-2.5 rounded-md flex items-center gap-2 text-xs ${message.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" /> {message}
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium block mb-1">Full Name</label>
                  <input className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Phone Number</label>
                  <input className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 h-9 border rounded-md text-xs font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 h-9 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                    <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            {[
              { to: '/orders', icon: ShoppingBag, label: 'My Orders', sub: `${ordersCount} orders` },
              { to: '/address-book', icon: MapPin, label: 'Address Book', sub: 'Manage delivery addresses' },
              { to: '/loyalty', icon: Gift, label: 'Loyalty Points', sub: `${loyaltyPoints} pts` },
              { to: '/my-subscriptions', icon: RotateCcw, label: 'My Subscriptions', sub: 'Manage recurring orders' },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link key={to} to={to} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors border-b last:border-b-0">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary/5 transition-colors bg-primary/5">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary">Admin Panel</p>
                  <p className="text-xs text-muted-foreground">Manage the store</p>
                </div>
                <ChevronRight className="h-4 w-4 text-primary" />
              </Link>
            )}
          </div>
        </div>

        {/* Right: Stats + Recent Orders */}
        <div className="lg:col-span-2 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Orders', value: ordersCount },
              { label: 'Total Spent', value: fmt(totalSpent) },
              { label: 'Loyalty Points', value: loyaltyPoints },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card border rounded-2xl p-5 shadow-sm text-center">
                <p className="text-2xl font-black text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold">Recent Orders</h2>
              <Link to="/orders" className="text-xs text-primary hover:underline font-medium">View all</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                You haven't placed any orders yet.
                <br />
                <Link to="/shop" className="text-primary hover:underline font-medium">Start shopping</Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map(order => (
                  <Link key={order.id} to="/orders" className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{fmt(order.total_amount)}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
