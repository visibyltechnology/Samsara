import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Moon, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = ({ onCartClick }) => {
  const { cartCount, user, logout } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navStyles = {
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoStyles = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--primary-green)',
    textDecoration: 'none',
    letterSpacing: '-0.025em',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass" style={navStyles}>
      <div className="container" style={containerStyles}>
        <Link to="/" style={logoStyles} className="heading-serif">
          Samsarachoice
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          {user && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn-icon" onClick={handleLogout} title="Logout">
                <User size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              Sign In
            </Link>
          )}

          <button className="btn-icon cart-icon-wrap" onClick={onCartClick} title="Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button className="btn-icon mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu container">
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Shop</Link>
          {user && <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {!user && <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sign In</Link>}
          {user && <button className="mobile-nav-link" onClick={handleLogout}>Logout</button>}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
