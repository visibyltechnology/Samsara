import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingCart, Sun, Moon, LayoutDashboard, Package, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length;
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const dropdownRef = useRef(null);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else { setIsAdmin(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId) => {
    const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    setIsAdmin(!!data);
  };

  // Fetch site settings for logo
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ── Top Banner ─────────────────────────────────────────────────────────── */}
      <div className="bg-primary text-primary-foreground text-xs text-center py-1.5 px-4">
        🚚 Free Shipping on All Orders | Fresh Groceries Delivered Daily
      </div>

      {/* ── Main Navbar ────────────────────────────────────────────────────────── */}
      <div className="bg-card border-b shadow-sm">
        <div className="container flex items-center justify-between gap-4 h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            {settings?.header_logo_url ? (
              <img src={settings.header_logo_url} alt="Logo" className="h-10 object-contain" />
            ) : (
              <h1 className="text-xl md:text-2xl font-display font-bold text-primary">
                Samsara<span className="text-secondary">choice</span>
              </h1>
            )}
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-3 h-10 w-full rounded-md border border-input bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">

            {/* User / Auth */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(p => !p)}
                  className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                    <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                      <User className="h-4 w-4" /> Profile
                    </button>
                    <button onClick={() => { navigate('/orders'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Package className="h-4 w-4" /> My Orders
                    </button>
                    <button onClick={() => { navigate('/wishlist'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Heart className="h-4 w-4" /> Wishlist
                    </button>
                    {isAdmin && (
                      <>
                        <div className="my-1 border-t border-border" />
                        <button onClick={() => { navigate('/admin'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                          <LayoutDashboard className="h-4 w-4" /> Admin Panel
                        </button>
                      </>
                    )}
                    <div className="my-1 border-t border-border" />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-destructive">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              data-testid="wishlist-icon"
              className="relative h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              data-testid="cart-icon"
              className="relative h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-medium text-secondary-foreground" style={{ backgroundColor: 'hsl(42 100% 50%)' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(p => !p)}
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

          </div>
        </div>
      {/* ── Green Secondary Nav (Home / Shop All) ─────────────────────── */}
      </div>
      <div className="hidden md:block bg-primary">
        <div className="container flex items-center gap-6 h-10">
          <Link
            to="/"
            className="text-sm font-medium transition-colors"
            style={{ color: 'hsl(0 0% 100% / 0.9)' }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = 'hsl(0 0% 100% / 0.9)'}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className="text-sm font-medium transition-colors"
            style={{ color: 'hsl(0 0% 100% / 0.9)' }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = 'hsl(0 0% 100% / 0.9)'}
          >
            Shop All
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
