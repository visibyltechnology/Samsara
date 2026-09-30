import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Plus, Trash2, AlertCircle } from 'lucide-react';

const AddressBookPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ label: 'Home', address_line1: '', city: '', state: '', country: 'Nigeria', is_default: false });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      setUserId(session.user.id);
      fetchAddresses(session.user.id);
    };
    init();
  }, [navigate]);

  const fetchAddresses = async (uid) => {
    const { data } = await supabase.from('addresses').select('*').eq('user_id', uid).order('is_default', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('addresses').insert({ ...form, user_id: userId });
    if (err) { setError(err.message); setSaving(false); return; }
    setShowForm(false);
    setForm({ label: 'Home', address_line1: '', city: '', state: '', country: 'Nigeria', is_default: false });
    fetchAddresses(userId);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  if (loading) return <div className="container py-20 text-center animate-pulse">Loading addresses...</div>;

  return (
    <div className="container py-12 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Address Book</h1>
        <button
          onClick={() => setShowForm(p => !p)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Address
        </button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold mb-4">New Address</h2>
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 text-sm mb-4">
              <AlertCircle className="h-4 w-4" />{error}
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Label</label>
                <select className="w-full h-10 px-3 rounded-md border bg-background text-sm" value={form.label} onChange={e => setForm(p => ({...p, label: e.target.value}))}>
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_default} onChange={e => setForm(p => ({...p, is_default: e.target.checked}))} className="h-4 w-4" />
                  Set as default
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Street Address</label>
              <input required className="w-full h-10 px-3 rounded-md border bg-background text-sm" placeholder="123 Main Street" value={form.address_line1} onChange={e => setForm(p => ({...p, address_line1: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <input required className="w-full h-10 px-3 rounded-md border bg-background text-sm" placeholder="Lagos" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">State</label>
                <input required className="w-full h-10 px-3 rounded-md border bg-background text-sm" placeholder="Lagos State" value={form.state} onChange={e => setForm(p => ({...p, state: e.target.value}))} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-md text-sm font-medium transition-colors">
                {saving ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="h-10 px-6 rounded-md text-sm font-medium border hover:bg-muted transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-card border rounded-2xl p-12 flex flex-col items-center text-center shadow-sm">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No saved addresses</h2>
          <p className="text-muted-foreground text-sm">Add your delivery addresses for faster checkout.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-card border rounded-xl p-5 shadow-sm flex justify-between items-start ${addr.is_default ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}>
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{addr.label}</span>
                    {addr.is_default && <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Default</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.address_line1}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state}, {addr.country}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(addr.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBookPage;
