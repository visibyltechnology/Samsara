import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const features = [
  { icon: <Truck size={24} />, title: 'Free Delivery', desc: 'On all orders above ₦5,000' },
  { icon: <Shield size={24} />, title: 'Quality Guaranteed', desc: 'Fresh produce, always' },
  { icon: <Clock size={24} />, title: 'Same-Day Delivery', desc: 'Order before 2pm' },
  { icon: <Star size={24} />, title: 'Top Rated', desc: '4.9/5 from 500+ customers' },
];

const Home = () => {
  const featured = products.filter(p => p.inStock).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="hero-section container fade-in">
        <div className="hero-content">
          <span className="hero-tag">🌿 Farm to Doorstep</span>
          <h1 className="hero-title heading-serif">
            Fresh Groceries,<br />
            <span className="hero-highlight">Delivered Daily</span>
          </h1>
          <p className="hero-subtitle">
            Premium quality groceries at the best prices. Shop from the comfort of your home and get fresh produce delivered to your door.
          </p>
          <div className="hero-cta">
            <Link to="/shop" className="btn btn-primary hover-lift">
              Shop Now <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link to="/shop" className="btn btn-ghost hover-lift">
              Browse Categories
            </Link>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
            alt="Fresh groceries"
            className="hero-image"
          />
          <div className="hero-image-badge">
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span>4.9 — 500+ happy customers</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass hover-lift">
              <div className="feature-icon">{f.icon}</div>
              <div>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title heading-serif">Featured Products</h2>
          <Link to="/shop" className="section-link">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="products-grid">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="sub-banner container">
        <div className="sub-banner-inner glass">
          <div>
            <h3 className="sub-banner-title heading-serif">Never Run Out of Essentials</h3>
            <p className="sub-banner-desc">Subscribe monthly and save — fresh groceries, auto-delivered.</p>
          </div>
          <Link to="/shop" className="btn btn-primary hover-lift">
            Subscribe — ₦5,000/mo
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
