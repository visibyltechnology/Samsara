import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Check, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';

/* ─── Klump placeholder integration ─── */
const KLUMP_PUBLIC_KEY = 'pk_klump_PLACEHOLDER_KEY';

const loadKlumpScript = () =>
  new Promise((resolve) => {
    if (window.Klump) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://js.useklump.com/klump.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

/* ─── Subscription Modal ─── */
const SubscriptionModal = ({ item, onConfirm, onDecline, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box sub-modal" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}><X size={18} /></button>
      <div className="sub-modal-icon"><RefreshCw size={28} /></div>
      <h3>Subscribe for Monthly Delivery?</h3>
      <p>
        Get <strong>{item.name}</strong> delivered every month automatically.
        No hassle — cancel anytime.
      </p>
      <div className="sub-modal-actions">
        <button className="btn btn-primary" onClick={onConfirm}>
          <Check size={16} /> Yes, Subscribe
        </button>
        <button className="btn btn-outline" onClick={onDecline}>
          Just this once
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Checkout Modal ─── */
const CheckoutModal = ({ onClose }) => {
  const { cart, savedItems, toggleSubscribe, saveForLater, moveToCart, removeSaved, updateQty, cartTotal, cartCount } = useCart();
  const [subPrompt, setSubPrompt] = useState(null); // item awaiting sub choice
  const [step, setStep] = useState('cart'); // 'cart' | 'payment'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('korapay');
  const [klumpReady, setKlumpReady] = useState(false);
  const [paying, setPaying] = useState(false);

  // Load Klump script on mount
  useEffect(() => {
    loadKlumpScript().then(ok => setKlumpReady(ok));
  }, []);

  // When user clicks checkout → check for items needing sub prompts
  const handleCheckout = () => {
    const firstUnanswered = cart.find(i => i.subscribe === false && i._subAsked !== true);
    if (firstUnanswered) {
      setSubPrompt(firstUnanswered);
    } else {
      setStep('payment');
    }
  };

  const handleSubConfirm = () => {
    toggleSubscribe(subPrompt.id, true);
    advanceSubPrompt();
  };

  const handleSubDecline = () => {
    // mark as asked so we don't prompt again
    toggleSubscribe(subPrompt.id, false);
    advanceSubPrompt();
  };

  const advanceSubPrompt = () => {
    const remaining = cart.filter(
      i => i.id !== subPrompt.id && i.subscribe === false && i._subAsked !== true
    );
    if (remaining.length > 0) {
      setSubPrompt(remaining[0]);
    } else {
      setSubPrompt(null);
      setStep('payment');
    }
  };

  /* ─── Payment handlers ─── */
  const payWithKorapay = () => {
    if (!window.Korapay) return alert('Korapay is not loaded yet. Please try again.');
    setPaying(true);
    window.Korapay.initialize({
      key: 'pk_live_ZEMDixqt5DcwbTVE35hR5rouew2LPu3UXPsWRNnG',
      reference: `samsara_${Date.now()}`,
      amount: cartTotal,
      currency: 'NGN',
      customer: { name, email },
      onClose: () => setPaying(false),
      onSuccess: (data) => {
        setPaying(false);
        alert(`✅ Payment successful! Ref: ${data.reference}`);
        onClose();
      },
    });
  };

  const payWithKlump = () => {
    if (!klumpReady || !window.Klump) return alert('Klump is not loaded yet. Please try again.');
    setPaying(true);
    const klump = new window.Klump({
      publicKey: KLUMP_PUBLIC_KEY,
      data: {
        amount: cartTotal,
        shipping_fee: 0,
        currency: 'NGN',
        merchant_reference: `samsara_${Date.now()}`,
        meta_data: { customer: name, email },
        items: cart.map(i => ({
          image_url: i.image,
          item_url: window.location.href,
          name: i.name,
          unit_price: i.price,
          quantity: i.qty,
        })),
      },
      onSuccess: () => {
        setPaying(false);
        alert('✅ Klump payment successful!');
        onClose();
      },
      onError: () => {
        setPaying(false);
        alert('❌ Klump payment failed. Please try again.');
      },
      onClose: () => setPaying(false),
    });
    klump.setup();
  };

  const handlePay = () => {
    if (!name || !email) return alert('Please fill in your name and email.');
    if (method === 'korapay') payWithKorapay();
    else payWithKlump();
  };

  return (
    <>
      {subPrompt && (
        <SubscriptionModal
          item={subPrompt}
          onConfirm={handleSubConfirm}
          onDecline={handleSubDecline}
          onClose={() => { setSubPrompt(null); setStep('payment'); }}
        />
      )}

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box checkout-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{step === 'cart' ? `Your Cart (${cartCount})` : 'Payment Details'}</h2>
            <button className="modal-close" onClick={onClose}><X size={20} /></button>
          </div>

          {/* ─ CART STEP ─ */}
          {step === 'cart' && (
            <>
              {cart.length === 0 && (
                <p className="empty-state">Your cart is empty. Add some groceries!</p>
              )}

              <div className="cart-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-price">₦{(item.price * item.qty).toLocaleString()}</p>
                      {item.subscribe && (
                        <span className="sub-tag"><RefreshCw size={11} /> Monthly</span>
                      )}
                    </div>
                    <div className="cart-item-actions">
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      <button className="save-later-btn" onClick={() => saveForLater(item.id)} title="Save for later">
                        💾
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Saved for later */}
              {savedItems.length > 0 && (
                <div className="saved-section">
                  <h4>Saved for Later</h4>
                  {savedItems.map(item => (
                    <div key={item.id} className="cart-item saved-item">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-price">₦{item.price.toLocaleString()}</p>
                      </div>
                      <div className="cart-item-actions">
                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => moveToCart(item.id)}>Move to Cart</button>
                        <button className="qty-btn" onClick={() => removeSaved(item.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>₦{cartTotal.toLocaleString()}</strong>
                  </div>
                  <button className="btn btn-primary full-btn hover-lift" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─ PAYMENT STEP ─ */}
          {step === 'payment' && (
            <div className="payment-form">
              <div className="form-group">
                <label>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="form-input" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="form-input" />
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 000 000 0000" className="form-input" />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-methods">
                  <label className={`method-option ${method === 'korapay' ? 'selected' : ''}`}>
                    <input type="radio" value="korapay" checked={method === 'korapay'} onChange={() => setMethod('korapay')} />
                    <span>💳 Korapay</span>
                    <small>Card, Bank Transfer, USSD</small>
                  </label>
                  <label className={`method-option ${method === 'klump' ? 'selected' : ''}`}>
                    <input type="radio" value="klump" checked={method === 'klump'} onChange={() => setMethod('klump')} />
                    <span>📦 Klump</span>
                    <small>Buy Now, Pay Later (4 instalments)</small>
                  </label>
                </div>
              </div>

              {/* Order summary */}
              <div className="order-summary">
                {cart.map(i => (
                  <div key={i.id} className="summary-line">
                    <span>{i.name} × {i.qty}{i.subscribe ? ' 🔄' : ''}</span>
                    <span>₦{(i.price * i.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div className="summary-total">
                  <strong>Total</strong>
                  <strong>₦{cartTotal.toLocaleString()}</strong>
                </div>
              </div>

              <div className="payment-actions">
                <button className="btn btn-outline" onClick={() => setStep('cart')}>← Back</button>
                <button className="btn btn-primary hover-lift" onClick={handlePay} disabled={paying}>
                  {paying ? <><Loader size={16} className="spin" /> Processing…</> : `Pay ₦${cartTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;
