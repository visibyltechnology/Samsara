import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const sectionStyles = {
    padding: '6rem 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  };

  const titleStyles = {
    fontSize: '4rem',
    lineHeight: '1.1',
    marginBottom: '1.5rem',
    color: 'var(--text-dark)',
  };

  const highlightStyles = {
    color: 'var(--primary-green)',
    display: 'block',
  };

  const subtitleStyles = {
    fontSize: '1.25rem',
    color: 'var(--text-gray)',
    maxWidth: '600px',
    margin: '0 auto 2.5rem',
    lineHeight: '1.6',
  };

  return (
    <section style={sectionStyles} className="container fade-in">
      <h1 style={titleStyles} className="heading-serif">
        Fresh Groceries, <br/>
        <span style={highlightStyles}>Delivered Daily</span>
      </h1>
      
      <p style={subtitleStyles}>
        Premium quality groceries at the best prices. Shop from the comfort of your home.
      </p>
      
      <a href="/shop" className="btn btn-primary hover-lift">
        Shop Now <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
      </a>
    </section>
  );
};

export default Hero;
