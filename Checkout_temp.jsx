import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard, MapPin, Truck, ShieldCheck, ChevronRight,
  CheckCircle, Zap, Upload, AlertCircle, Loader2, X
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { uploadReceiptImage } from '../utils/uploadService';
import toast from 'react-hot-toast';

const steps = ['Delivery', 'Payment', 'Review'];

// ── Bank Account Details (Update with real BZ Energy account) ──
const BZ_BANK = {
  bankName: 'Moniepoint',
  accountName: 'BZ ENERGY LIMITED',
  accountNumber: '8083836663',
};

const INSTALLMENT_OPTIONS = [
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 2}_months`,
    label: `${i + 2} Months`,
    type: 'monthly',
    duration: i + 2,
    interestRate: (i + 2) * 0.05,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `${i + 2}_weeks`,
    label: `${i + 2} Weeks`,
    type: 'weekly',
    duration: i + 2,
    interestRate: (i + 2) * 0.015,
  })),
];

// ── Load Klump script once ──
let klumpScriptPromise = null;
function loadKlumpScript() {
  if (klumpScriptPromise) return klumpScriptPromise;
  klumpScriptPromise = new Promise((resolve, reject) => {
    const scriptId = 'klump-js-script';
    if (document.getElementById(scriptId) || window.Klump) { resolve(); return; }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://js.useklump.com/klump.js';
    script.onload = () => resolve();
    script.onerror = () => { klumpScriptPromise = null; reject(new Error('Failed to load Klump script')); };
    document.body.appendChild(script);
  });
  return klumpScriptPromise;
}
function getKlump() {
  try { return (0, eval)('Klump'); } catch { return undefined; }
}

function fmt(n) { return '₦' + Math.ceil(n || 0).toLocaleString('en-NG'); }

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();

  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [klumpOpen, setKlumpOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: 'Delta',
    payMethod: 'bank_transfer',
    installmentPlan: '3_months',
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [activeLegal, setActiveLegal] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState({ terms: false, privacy: false });
  const [finalTotal, setFinalTotal] = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login?redirect=/checkout');
  }, [user, navigate]);

  // Redirect if cart is empty (and not placed)
  useEffect(() => {
    if (items.length === 0 && !placed) navigate('/cart');
  }, [items, placed, navigate]);

  // Push Klump iframes below our cancel button
  useEffect(() => {
    let interval;
    if (klumpOpen) {
      interval = setInterval(() => {
        document.querySelectorAll('iframe[src*="klump"], [id^="klump"]').forEach(el => {
          if (el.style) {
            el.style.setProperty('z-index', '2147483640', 'important');
            if (el.id === 'klump__checkout') {
              el.style.setProperty('position', 'fixed', 'important');
            }
          }
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [klumpOpen]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const [deliveryFees, setDeliveryFees] = useState({});
  const [flatDeliveryFee, setFlatDeliveryFee] = useState(0);

  // Delivery fee = per-state fee if available, else fall back to flat fee
  const delivery = deliveryFees[formData.state] !== undefined
    ? Number(deliveryFees[formData.state])
    : flatDeliveryFee;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const docSnap = await getDoc(doc(db, 'settings', 'site_settings'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.deliveryFees) {
            setDeliveryFees(data.deliveryFees);
          } else if (data.deliveryFee !== undefined) {
            setFlatDeliveryFee(Number(data.deliveryFee));
          }
        }
      } catch (e) {
        console.error("Failed to load delivery fee:", e);
      }
    };
    fetchSettings();
  }, []);

  const subTotal = subtotal + delivery;

  const activePlan = INSTALLMENT_OPTIONS.find(p => p.id === formData.installmentPlan) || INSTALLMENT_OPTIONS[0];
  const installmentInterest = formData.payMethod === 'installment' ? Math.floor(subTotal * activePlan.interestRate) : 0;
  const grandTotal = subTotal + installmentInterest;
  const depositAmount = formData.payMethod === 'installment' ? Math.floor(grandTotal * 0.30) : grandTotal;
  const recurringAmount = formData.payMethod === 'installment' ? Math.floor((grandTotal - depositAmount) / activePlan.duration) : 0;

  const displayTotal = formData.payMethod === 'klump_bnpl' ? subTotal : grandTotal;

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePlaceOrderClick = () => {
    if ((formData.payMethod === 'bank_transfer' || formData.payMethod === 'installment') && !receiptFile) {
      setError('Please upload your payment receipt before placing the order.');
      return;
    }
    if (!termsAccepted.terms || !termsAccepted.privacy) {
      setError('Please read and accept both the Terms & Conditions and Privacy Policy.');
      return;
    }
    setError('');
    if (formData.payMethod === 'klump_bnpl') {
      handleKlumpPayment();
    } else {
      submitOrder();
    }
  };

  const handleKlumpPayment = async () => {
    setLoading(true);
    setKlumpOpen(true);
    setError('');
    try {
      await loadKlumpScript();
      const KlumpCtor = getKlump();
      if (!KlumpCtor) throw new Error('Klump payment service unavailable. Check your connection.');

      new KlumpCtor({
        publicKey: 'klp_pk_5c29eda22c9646e6a87628e1ecd2eaf1ca2cd03fcf5846f5bea14e57a1339d6e',
        data: {
          amount: Math.ceil(subTotal),
          shipping_fee: Math.ceil(delivery),
          currency: 'NGN',
          redirect_url: `${window.location.origin}/profile`,
          merchant_reference: `BZE-${Date.now()}`,
          meta_data: {
            customer: formData.fullName || user?.email || 'Guest',
            email: formData.email || user?.email || '',
          },
          items: items.map(i => ({
            image_url: i.img || i.images?.[0] || '',
            item_url: `${window.location.origin}/shop/${i.id}`,
            name: i.name,
            unit_price: Math.ceil(i.price),
            quantity: i.quantity,
          })),
        },
        onSuccess: (data) => {
          setKlumpOpen(false);
          const klumpRef = data?.data?.reference || `klp-${Date.now()}`;
          submitOrder(klumpRef);
        },
        onError: () => {
          setError('Klump payment failed or was declined. Please try again or use another method.');
          setLoading(false);
          setKlumpOpen(false);
        },
        onLoad: () => {
          // Required by Klump SDK
        },
        onClose: () => {
          setLoading(false);
          setKlumpOpen(false);
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to load Klump. Please check your connection.');
      setLoading(false);
      setKlumpOpen(false);
    }
  };

  const submitOrder = async (klumpRef = null) => {
    setLoading(true);
    setError('');
    try {
      // ── Re-validate stock for every cart item before accepting the order ──
      const outOfStockItems = [];
      await Promise.all(
        items.map(async (item) => {
          try {
            const snap = await getDoc(doc(db, 'products', item.id));
            if (snap.exists()) {
              const data = snap.data();
              const qty = Number(data.quantity ?? data.stock ?? data.items_left ?? 0);
              const isOOS = data.inventory_status === 'out_of_stock' || qty === 0;
              if (isOOS) outOfStockItems.push(item.name);
            }
          } catch {
            // If we can't fetch, we allow the order through (admin will handle it)
          }
        })
      );

      if (outOfStockItems.length > 0) {
        const names = outOfStockItems.join(', ');
        setError(`The following item(s) are now out of stock: ${names}. Please remove them from your cart and try again.`);
        toast.error('Some items are out of stock.');
        setLoading(false);
        return;
      }
      let receiptUrl = '';
      if (receiptFile && formData.payMethod !== 'klump_bnpl') {
        receiptUrl = await uploadReceiptImage(receiptFile);
      }

      const isKlump = formData.payMethod === 'klump_bnpl';
      const orderData = {
        userId: user?.uid || 'guest',
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.state}`,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, img: i.img || '' })),
        subtotal,
        deliveryFee: delivery,
        total: grandTotal,
        installmentInterest,
        payMethod: formData.payMethod,
        installmentPlan: formData.payMethod === 'installment' ? formData.installmentPlan : null,
        installmentInterval: formData.payMethod === 'installment' ? activePlan.type : (isKlump ? 'monthly' : null),
        installmentsTotal: formData.payMethod === 'installment' ? activePlan.duration : (isKlump ? 4 : null),
        depositAmount: formData.payMethod === 'installment' ? depositAmount : (isKlump ? Math.floor(subTotal * 0.25) : null),
        recurringAmount: formData.payMethod === 'installment' ? recurringAmount : null,
        installmentsPaid: (formData.payMethod === 'installment' || isKlump) ? 1 : null,
        installmentReceipts: formData.payMethod === 'installment' ? [] : null,
        status: isKlump ? 'Processing' : 'Pending Verification',
        initialPaymentStatus: isKlump ? 'Paid' : 'Pending',
        receiptUrl,
        klumpReference: klumpRef,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      setFinalTotal(grandTotal);
      clearCart();
      setPlaced(true);
      toast.success('Order placed successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to place order. Please try again.');
      toast.error('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelKlump = () => {
    try {
      const klumpDiv = document.getElementById('klump__checkout');
      if (klumpDiv) klumpDiv.innerHTML = '';
      document.querySelectorAll('[id^="klump"]').forEach(el => {
        if (el.id !== 'klump__checkout') el.remove();
      });
      document.querySelectorAll('iframe[src*="klump"]').forEach(el => el.remove());
      setKlumpOpen(false);
      setLoading(false);
      setError('Klump payment cancelled. Choose another method or try again.');
    } catch {
      window.location.reload();
    }
  };

  // ── Order Placed Success Screen ──
  if (!klumpOpen && placed) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-4">
        <div className="glass-panel p-12 rounded-3xl max-w-md w-full text-center border-brand-eco/30 border-t-2">
          <div className="w-24 h-24 bg-brand-eco/10 border-4 border-brand-eco/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-brand-eco" />
          </div>
          <h1 className="text-3xl font-black text-brand-eco mb-3 tracking-tight">Order Placed!</h1>
          <p className="text-brand-light text-sm mb-2">Thank you for your order. We are currently verifying your payment receipt.</p>
          <p className="text-brand-light/60 text-xs mb-6">You'll be notified once your order is confirmed and processing begins.</p>
          <p className="text-brand-accent font-black text-2xl mb-8">{fmt(finalTotal)}</p>
          <div className="flex gap-3">
            <Link to="/profile" className="btn-eco flex-1 flex items-center justify-center gap-2 text-sm">
              Track Order <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/shop" className="btn-secondary flex-1 flex items-center justify-center text-sm">
              Shop More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      {/* Klump Cancel Portal — always on top */}
      {klumpOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2147483647, display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', pointerEvents: 'none' }}>
          <button
            onClick={cancelKlump}
            style={{ pointerEvents: 'auto', background: '#B30000', color: '#fff', border: 'none', borderRadius: '50px', padding: '12px 22px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <X size={16} /> Cancel Payment
          </button>
        </div>,
        document.body
      )}
      <div id="klump__checkout" style={{ display: klumpOpen ? 'block' : 'none' }}></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-white mb-8 tracking-tight uppercase">Checkout</h1>

        {/* Step Indicator */}
        <div className="flex items-center mb-10 gap-0">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${i <= step ? 'bg-brand-accent text-brand-dark border-brand-accent' : 'bg-brand-primary text-brand-light border-white/10'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-bold ${i === step ? 'text-brand-accent' : 'text-brand-light/50'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${i < step ? 'bg-brand-accent' : 'bg-white/10'}`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Steps Content */}
          <div className="flex-1">
            <div className="glass-panel p-8 rounded-2xl">

              {/* ── STEP 0: DELIVERY ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-black text-white flex items-center gap-3 mb-6">
                    <MapPin className="text-brand-accent" /> Delivery Details
                  </h3>
                  {[
                    ['Full Name', 'fullName', 'text', 'e.g. Hassan Bello'],
                    ['Email Address', 'email', 'email', 'e.g. you@email.com'],
                    ['Phone Number', 'phone', 'tel', 'e.g. 08012345678'],
                    ['Delivery Address', 'address', 'text', 'e.g. 5 Solar Lane, Ikeja'],
                    ['City', 'city', 'text', 'e.g. Lagos'],
                  ].map(([label, key, type, ph]) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-brand-light/70 uppercase tracking-widest mb-2">{label}</label>
                      <input
                        type={type}
                        placeholder={ph}
                        value={formData[key]}
                        onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                        required
                        className="w-full bg-brand-dark border border-white/10 focus:border-brand-accent rounded-xl py-3 px-4 text-white text-sm outline-none transition-all placeholder:text-brand-light/30"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-brand-light/70 uppercase tracking-widest mb-2">State</label>
                    <select
                      value={formData.state}
                      onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                      className="w-full bg-brand-dark border border-white/10 focus:border-brand-accent rounded-xl py-3 px-4 text-white text-sm outline-none"
                    >
                      {['Delta', 'Edo', 'Bayelsa', 'Rivers', 'Anambra'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {delivery > 0 && (
                      <p className="mt-2 text-xs font-bold text-brand-eco flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Delivery to {formData.state}: {fmt(delivery)}
                      </p>
                    )}
                    {delivery === 0 && formData.state && (
                      <p className="mt-2 text-xs font-bold text-brand-accent flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Free delivery to {formData.state}!
                      </p>
                    )}
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={() => {
                      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
                        setError('Please fill in all delivery details.');
                        return;
                      }
                      setError('');
                      setStep(1);
                    }}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                  >
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── STEP 1: PAYMENT METHOD ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-black text-white flex items-center gap-3 mb-6">
                    <CreditCard className="text-brand-accent" /> Payment Method
                  </h3>
                  {[
                    { id: 'bank_transfer', label: 'Direct Bank Transfer', Icon: CreditCard, desc: 'Transfer directly to our BZ Energy bank account & upload receipt' },
                    { id: 'installment', label: 'Save-to-Buy Plan', Icon: Truck, desc: 'Pay 30% deposit now, rest in flexible installments' },
                    { id: 'klump_bnpl', label: 'Klump — Buy Now, Pay Later', Icon: ShieldCheck, desc: 'Instant approval, pay in 4 instalments. No manual receipt needed.' },
                  ].map(({ id, label, Icon, desc }) => (
                    <div
                      key={id}
                      onClick={() => setFormData(p => ({ ...p, payMethod: id }))}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.payMethod === id ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 bg-brand-primary/40 hover:border-white/20'}`}
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${formData.payMethod === id ? 'bg-brand-accent/20' : 'bg-white/5'}`}>
                        <Icon className={`w-5 h-5 ${formData.payMethod === id ? 'text-brand-accent' : 'text-brand-light'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">{label}</div>
                        <div className="text-xs text-brand-light/60 mt-0.5">{desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.payMethod === id ? 'border-brand-accent' : 'border-white/20'}`}>
                        {formData.payMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-brand-accent"></div>}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                    <button onClick={() => setStep(2)} className="btn-primary flex-2 flex items-center justify-center gap-2 flex-1">
                      Review Order <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: REVIEW & PAY ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-white mb-2">Review & Pay</h3>

                  {/* Bank Transfer */}
                  {formData.payMethod === 'bank_transfer' && (
                    <div className="bg-brand-primary/50 border border-brand-accent/30 rounded-xl p-5">
                      <h4 className="font-black text-brand-accent flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5" /> BZ Energy Bank Account
                      </h4>
                      <p className="text-xs text-brand-light mb-4">
                        Transfer exactly <strong className="text-white">{fmt(grandTotal)}</strong> to the account below. Your order ships once we verify your payment.
                      </p>
                      <div className="bg-brand-dark rounded-xl p-4 space-y-3 mb-5 border border-white/5">
                        {[['Bank Name', BZ_BANK.bankName], ['Account Name', BZ_BANK.accountName]].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-brand-light/60 text-sm">{k}</span>
                            <span className="font-bold text-sm">{v}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center">
                          <span className="text-brand-light/60 text-sm">Account Number</span>
                          <span className="font-black text-3xl tracking-[4px] font-mono text-brand-accent">{BZ_BANK.accountNumber}</span>
                        </div>
                      </div>
                      <ReceiptUpload receiptPreview={receiptPreview} onChange={handleReceiptChange} />
                    </div>
                  )}

                  {/* Save-to-Buy / Installment */}
                  {formData.payMethod === 'installment' && (
                    <div className="bg-brand-primary/50 border border-brand-eco/30 rounded-xl p-5">
                      <h4 className="font-black text-brand-eco flex items-center gap-2 mb-4">
                        <Truck className="w-5 h-5" /> Save-to-Buy Plan
                      </h4>
                      <p className="text-xs text-brand-light mb-4">
                        Choose your plan. A <strong className="text-brand-eco">30% upfront deposit</strong> is required before we ship.
                      </p>

                      <div className="mb-4">
                        <label className="block text-xs font-bold text-brand-light/70 uppercase tracking-widest mb-2">Select Duration</label>
                        <select
                          value={formData.installmentPlan}
                          onChange={e => setFormData(p => ({ ...p, installmentPlan: e.target.value }))}
                          className="w-full bg-brand-dark border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none"
                        >
                          <optgroup label="Monthly Plans (5% interest/month)">
                            {INSTALLMENT_OPTIONS.filter(o => o.type === 'monthly').map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label} — {(opt.interestRate * 100).toFixed(0)}% Interest</option>
                            ))}
                          </optgroup>
                          <optgroup label="Weekly Plans (1.5% interest/week)">
                            {INSTALLMENT_OPTIONS.filter(o => o.type === 'weekly').map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label} — {(opt.interestRate * 100).toFixed(0)}% Interest</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div className="bg-brand-dark rounded-xl p-4 space-y-3 mb-4 border border-white/5">
                        {[
                          ['Subtotal', fmt(subtotal), 'text-white'],
                          ...(delivery > 0 ? [['Delivery', fmt(delivery), 'text-brand-light']] : []),
                          ['Interest', `+${fmt(installmentInterest)}`, 'text-yellow-400'],
                          ['Total Payable', fmt(grandTotal), 'text-brand-accent font-black text-lg'],
                          ['Upfront Deposit (30%)', fmt(depositAmount), 'text-brand-eco font-bold'],
                          [`Remaining (${activePlan.duration} payments)`, `${fmt(recurringAmount)} / ${activePlan.type === 'weekly' ? 'wk' : 'mo'}`, 'text-white'],
                        ].map(([k, v, cls]) => (
                          <div key={k} className="flex justify-between items-center">
                            <span className="text-brand-light/60 text-sm">{k}</span>
                            <span className={`text-sm ${cls}`}>{v}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-brand-light/60 mb-4">
                        Transfer your deposit of <strong className="text-brand-eco">{fmt(depositAmount)}</strong> to: <strong className="font-mono text-brand-accent text-base tracking-widest">{BZ_BANK.accountNumber}</strong> ({BZ_BANK.accountName} — {BZ_BANK.bankName})
                      </p>
                      <ReceiptUpload receiptPreview={receiptPreview} onChange={handleReceiptChange} label="Upload Deposit Receipt" />
                    </div>
                  )}

                  {/* Klump BNPL */}
                  {formData.payMethod === 'klump_bnpl' && (
                    <div className="bg-brand-primary/50 border border-brand-accent/30 rounded-xl p-5">
                      <h4 className="font-black text-brand-accent flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-5 h-5" /> Buy Now, Pay Later with Klump
                      </h4>
                      <p className="text-sm text-brand-light mb-4">
                        Pay for your order in easy installments. Klump manages your schedule — your order processes immediately after first payment.
                      </p>
                      <div className="bg-brand-dark rounded-xl p-4 border border-white/5 flex justify-between items-center mb-3">
                        <span className="text-brand-light/60 text-sm">Order Total</span>
                        <span className="font-black text-2xl text-brand-accent">{fmt(subTotal)}</span>
                      </div>
                      <p className="text-xs text-brand-light/50">No manual receipt upload needed. You'll complete payment directly via Klump.</p>
                    </div>
                  )}

                  {/* Terms */}
                  <div className="space-y-3">
                    {[
                      { key: 'terms', text: 'I have read and accept the', link: '/terms', linkText: 'Terms & Conditions' , suffix: 'including the No-Return & No-Refund policy.' },
                      { key: 'privacy', text: 'I have read and accept the', link: '/privacy', linkText: 'Privacy Policy', suffix: 'and consent to data processing under Nigerian NDPR.' },
                    ].map(({ key, text, link, linkText, suffix }) => (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          termsAccepted[key] ? 'border-brand-eco/40 bg-brand-eco/5' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={termsAccepted[key]}
                            onChange={() => setTermsAccepted(p => ({ ...p, [key]: !p[key] }))}
                            className="w-4 h-4 accent-brand-eco cursor-pointer"
                          />
                        </div>
                        <p className="text-sm font-semibold text-white leading-snug">
                          {text}{' '}
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-brand-accent underline hover:text-brand-eco transition-colors" onClick={e => e.stopPropagation()}>
                            {linkText}
                          </a>{' '}
                          {suffix}
                        </p>
                      </label>
                    ))}
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3 text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} disabled={loading} className="btn-secondary flex-1">Back</button>
                    <button onClick={handlePlaceOrderClick} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        : <><Zap className="w-4 h-4" /> {formData.payMethod === 'klump_bnpl' ? 'Pay with Klump' : 'Place Order'} — {fmt(displayTotal)}</>
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="glass-panel p-5 rounded-2xl sticky top-28">
              <h3 className="font-black text-white uppercase tracking-wider mb-4 pb-3 border-b border-white/10">Order Summary</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-12 bg-brand-primary rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.img || item.images?.[0]} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate text-xs leading-snug">{item.name}</div>
                      <div className="text-brand-light/50 text-xs">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-sm text-white flex-shrink-0">{fmt(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-brand-light"><span>Subtotal</span><span className="text-white font-bold">{fmt(subtotal)}</span></div>
                {delivery > 0 && (
                  <div className="flex justify-between text-sm text-brand-light"><span>Delivery</span><span className="text-brand-eco font-bold">{fmt(delivery)}</span></div>
                )}
                {installmentInterest > 0 && (
                  <div className="flex justify-between text-sm text-yellow-400"><span>Interest</span><span className="font-bold">+{fmt(installmentInterest)}</span></div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="font-black text-white">Total</span>
                  <span className="text-xl font-black text-brand-accent">{fmt(displayTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

// ── Receipt Upload Sub-Component ──
function ReceiptUpload({ receiptPreview, onChange, label = 'Upload Payment Receipt' }) {
  return (
    <div>
      <label className="block text-xs font-bold text-brand-light/70 uppercase tracking-widest mb-3">
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="flex items-center gap-3">
        <label className="flex-1 bg-brand-dark border-2 border-dashed border-white/20 hover:border-brand-accent p-4 rounded-xl text-center cursor-pointer transition-all group">
          <Upload className="w-5 h-5 mx-auto mb-2 text-brand-accent group-hover:scale-110 transition-transform" />
          <span className="text-xs text-brand-light/60">Click to upload screenshot</span>
          <input type="file" accept="image/*" onChange={onChange} className="hidden" />
        </label>
        {receiptPreview && (
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
            <img src={receiptPreview} alt="Receipt" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}
