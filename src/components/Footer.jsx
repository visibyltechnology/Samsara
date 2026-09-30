import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Footer = () => {
  const [settings, setSettings] = useState({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('key,value');
      if (!data) return;
      const s = {};
      data.forEach(r => { try { s[r.key] = JSON.parse(r.value); } catch(e) { s[r.key] = r.value; } });
      setSettings(s);
    };
    fetchSettings();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email: email.trim().toLowerCase(), name: name.trim() || null, is_active: true }, { onConflict: 'email' });
      if (error) throw error;
      setSubscribed(true);
    } catch (err) {
      console.error('Subscribe error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container py-10">
        
        {/* ─── Stay in the loop (Top Box) ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-white/10 rounded-xl p-6">
          <div>
            <h4 className="font-bold text-base mb-1">Stay in the loop</h4>
            <p className="text-sm text-primary-foreground/70">
              Get the latest deals, offers, and updates delivered to your inbox.
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-full">
              {subscribed ? (
                <div className="text-center py-2 bg-white/10 rounded-md border border-white/20">
                  <p className="text-white font-medium text-sm">Thanks for subscribing! 🎉</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/10 border-white/20 text-white"
                      placeholder="Your name (optional)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/10 border-white/20 text-white"
                      placeholder="Enter your email address"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                    <button
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 shrink-0"
                      type="submit"
                      disabled={loading}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      {loading ? '...' : 'Subscribe'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ─── Main Footer Columns ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Social */}
          <div>
            {settings?.header_logo_url ? (
              <img src={settings.header_logo_url} alt="Logo" className="h-10 object-contain mb-3" />
            ) : (
              <h3 className="text-xl font-display font-bold mb-3">
                Samsara<span className="text-secondary">choice</span>
              </h3>
            )}
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              {settings.store_description || 'Fresh groceries delivered to your doorstep. Quality products at the best prices.'}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/cart', 'Cart']].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Customer Service</h4>
            <nav className="flex flex-col gap-2">
              {[
                ['/orders', 'Track Order'],
                ['/profile', 'My Account'],
                ['/address-book', 'Address Book'],
                ['/loyalty', 'Loyalty Points'],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <div className="flex flex-col gap-1 text-sm text-primary-foreground/70">
              <p>{settings.contact_email || 'support@samsarachoice.com'}</p>
              <p>{settings.contact_phone || '+1 (555) 000-0000'}</p>
            </div>
          </div>
        </div>

        {/* ─── Bottom Bar ───────────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Samsarachoice. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
