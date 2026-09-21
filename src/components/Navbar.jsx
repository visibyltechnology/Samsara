import React from 'react';
import { User, Heart, ShoppingCart, Moon, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();

  const navStyles = {
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 50,
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

  const navLinksStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  };

  const linkStyles = {
    color: 'var(--text-dark)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  };

  const iconContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  };

  const iconStyles = {
    cursor: 'pointer',
    color: 'var(--text-dark)',
    transition: 'color 0.2s',
  };

  const cartWrapStyles = {
    position: 'relative',
    cursor: 'pointer',
  };

  return (
    <nav className="glass" style={navStyles}>
      <div className="container" style={containerStyles}>
        <a href="/" style={logoStyles} className="heading-serif">
          Samsarachoice
        </a>

        <div style={navLinksStyles}>
          <a href="/" style={linkStyles}>Home</a>
          <a href="/shop" style={linkStyles}>Shop</a>
          <a href="/shop" style={{ ...linkStyles, color: 'var(--primary-green)', fontWeight: '600' }}>Save to Buy</a>
        </div>

        <div style={iconContainerStyles}>
          <User size={20} style={iconStyles} className="hover-lift" />
          <Heart size={20} style={iconStyles} className="hover-lift" />
          <div style={cartWrapStyles} className="hover-lift" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={20} style={iconStyles} />
            {cartCount > 0 && (
              <span className="cart-badge nav-cart-badge">{cartCount}</span>
            )}
          </div>
          <Moon size={20} style={iconStyles} className="hover-lift" />
          <Menu size={20} style={iconStyles} className="hover-lift" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
