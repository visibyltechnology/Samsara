import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Minus, Plus, Trash2, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

  if (cartItems.length === 0) {
    return (
      <div className="container py-12 max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-8">Your Cart</h1>
        <div className="bg-card border rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md text-sm">
            Looks like you haven't added anything yet. Browse our categories and find fresh groceries!
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-md font-medium transition-colors">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const shipping = cartTotal >= 50000 ? 0 : 2000;
  const total = cartTotal + shipping;

  return (
    <div className="container py-12 max-w-5xl">
      <h1 className="text-3xl font-display font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cartItems.map(item => {
            const product = item.product;
            if (!product) return null;
            const itemPrice = fmt(product.price * item.quantity);
            return (
              <div key={item.id} className="bg-card border rounded-xl p-4 flex gap-4 shadow-sm">
                <Link to={`/product/${product.slug || product.id}`} className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    : <Package className="h-8 w-8 m-6 text-muted-foreground" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.slug || product.id}`}>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-primary font-bold mt-1">{fmt(product.price)} <span className="text-muted-foreground font-normal text-xs">each</span></p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-md">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors rounded-l-md">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors rounded-r-md">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{itemPrice}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive transition-colors self-start mt-2 underline">
            Clear cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{fmt(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">Free shipping on orders over ₦50,000</p>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{fmt(total)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/shop" className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
