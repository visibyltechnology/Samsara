import React from 'react';

const TopBanner = () => {
  const styles = {
    backgroundColor: 'var(--primary-green)',
    color: 'white',
    textAlign: 'center',
    padding: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    letterSpacing: '0.025em'
  };

  return (
    <div style={styles}>
      🚚 Free Shipping on All Orders | Fresh Groceries Delivered Daily
    </div>
  );
};

export default TopBanner;
