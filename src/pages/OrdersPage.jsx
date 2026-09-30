import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, ChevronRight, Clock } from 'lucide-react';

const statusColor = {
  pending: 'bg-yellow-500/15 text-yellow-600',
  processing: 'bg-blue-500/15 text-blue-600',
  shipped: 'bg-purple-500/15 text-purple-600',
  delivered: 'bg-green-500/15 text-green-600',
  cancelled: 'bg-destructive/15 text-destructive',
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, image_url))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [navigate]);

  const fmt = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

  if (loading) return <div className="container py-20 text-center animate-pulse">Loading orders...</div>;

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 flex flex-col items-center text-center shadow-sm">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="h-9 w-9 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6 text-sm">You haven't placed any orders yet. Start shopping!</p>
          <Link to="/shop" className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-md font-medium flex items-center gap-2 text-sm transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor[order.status] || statusColor.pending}`}>
                    {order.status || 'Pending'}
                  </span>
                  <span className="font-bold text-sm text-foreground">{fmt(order.total_amount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {order.order_items?.slice(0, 4).map((item, i) => (
                  <div key={i} className="h-12 w-12 rounded-md bg-muted overflow-hidden border">
                    {item.products?.image_url
                      ? <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                      : <Package className="h-5 w-5 m-3 text-muted-foreground" />}
                  </div>
                ))}
                {order.order_items?.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{order.order_items.length - 4} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
