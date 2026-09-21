import React from 'react';
import { ShoppingCart, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const formatPrice = (n) => `₦${n.toLocaleString()}`;

const ProductCard = ({ product }) => {
  const { addToCart, setCartOpen } = useApp();

  const handleBuyNow = () => {
    if (!product.inStock) return;
    if (!window.Korapay) return alert('Payment loading, please try again in a moment.');
    window.Korapay.initialize({
      key: 'pk_live_ZEMDixqt5DcwbTVE35hR5rouew2LPu3UXPsWRNnG',
      reference: `samsara_${Date.now()}`,
      amount: product.price,
      currency: 'NGN',
      customer: { name: 'Guest', email: 'guest@samsarachoice.com' },
      onSuccess: () => alert('Payment successful! Thank you.'),
      onClose: () => {},
    });
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product);
    setCartOpen(true);
  };

  return (
    <div className="product-card hover-lift">
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" />
        {product.badge && (
          <span className={`product-badge ${product.badge === 'Out of Stock' ? 'badge-oos' : 'badge-default'}`}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <div className="product-actions">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="btn btn-outline-green"
              title="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="btn btn-primary"
            >
              <Zap size={14} style={{ marginRight: '0.35rem' }} />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
