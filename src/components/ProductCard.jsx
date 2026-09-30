import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const price = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(product.price);
  const comparePrice = product.compare_at_price
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(product.compare_at_price)
    : null;
  const productUrl = `/product/${product.slug || product.id}`;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    await addToCart(product, qty);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link to={productUrl} className="block relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Leaf className="h-12 w-12 opacity-20" />
          </div>
        )}
        {comparePrice && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            SALE
          </span>
        )}
        <button
          className={`absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-card/90 hover:bg-card transition-colors ${wishlisted ? 'text-red-500' : 'text-muted-foreground'}`}
          onClick={e => { e.preventDefault(); toggleWishlist(product); }}
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500' : ''}`} />
        </button>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {product.categories?.name && (
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{product.categories.name}</p>
        )}
        <Link to={productUrl} className="flex-1">
          <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-primary">{price}</span>
          {comparePrice && <span className="text-xs text-muted-foreground line-through">{comparePrice}</span>}
        </div>

        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center border rounded-md">
            <button
              className="w-8 h-8 flex items-center justify-center hover:bg-accent hover:text-accent-foreground rounded-l-md transition-colors"
              onClick={e => { e.preventDefault(); setQty(q => Math.max(1, q - 1)); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
            </button>
            <span className="w-8 text-center text-sm font-medium">{qty}</span>
            <button
              className="w-8 h-8 flex items-center justify-center hover:bg-accent hover:text-accent-foreground rounded-r-md transition-colors"
              onClick={e => { e.preventDefault(); setQty(q => q + 1); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
          </div>
          <button
            className={`flex-1 h-8 rounded-md text-xs font-medium transition-all ${adding ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            onClick={handleAddToCart}
          >
            {adding ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
