const fs = require('fs');
const path = require('path');

// 1. Update CheckoutPage
const checkoutPath = path.join(__dirname, 'src/pages/CheckoutPage.jsx');
let checkoutCode = fs.readFileSync(checkoutPath, 'utf8');

// Replace COD icon definition in PAYMENT_METHODS
checkoutCode = checkoutCode.replace(
  `  {
    id: 'cod',
    label: 'Cash on Delivery',
    sub: 'Pay at the door',
    desc: 'Have exact cash ready when your order arrives.',
    color: '#ea580c',
    icon: (
      <svg width="28" height="18" viewBox="0 0 80 30" fill="none">
        <rect width="80" height="30" rx="5" fill="#ea580c"/>
        <circle cx="40" cy="15" r="8" stroke="white" strokeWidth="2" fill="none"/>
        <text x="40" y="19" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">₦</text>
      </svg>
    ),
  },`,
  `  {
    id: 'food_subscription',
    label: 'Foodstuffs Subscription',
    sub: 'Weekly or Monthly deliveries',
    desc: 'Subscribe to have your cart items delivered to you regularly.',
    color: '#0284c7', // sky-600
    badge: 'SUBSCRIBE',
    icon: (
      <svg width="28" height="18" viewBox="0 0 80 30" fill="none">
        <rect width="80" height="30" rx="5" fill="#0284c7"/>
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">SUB</text>
      </svg>
    ),
  },`
);

// Add subscription frequency state
checkoutCode = checkoutCode.replace(
  `  // Custom Installment States
  const [installmentPlanId, setInstallmentPlanId] = useState(INSTALLMENT_OPTIONS[0].id);`,
  `  // Custom Installment States
  const [installmentPlanId, setInstallmentPlanId] = useState(INSTALLMENT_OPTIONS[0].id);

  // Subscription States
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('weekly');`
);

// Add subscription UI under payment options
checkoutCode = checkoutCode.replace(
  `              {/* ── Custom Installment Sub-Form ──────────────────────────── */}`,
  `              {/* ── Subscription Frequency Selection ─────────────────────── */}
              {paymentMethod === 'food_subscription' && (
                <div className="mt-4 border border-sky-500/30 bg-sky-500/5 rounded-xl p-5 space-y-5">
                  <div>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-2">Choose Delivery Frequency</label>
                    <div className="flex gap-3">
                      <label className={\`flex-1 p-3 border rounded-lg cursor-pointer flex items-center gap-2 \${subscriptionFrequency === 'weekly' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200'}\`}>
                        <input type="radio" name="freq" value="weekly" checked={subscriptionFrequency === 'weekly'} onChange={() => setSubscriptionFrequency('weekly')} className="hidden" />
                        <span className="font-medium text-sm">Weekly</span>
                      </label>
                      <label className={\`flex-1 p-3 border rounded-lg cursor-pointer flex items-center gap-2 \${subscriptionFrequency === 'monthly' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200'}\`}>
                        <input type="radio" name="freq" value="monthly" checked={subscriptionFrequency === 'monthly'} onChange={() => setSubscriptionFrequency('monthly')} className="hidden" />
                        <span className="font-medium text-sm">Monthly</span>
                      </label>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
                    Your first box will be processed today. Subsequent deliveries will be billed automatically according to your frequency.
                  </div>
                </div>
              )}
              
              {/* ── Custom Installment Sub-Form ──────────────────────────── */}`
);

// Replace handleCOD with handleSubscription
checkoutCode = checkoutCode.replace(
  `  // ── Cash on Delivery ──────────────────────────────────────────────────────
  const handleCOD = async () => {
    setLoading(true);
    try {
      const order = await createOrder('pending');
      await clearCart();
      setOrderId(order.id);
      setOrderPlaced(true);
    } catch (e) { alert(e.message); }
    setLoading(false);
  };`,
  `  // ── Food Subscription ─────────────────────────────────────────────────────
  const handleFoodSubscription = async () => {
    setLoading(true);
    try {
      const meta = { is_subscription: true, frequency: subscriptionFrequency };
      const order = await createOrder('pending', null, meta);
      
      // Initialize Korapay for the first subscription payment
      if (!window.Korapay?.initialize) { alert('Korapay not loaded. Please refresh.'); setLoading(false); return; }

      window.Korapay.initialize({
        key: KORAPAY_PUBLIC_KEY,
        reference: \`samsara_sub_\${order.id}_\${Date.now()}\`,
        amount: grandTotal,
        currency: 'NGN',
        customer: { name: address.full_name, email: user.email },
        onSuccess: function(data) {
          (async () => {
            await supabase.from('orders').update({ 
              status: 'processing', 
              payment_reference: data.reference,
              payment_meta: { ...meta, payment_ref: data.reference }
            }).eq('id', order.id);
            
            // Also insert into subscriptions table for admin tracking
            try {
               await supabase.from('subscriptions').insert({
                 user_id: user.id,
                 status: 'active',
                 delivery_address: address,
                 next_delivery_date: new Date(Date.now() + (subscriptionFrequency === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString(),
                 bundle_id: null // Custom basket
               });
            } catch(err) { console.error("Sub tracking error:", err); }

            await clearCart();
            setOrderId(order.id);
            setOrderPlaced(true);
            setLoading(false);
          })();
        },
        onClose: function() { setLoading(false); },
        onFailed: function() { setLoading(false); alert('Subscription payment failed.'); },
      });
    } catch (e) { alert(e.message); setLoading(false); }
  };`
);

// Update handlePlaceOrder
checkoutCode = checkoutCode.replace(
  `  const handlePlaceOrder = () => {
    if (paymentMethod === 'paystack') handleKorapayNative();
    else if (paymentMethod === 'klump') handleKlumpNative();
    else if (paymentMethod === 'installment') handleCustomInstallment();
    else handleCOD();
  };`,
  `  const handlePlaceOrder = () => {
    if (paymentMethod === 'paystack') handleKorapayNative();
    else if (paymentMethod === 'klump') handleKlumpNative();
    else if (paymentMethod === 'installment') handleCustomInstallment();
    else if (paymentMethod === 'food_subscription') handleFoodSubscription();
  };`
);

// Update success message
checkoutCode = checkoutCode.replace(
  `            {paymentMethod === 'cod'
                ? "Have exact cash ready when your delivery arrives."
                : "Payment confirmed! We'll start preparing your order right away."}`,
  `            {paymentMethod === 'food_subscription'
                ? "Subscription activated! Your first delivery will be prepared right away."
                : "Payment confirmed! We'll start preparing your order right away."}`
);

fs.writeFileSync(checkoutPath, checkoutCode, 'utf8');
console.log("Updated CheckoutPage.jsx");

// 2. Dark Mode for AdminLayout
const layoutPath = path.join(__dirname, 'src/pages/AdminLayout.jsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

layoutCode = layoutCode.replace(/bg-slate-50/g, 'bg-slate-900 text-slate-100');
layoutCode = layoutCode.replace(/bg-white/g, 'bg-slate-800');
layoutCode = layoutCode.replace(/bg-muted/g, 'bg-slate-800/50');
layoutCode = layoutCode.replace(/border-slate-200/g, 'border-slate-700/50');
layoutCode = layoutCode.replace(/border-border/g, 'border-slate-700/50');
layoutCode = layoutCode.replace(/text-slate-900/g, 'text-white');
layoutCode = layoutCode.replace(/text-slate-500/g, 'text-slate-400');
layoutCode = layoutCode.replace(/text-slate-600/g, 'text-slate-300');
layoutCode = layoutCode.replace(/text-muted-foreground/g, 'text-slate-400');

fs.writeFileSync(layoutPath, layoutCode, 'utf8');
console.log("Updated AdminLayout.jsx to Dark Mode");

// Do the same for Dashboard, Products, Orders, and SubscriptionDashboardPage
const toDarkMode = [
  'src/pages/admin/AdminDashboard.jsx',
  'src/pages/admin/AdminProducts.jsx',
  'src/pages/admin/AdminOrders.jsx',
  'src/pages/SubscriptionDashboardPage.jsx',
  'src/pages/admin/AdminCategories.jsx' // Just to make it dark too
];

toDarkMode.forEach(file => {
  const p = path.join(__dirname, file);
  if(fs.existsSync(p)) {
    let code = fs.readFileSync(p, 'utf8');
    code = code.replace(/bg-slate-50/g, 'bg-slate-900');
    code = code.replace(/bg-white/g, 'bg-slate-800');
    code = code.replace(/border-slate-200/g, 'border-slate-700');
    code = code.replace(/border-slate-100/g, 'border-slate-700/50');
    code = code.replace(/text-slate-900/g, 'text-white');
    code = code.replace(/text-slate-700/g, 'text-slate-200');
    code = code.replace(/text-slate-600/g, 'text-slate-300');
    code = code.replace(/text-slate-500/g, 'text-slate-400');
    code = code.replace(/bg-slate-100/g, 'bg-slate-700');
    fs.writeFileSync(p, code, 'utf8');
    console.log("Updated " + file + " to Dark Mode");
  }
});
