import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Mail, Save, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      setUser(session.user);

      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data);
        setName(data.full_name || '');
        setPhone(data.phone || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: name,
      phone: phone,
      updated_at: new Date().toISOString()
    });

    if (error) setMessage(`Error: ${error.message}`);
    else setMessage('Profile updated successfully!');
    setSaving(false);
  };

  if (loading) return <div className="container py-20 text-center animate-pulse">Loading profile...</div>;

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-display font-bold mb-8">My Profile</h1>
      
      <div className="bg-card border rounded-2xl p-8 shadow-sm">
        {message && (
          <div className={`p-3 rounded-md flex items-center gap-2 text-sm mb-6 ${message.startsWith('Error') ? 'bg-destructive/15 text-destructive' : 'bg-green-500/15 text-green-600'}`}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address (Cannot be changed)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                disabled
                className="w-full h-11 pl-10 pr-4 rounded-md border bg-muted text-muted-foreground cursor-not-allowed"
                value={user?.email || ''}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                className="w-full h-11 pl-10 pr-4 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="text"
              className="w-full h-11 px-4 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="+234..."
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
