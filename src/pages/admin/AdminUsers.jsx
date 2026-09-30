import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const filtered = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> User Whitelist
        </h2>
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
                  <th className="px-5 py-3 font-semibold text-slate-300">Name</th>
                  <th className="px-5 py-3 font-semibold text-slate-300">Email</th>
                  <th className="px-5 py-3 font-semibold text-slate-300 text-center">Access Status</th>
                  <th className="px-5 py-3 font-semibold text-slate-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-200">{user.full_name || 'N/A'}</td>
                    <td className="px-5 py-4 text-slate-400">{user.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle className="h-3 w-3" /> Whitelisted
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-xs font-medium text-red-400 hover:text-red-300 hover:underline transition-colors">
                        Revoke Access
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-slate-400">No users found.</td>
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
