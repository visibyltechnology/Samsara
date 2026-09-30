import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Package, Calendar, Clock, CheckCircle2, PauseCircle, XCircle,
  RefreshCw, ChevronRight, AlertCircle, CreditCard, History
} from 'lucide-react';

const statusStyles = {
  active:    { bg: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="h-4 w-4" />, label: 'Active' },
  paused:    { bg: 'bg-yellow-100 text-yellow-700', icon: <PauseCircle className="h-4 w-4" />, label: 'Paused' },
  cancelled: { bg: 'bg-red-100 text-red-700',      icon: <XCircle className="h-4 w-4" />,    label: 'Cancelled' },
};

const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function SubscriptionDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [confirmModal, setConfirmModal] = useState(null); // { subId, action }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      setUser(session.user);
      await Promise.all([fetchSubscriptions(session.user.id), fetchHistory(session.user.id)]);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const fetchSubscriptions = async (userId) => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*, bundles(name, image_url, weekly_price, monthly_price)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setSubscriptions(data || []);
  };

  const fetchHistory = async (userId) => {
    const { data } = await supabase
      .from('subscription_history')
      .select('*, subscriptions!inner(user_id, bundle_id, bundles(name))')
      .eq('subscriptions.user_id', userId)
      .order('payment_date', { ascending: false })
      .limit(20);
    setHistory(data || []);
  };

  const handleAction = async (subId, action) => {
    setActionLoading(subId + action);
    const newStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'cancelled';
    await supabase.from('subscriptions').update({ status: newStatus }).eq('id', subId);
    await fetchSubscriptions(user.id);
    setActionLoading(null);
    setConfirmModal(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-slate-500">Loading your subscriptions...</p>
      </div>
    </div>
  );

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const pausedSubs = subscriptions.filter(s => s.status === 'paused');
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Subscriptions</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your recurring food bundle deliveries</p>
          </div>
          <Link
            to="/bundles"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Package className="h-4 w-4" /> Add Bundle
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
            <p className="text-3xl font-black text-green-600">{activeSubs.length}</p>
            <p className="text-sm text-slate-500 mt-1">Active</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
            <p className="text-3xl font-black text-yellow-500">{pausedSubs.length}</p>
            <p className="text-sm text-slate-500 mt-1">Paused</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
            <p className="text-3xl font-black text-slate-400">{cancelledSubs.length}</p>
            <p className="text-sm text-slate-500 mt-1">Cancelled</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
          {[
            { id: 'subscriptions', label: 'Subscriptions', icon: <Package className="h-4 w-4" /> },
            { id: 'history', label: 'Payment History', icon: <History className="h-4 w-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
                <p className="text-slate-500 text-sm mb-6">Subscribe to a food bundle and get automatic deliveries.</p>
                <Link to="/bundles" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                  Browse Bundles
                </Link>
              </div>
            ) : (
              subscriptions.map(sub => {
                const bundle = sub.bundles;
                const style = statusStyles[sub.status] || statusStyles.active;
                const price = sub.frequency === 'weekly' ? bundle?.weekly_price : bundle?.monthly_price;

                return (
                  <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex gap-4 p-5">
                      {/* Bundle image */}
                      <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        {bundle?.image_url
                          ? <img src={bundle.image_url} alt={bundle.name} className="w-full h-full object-cover" />
                          : <Package className="m-auto mt-5 h-10 w-10 text-slate-300" />
                        }
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900">{bundle?.name || 'Food Bundle'}</h3>
                            <p className="text-sm text-slate-500 capitalize">{sub.frequency} plan · {fmt(price || 0)}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} flex-shrink-0`}>
                            {style.icon} {style.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Next billing: <strong className="text-slate-700 ml-0.5">{fmtDate(sub.next_billing_date)}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Since: {fmtDate(sub.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {sub.status !== 'cancelled' && (
                      <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-3">
                        {sub.status === 'active' ? (
                          <button
                            onClick={() => setConfirmModal({ subId: sub.id, action: 'pause', label: 'Pause' })}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 text-sm text-yellow-600 font-medium hover:underline"
                          >
                            <PauseCircle className="h-4 w-4" /> Pause
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(sub.id, 'resume')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 text-sm text-green-600 font-medium hover:underline"
                          >
                            <RefreshCw className="h-4 w-4" /> Resume
                          </button>
                        )}
                        <span className="text-slate-200">|</span>
                        <button
                          onClick={() => setConfirmModal({ subId: sub.id, action: 'cancel', label: 'Cancel' })}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 text-sm text-red-500 font-medium hover:underline"
                        >
                          <XCircle className="h-4 w-4" /> Cancel Subscription
                        </button>
                        <span className="ml-auto">
                          <Link to="/bundles" className="flex items-center gap-1 text-xs text-primary hover:underline">
                            Change bundle <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {history.length === 0 ? (
              <div className="p-12 text-center">
                <History className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No payment history yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Bundle</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Amount</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Date</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {h.subscriptions?.bundles?.name || 'Bundle'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-primary">{fmt(h.amount)}</td>
                      <td className="px-5 py-3.5 text-slate-500">{fmtDate(h.payment_date)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          h.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {h.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">
              {confirmModal.action === 'cancel' ? 'Cancel Subscription?' : 'Pause Subscription?'}
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              {confirmModal.action === 'cancel'
                ? 'This will stop all future deliveries and charges. This action cannot be undone.'
                : 'Your subscription will be paused and no charges will be made until you resume.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => handleAction(confirmModal.subId, confirmModal.action)}
                disabled={!!actionLoading}
                className={`flex-1 h-11 rounded-xl font-medium text-white transition-colors ${
                  confirmModal.action === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                {actionLoading ? 'Please wait...' : confirmModal.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
