import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, saveForLater } = useCart();
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleSave = () => {
    setSaved(prev => !prev);
  };

  return (
    <div className="product-card hover-lift">
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          title="Save for later"
        >
          <Heart size={16} fill={saved ? '#1b5e3a' : 'none'} />
        </button>
      </div>

      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <div>
            <span className="product-price">₦{product.price.toLocaleString()}</span>
            <div className="subscribe-hint">
              <RefreshCw size={11} />
              <span>Subscribe & save monthly</span>
            </div>
          </div>
          <button
            className={`btn btn-primary add-btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
          >
            {added ? '✓ Added' : <><ShoppingCart size={15} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
