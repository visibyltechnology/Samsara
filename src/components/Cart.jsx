import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const formatPrice = (n) => `₦${n.toLocaleString()}`;

const Cart = ({ onCheckout }) => {
  const { cart, cartOpen, setCartOpen, cartTotal, updateQty, removeFromCart, cartCount } = useApp();

  if (!cartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer">
        <div className="cart-header">
          <h2 className="cart-title">
            <ShoppingBag size={20} /> Your Cart
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </h2>
          <button className="cart-close" onClick={() => setCartOpen(false)}><X size={20} /></button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                    <div className="cart-qty-controls">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}><Minus size={14} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                  <button className="cart-remove" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Total</span>
                <span className="cart-total-amount">{formatPrice(cartTotal)}</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={onCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default Cart;
