import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, Ticket, Star,
  Mail, MapPin, Award, ShoppingBag, Share2, Settings, ChevronLeft,
  ChevronRight, Shield, Menu, X
} from 'lucide-react';

// Admin sub-pages
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminCategories from './admin/AdminCategories';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';
import AdminCoupons from './admin/AdminCoupons';
import AdminReviews from './admin/AdminReviews';
import AdminNewsletter from './admin/AdminNewsletter';
import AdminDeliveryZones from './admin/AdminDeliveryZones';
import AdminLoyalty from './admin/AdminLoyalty';
import AdminAbandonedCarts from './admin/AdminAbandonedCarts';
import AdminReferrals from './admin/AdminReferrals';
import AdminSettings from './admin/AdminSettings';
import AdminSubscriptions from './admin/AdminSubscriptions';

const ADMIN_EMAILS = ['samsarachoice1@gmail.com', 'macchristar.ng@gmail.com'];

const NAV_ITEMS = [
  { path: '/admin', end: true,                   icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products',                      icon: Package,         label: 'Products' },
  { path: '/admin/categories',                    icon: Tag,             label: 'Categories' },
  { path: '/admin/orders',                        icon: ShoppingCart,    label: 'Orders' },
  { path: '/admin/users',                         icon: Users,           label: 'Users' },
  { path: '/admin/coupons',                       icon: Ticket,          label: 'Coupons' },
  { path: '/admin/reviews',                       icon: Star,            label: 'Reviews' },
  { path: '/admin/newsletter',                    icon: Mail,            label: 'Newsletter' },
  { path: '/admin/subscriptions',                 icon: Package,         label: 'Subscriptions' },
  { path: '/admin/delivery-zones',               icon: MapPin,          label: 'Delivery Zones' },
  { path: '/admin/loyalty',                       icon: Award,           label: 'Loyalty Points' },
  { path: '/admin/abandoned-carts',              icon: ShoppingBag,     label: 'Abandoned Carts' },
  { path: '/admin/referrals',                     icon: Share2,          label: 'Referrals' },
  { path: '/admin/settings',                      icon: Settings,        label: 'Settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate('/login'); return; }
      if (!ADMIN_EMAILS.includes(session.user.email)) { navigate('/'); return; }
      setIsAdmin(true);
      setLoading(false);
    });
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Shield className="h-10 w-10 text-primary animate-pulse" />
        <p className="text-sm text-slate-400">Verifying admin access...</p>
      </div>
    </div>
  );

  if (!isAdmin) return null;

  const Sidebar = () => (
    <aside className={`
      flex flex-col bg-slate-900 text-white transition-all duration-300 h-full
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700 ${collapsed ? 'justify-center' : ''}`}>
        <Shield className="h-7 w-7 text-primary flex-shrink-0" />
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight">Admin Panel</p>
            <p className="text-xs text-slate-400">Samsarachoice</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {!collapsed && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 mb-2">Store</p>}
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Back to Store */}
      <div className="px-3 pb-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          title={collapsed ? 'Back to Store' : undefined}
        >
          <ChevronLeft className="h-4 w-4 flex-shrink-0" />
          {!collapsed && 'Back to Store'}
        </NavLink>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-xs py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> <span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-slate-800 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">Samsarachoice Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
