import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, CheckCircle, UserCircle } from 'lucide-react';

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mc3B0ZGtneGVteHpueWV2amR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDYxNjM2OCwiZXhwIjoyMTA2MTkyMzY4fQ.EhgujpFN1pclEuKfVsRJaHY1aO7ABhocpLsu5-XIuLM';
const SUPABASE_URL = 'https://nfsptdkgxemxznyevjdz.supabase.co';
const ADMIN_EMAILS = ['samsarachoice1@gmail.com', 'macchristar.ng@gmail.com'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all auth users via admin API
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=200`, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      const data = await res.json();
      setUsers(data.users || []);

      // Fetch profiles to get extra info
      const { data: profileData } = await supabase.from('profiles').select('*');
      const profileMap = {};
      (profileData || []).forEach(p => { profileMap[p.id] = p; });
      setProfiles(profileMap);

      // Fetch order counts per user
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id');
      const orderMap = {};
      (orderData || []).forEach(o => {
        orderMap[o.user_id] = (orderMap[o.user_id] || 0) + 1;
      });
      setOrders(orderMap);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
    setLoading(false);
  };

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (profiles[u.id]?.full_name || u.user_metadata?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> All Users
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} registered accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-300">User</th>
                  <th className="px-5 py-3 font-semibold text-slate-300">Email</th>
                  <th className="px-5 py-3 font-semibold text-slate-300 text-center">Orders</th>
                  <th className="px-5 py-3 font-semibold text-slate-300 text-center">Joined</th>
                  <th className="px-5 py-3 font-semibold text-slate-300 text-center">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map(user => {
                  const profile = profiles[user.id];
                  const name = profile?.full_name || user.user_metadata?.full_name || '';
                  const isAdmin = ADMIN_EMAILS.includes(user.email);
                  const orderCount = orders[user.id] || 0;
                  const joined = new Date(user.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' });
                  return (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {(name || user.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">{name || <span className="text-slate-500 italic">No name</span>}</p>
                            {profile?.phone && <p className="text-xs text-slate-500">{profile.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{user.email}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">
                          {orderCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-center text-xs">{joined}</td>
                      <td className="px-5 py-4 text-center">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle className="h-3 w-3" /> Customer
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">No users found.</td>
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
