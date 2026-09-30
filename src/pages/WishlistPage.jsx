import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="container py-12 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-7 w-7 text-primary fill-primary" />
        <h1 className="text-3xl font-display font-bold">My Wishlist</h1>
        <span className="ml-auto text-sm text-muted-foreground">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-card border rounded-2xl p-16 flex flex-col items-center text-center shadow-sm">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md text-sm">
            Save your favourite products here so you can find them easily later.
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-md font-medium transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistItems.map(item => {
            const product = item.product;
            if (!product) return null;
            const comparePrice = product.compare_at_price ? fmt(product.compare_at_price) : null;
            return (
              <div key={item.id} className="bg-card border rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Link to={`/product/${product.slug || product.id}`}>
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>}
                  </Link>
                  {comparePrice && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">SALE</span>
                  )}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-card/90 hover:bg-destructive/10 text-red-500 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <Link to={`/product/${product.slug || product.id}`}>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors mb-2">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-primary font-bold">{fmt(product.price)}</span>
                    {comparePrice && <span className="text-xs text-muted-foreground line-through">{comparePrice}</span>}
                  </div>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="mt-auto w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
