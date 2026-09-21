import React, { useState } from 'react';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import CheckoutModal from '../components/CheckoutModal';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search } from 'lucide-react';

const Shop = () => {
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section className="shop-page container fade-in">
      {/* Header */}
      <div className="shop-header">
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2.5rem', color: 'var(--text-dark)' }}>
            Fresh Groceries
          </h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '0.5rem' }}>
            Farm-to-door delivery every day
          </p>
        </div>
        <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      {/* Search bar */}
      <div className="search-wrap">
        <Search size={18} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search groceries…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category filters */}
      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <p className="empty-state">No products found.</p>
      ) : (
        <div className="products-grid">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Checkout modal */}
      {isCartOpen && <CheckoutModal onClose={() => setIsCartOpen(false)} />}
    </section>
  );
};

export default Shop;
