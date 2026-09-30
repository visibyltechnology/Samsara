import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronRight, Minus, Plus, Heart, Truck, ShieldCheck, Leaf, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      // We assume slug could be id or slug. We try slug first, then id.
      let query = supabase.from('products').select('*, categories(name, slug)').eq('slug', slug).single();
      let { data, error } = await query;
      
      if (error && error.code === 'PGRST116') { // Not found by slug
        query = supabase.from('products').select('*, categories(name, slug)').eq('id', slug).single();
        const res = await query;
        data = res.data;
      }
      
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="container py-20 text-center animate-pulse">Loading product...</div>;
  }

  if (!product) {
    return <div className="container py-20 text-center">Product not found.</div>;
  }

  const price = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(product.price);
  const comparePrice = product.compare_at_price
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(product.compare_at_price)
    : null;

  return (
    <div className="container py-10">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="h-4 w-4" />
        {product.categories && (
          <>
            <Link to={`/shop?category=${product.categories.slug}`} className="hover:text-foreground">
              {product.categories.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-none">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-muted rounded-2xl overflow-hidden aspect-square relative border flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Leaf className="h-32 w-32 text-muted-foreground opacity-20" />
          )}
          {comparePrice && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
              SALE
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {product.categories && (
            <p className="text-sm text-primary font-semibold tracking-wider uppercase mb-2">
              {product.categories.name}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-foreground">{price}</span>
            {comparePrice && <span className="text-lg text-muted-foreground line-through">{comparePrice}</span>}
          </div>

          <div className="prose prose-sm text-muted-foreground mb-8 max-w-none" dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border rounded-md h-12">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              className={`flex-1 h-12 rounded-md font-medium transition-all shadow-sm text-lg flex items-center justify-center gap-2 ${added ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
              onClick={() => {
                addToCart(product, quantity);
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
            >
              {added ? <><CheckCircle className="h-5 w-5" /> Added!</> : 'Add to Cart'}
            </button>
            <button
              className={`w-12 h-12 flex items-center justify-center border rounded-md transition-colors ${isWishlisted(product.id) ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-950' : 'hover:bg-muted text-muted-foreground'}`}
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 pt-8 border-t">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Truck className="h-5 w-5 text-primary" />
              <span>Free delivery on orders over ₦50,000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>100% secure payment with Paystack</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Leaf className="h-5 w-5 text-primary" />
              <span>Fresh, quality products guaranteed</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
