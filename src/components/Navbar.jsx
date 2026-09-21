import React from 'react';
import { User, Heart, ShoppingCart, Moon, Menu } from 'lucide-react';

const Navbar = () => {
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

  return (
    <nav className="glass" style={navStyles}>
      <div className="container" style={containerStyles}>
        <a href="/" style={logoStyles} className="heading-serif">
          Samsarachoice
        </a>
        
        <div style={iconContainerStyles}>
          <User size={20} style={iconStyles} className="hover-lift" />
          <Heart size={20} style={iconStyles} className="hover-lift" />
          <ShoppingCart size={20} style={iconStyles} className="hover-lift" />
          <Moon size={20} style={iconStyles} className="hover-lift" />
          <Menu size={20} style={iconStyles} className="hover-lift" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
