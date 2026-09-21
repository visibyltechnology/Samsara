import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, CreditCard, CheckCircle, XCircle, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_NAME, SUBSCRIPTION_PRICE } from '../data/products';

const formatPrice = (n) => `₦${n.toLocaleString()}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

const statusColor = { Processing: '#f59e0b', Delivered: '#1b5e3a', Cancelled: '#ef4444' };

const Dashboard = () => {
  const { user, orders, subscription, cancelSubscription, logout } = useApp();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container section">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title heading-serif">My Dashboard</h1>
          <p className="page-subtitle">Welcome back, <strong>{user.name}</strong></p>
        </div>
        <button className="btn btn-ghost" onClick={logout}>Logout</button>
      </div>

      <div className="dashboard-grid">
        {/* Subscription Card */}
        <div className="dash-card glass">
          <div className="dash-card-header">
            <CreditCard size={20} color="var(--primary-green)" />
            <h3 className="dash-card-title">Monthly Subscription</h3>
          </div>

          {subscription?.active ? (
            <div className="sub-active">
              <div className="sub-status">
                <CheckCircle size={20} color="#1b5e3a" />
                <span className="sub-status-text active">Active</span>
              </div>
              <p className="sub-name">{SUBSCRIPTION_NAME}</p>
              <p className="sub-amount">{formatPrice(SUBSCRIPTION_PRICE)}<span>/month</span></p>
              <div className="sub-dates">
                <div>
                  <Calendar size={14} />
                  <span>Started: {formatDate(subscription.startDate)}</span>
                </div>
                <div>
                  <Calendar size={14} />
                  <span>Next billing: {formatDate(subscription.nextBilling)}</span>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={cancelSubscription}>
                Cancel Subscription
              </button>
            </div>
          ) : (
            <div className="sub-inactive">
              <XCircle size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p>No active subscription</p>
              <Link to="/shop" className="btn btn-primary btn-sm">
                Subscribe Now <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat glass">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="dash-stat glass">
            <span className="stat-number">
              {formatPrice(orders.reduce((s, o) => s + (o.amount || 0), 0))}
            </span>
            <span className="stat-label">Total Spent</span>
          </div>
          <div className="dash-stat glass">
            <span className="stat-number">{subscription?.active ? '✓' : '—'}</span>
            <span className="stat-label">Subscribed</span>
          </div>
        </div>

        {/* Orders */}
        <div className="dash-card glass" style={{ gridColumn: '1 / -1' }}>
          <div className="dash-card-header">
            <Package size={20} color="var(--primary-green)" />
            <h3 className="dash-card-title">Order History</h3>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <Package size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p>No orders yet</p>
              <Link to="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Start Shopping <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td>{formatDate(order.date)}</td>
                      <td>{formatPrice(order.amount || 0)}</td>
                      <td>
                        <span className="order-status" style={{ color: statusColor[order.status] }}>
                          ● {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
