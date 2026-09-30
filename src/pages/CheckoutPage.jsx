import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import {
  MapPin, CreditCard, CheckCircle2, Loader2, ChevronRight,
  Upload, Copy, AlertCircle, Building2, Receipt, Calendar, X
} from 'lucide-react';

const KORAPAY_PUBLIC_KEY = 'pk_live_ZEMDixqt5DcwbTVE35hR5rouew2LPu3UXPsWRNnG'; // Replace with your Korapay public key
const KLUMP_PUBLIC_KEY = 'klp_pk_8ce1e5b778f74c4abec932c231553a12f24cc2e7b514412c8c19868305b5820b';

let klumpScriptPromise = null;
const loadKlumpScript = () => {
  if (klumpScriptPromise) return klumpScriptPromise;
  klumpScriptPromise = new Promise((resolve, reject) => {
    if (document.getElementById('klump-js-script') || window.Klump) return resolve();
    const script = document.createElement('script');
    script.id = 'klump-js-script';
    script.src = 'https://js.useklump.com/klump.js';
    script.onload = () => resolve();
    script.onerror = () => {
      klumpScriptPromise = null;
      reject(new Error('Failed to load Klump'));
    };
    document.body.appendChild(script);
  });
  return klumpScriptPromise;
};

const BANK_ACCOUNT = {
  bank: 'Zenith Bank',
  accountName: 'Samsarachoice Limited',
  accountNumber: '2109876543',
};

// Shipping fees by state (NGN). Free for orders >= 80,000
const STATE_SHIPPING_FEES = {
  'Lagos': 2000,
  'Ogun': 3500, 'Oyo': 3500, 'Osun': 3500, 'Ekiti': 3500, 'Ondo': 3500,
  default: 5000,
};

const NIGERIA_STATES = {
  'Lagos': ['Agege','Ajeromi-Ifelodun','Alimosho','Amuwo-Odofin','Apapa','Badagry','Epe','Eti-Osa','Ibeju-Lekki','Ifako-Ijaiye','Ikeja','Ikorodu','Kosofe','Lagos Island','Lagos Mainland','Mushin','Ojo','Oshodi-Isolo','Shomolu','Surulere'],
  'Abuja (FCT)': ['Abaji','Bwari','Gwagwalada','Kuje','Kwali','Municipal Area Council'],
  'Ogun': ['Abeokuta North','Abeokuta South','Ado-Odo/Ota','Egbado North','Egbado South','Ewekoro','Ifo','Ijebu East','Ijebu North','Ijebu North-East','Ijebu Ode','Ikenne','Imeko Afon','Ipokia','Obafemi Owode','Odeda','Odogbolu','Ogun Waterside','Remo North','Sagamu'],
  'Oyo': ['Afijio','Akinyele','Atiba','Atisbo','Egbeda','Ibadan North','Ibadan North-East','Ibadan North-West','Ibadan South-East','Ibadan South-West','Ibarapa Central','Ibarapa East','Ibarapa North','Ido','Irepo','Iseyin','Itesiwaju','Iwajowa','Kajola','Lagelu','Ogbomosho North','Ogbomosho South','Ogo Oluwa','Olorunsogo','Oluyole','Ona Ara','Orelope','Ori Ire','Oyo East','Oyo West','Saki East','Saki West','Surulere'],
  'Rivers': ['Abua/Odual','Ahoada East','Ahoada West','Akuku-Toru','Andoni','Asari-Toru','Bonny','Degema','Eleme','Emouha','Etche','Gokana','Ikwerre','Khana','Obio/Akpor','Ogba/Egbema/Ndoni','Ogu/Bolo','Okrika','Omuma','Opobo/Nkoro','Oyigbo','Port Harcourt','Tai'],
  'Kano': ['Ajingi','Albasu','Bagwai','Bebeji','Bichi','Bunkure','Dala','Dambatta','Dawakin Kudu','Dawakin Tofa','Doguwa','Fagge','Gabasawa','Garko','Garum Mallam','Gaya','Gezawa','Gwale','Gwarzo','Kabo','Kano Municipal','Karaye','Kibiya','Kiru','Kumbotso','Kunchi','Kura','Madobi','Makoda','Minjibir','Nasarawa','Rano','Rimin Gado','Rogo','Shanono','Sumaila','Takai','Tarauni','Tofa','Tsanyawa','Tudun Wada','Ungogo','Warawa','Wudil'],
  'Anambra': ['Aguata','Anambra East','Anambra West','Anaocha','Awka North','Awka South','Ayamelum','Dunukofia','Ekwusigo','Idemili North','Idemili South','Ihiala','Njikoka','Nnewi North','Nnewi South','Ogbaru','Onitsha North','Onitsha South','Orumba North','Orumba South','Oyi'],
  'Delta': ['Aniocha North','Aniocha South','Bomadi','Burutu','Ethiope East','Ethiope West','Ika North-East','Ika South','Isoko North','Isoko South','Ndokwa East','Ndokwa West','Okpe','Oshimili North','Oshimili South','Patani','Sapele','Udu','Ughelli North','Ughelli South','Ukwuani','Uvwie','Warri North','Warri South','Warri South-West'],
  'Enugu': ['Aninri','Awgu','Enugu East','Enugu North','Enugu South','Ezeagu','Igbo Etiti','Igbo Eze North','Igbo Eze South','Isi Uzo','Nkanu East','Nkanu West','Nsukka','Oji River','Udenu','Udi','Uzo Uwani'],
  'Kaduna': ['Birnin Gwari','Chikun','Giwa','Igabi','Ikara','Jaba','Jema\'a','Kachia','Kaduna North','Kaduna South','Kagarko','Kajuru','Kaura','Kauru','Kubau','Kudan','Lere','Makarfi','Sabon Gari','Sanga','Soba','Zangon Kataf','Zaria'],
  'Imo': ['Aboh Mbaise','Ahiazu Mbaise','Ehime Mbano','Ezinihitte','Ideato North','Ideato South','Ihitte/Uboma','Ikeduru','Isiala Mbano','Isu','Mbaitoli','Ngor Okpala','Njaba','Nkwerre','Nwangele','Obowo','Oguta','Ohaji/Egbema','Okigwe','Orlu','Orsu','Oru East','Oru West','Owerri Municipal','Owerri North','Owerri West','Unuimo'],
  'Akwa Ibom': ['Abak','Eastern Obolo','Eket','Esit Eket','Essien Udim','Etim Ekpo','Etinan','Ibeno','Ibesikpo Asutan','Ibiono-Ibom','Ika','Ikono','Ikot Abasi','Ikot Ekpene','Ini','Itu','Mbo','Mkpat-Enin','Nsit-Atai','Nsit-Ibom','Nsit-Ubium','Obot Akara','Okobo','Onna','Oron','Oruk Anam','Udung-Uko','Ukanafun','Uruan','Urue-Offong/Oruko','Uyo'],
  'Cross River': ['Abi','Akamkpa','Akpabuyo','Bakassi','Bekwarra','Biase','Boki','Calabar Municipal','Calabar South','Etung','Ikom','Obanliku','Obubra','Obudu','Odukpani','Ogoja','Yakuur','Yala'],
  'Borno': ['Abadam','Askira/Uba','Bama','Bayo','Biu','Chibok','Damboa','Dikwa','Gubio','Guzamala','Gwoza','Hawul','Jere','Kaga','Kala/Balge','Konduga','Kukawa','Kwaya Kusar','Mafa','Magumeri','Maiduguri','Marte','Mobbar','Monguno','Ngala','Nganzai','Shani'],
  'Bauchi': ['Alkaleri','Bauchi','Bogoro','Damban','Darazo','Dass','Gamawa','Ganjuwa','Giade','Itas/Gadau','Jama\'are','Katagum','Kirfi','Misau','Ningi','Shira','Tafawa Balewa','Toro','Warji','Zaki'],
  'Sokoto': ['Binji','Bodinga','Dange Shuni','Gada','Goronyo','Gudu','Gwadabawa','Illela','Isa','Kebbe','Kware','Rabah','Sabon Birni','Shagari','Silame','Sokoto North','Sokoto South','Tambuwal','Tangaza','Tureta','Wamako','Wurno','Yabo'],
  'Plateau': ['Barkin Ladi','Bassa','Bokkos','Jos East','Jos North','Jos South','Kanam','Kanke','Langtang North','Langtang South','Mangu','Mikang','Pankshin','Qua\'an Pan','Riyom','Shendam','Wase'],
  'Benue': ['Ado','Agatu','Apa','Buruku','Gboko','Guma','Gwer East','Gwer West','Katsina-Ala','Konshisha','Kwande','Logo','Makurdi','Obi','Ogbadibo','Ohimini','Oju','Okpokwu','Otukpo','Tarka','Ukum','Ushongo','Vandeikya'],
  'Niger': ['Agaie','Agwara','Bida','Borgu','Bosso','Chanchaga','Edati','Gbako','Gurara','Katcha','Kontagora','Lapai','Lavun','Magama','Mariga','Mashegu','Mokwa','Moya','Paikoro','Rafi','Rijau','Shiroro','Suleja','Tafa','Wushishi'],
  'Kwara': ['Asa','Baruten','Edu','Ekiti','Ifelodun','Ilorin East','Ilorin South','Ilorin West','Irepodun','Isin','Kaiama','Moro','Offa','Oke Ero','Oyun','Pategi'],
  'Osun': ['Aiyedaade','Aiyedire','Atakumosa East','Atakumosa West','Boluwaduro','Boripe','Ede North','Ede South','Egbedore','Ejigbo','Ife Central','Ife East','Ife North','Ife South','Ifedayo','Ifelodun','Ila','Ilesa East','Ilesa West','Irepodun','Irewole','Isokan','Iwo','Obokun','Odo Otin','Ola Oluwa','Olorunda','Oriade','Orolu','Osogbo'],
  'Ekiti': ['Ado Ekiti','Efon','Ekiti East','Ekiti South-West','Ekiti West','Emure','Gbonyin','Ido/Osi','Ijero','Ikere','Ikole','Ilejemeje','Irepodun/Ifelodun','Ise/Orun','Moba','Oye'],
  'Ondo': ['Akoko North-East','Akoko North-West','Akoko South-East','Akoko South-West','Akure North','Akure South','Ese Odo','Idanre','Ifedore','Ilaje','Ile Oluji/Okeigbo','Irele','Odigbo','Okitipupa','Ondo East','Ondo West','Ose','Owo'],
  'Abia': ['Aba North','Aba South','Arochukwu','Bende','Ikwuano','Isiala Ngwa North','Isiala Ngwa South','Isuikwuato','Obi Ngwa','Ohafia','Osisioma','Ugwunagbo','Ukwa East','Ukwa West','Umuahia North','Umuahia South','Umu Nneochi'],
  'Ebonyi': ['Abakaliki','Afikpo North','Afikpo South','Ezza North','Ezza South','Ikwo','Ishielu','Ivo','Izzi','Ohaozara','Ohaukwu','Onicha'],
  'Edo': ['Akoko-Edo','Egor','Esan Central','Esan North-East','Esan South-East','Esan West','Etsako Central','Etsako East','Etsako West','Igueben','Ikpoba Okha','Oredo','Orhionmwon','Ovia North-East','Ovia South-West','Owan East','Owan West','Uhunmwonde'],
  'Bayelsa': ['Brass','Ekeremor','Kolokuma/Opokuma','Nembe','Ogbia','Sagbama','Southern Ijaw','Yenagoa'],
  'Kogi': ['Adavi','Ajaokuta','Ankpa','Bassa','Dekina','Ibaji','Idah','Igalamela Odolu','Ijumu','Kabba/Bunu','Kogi','Lokoja','Mopa Muro','Ofu','Ogori/Magongo','Okehi','Okene','Olamaboro','Omala','Yagba East','Yagba West'],
  'Taraba': ['Ardo Kola','Bali','Donga','Gashaka','Gassol','Ibi','Jalingo','Karim Lamido','Kumi','Lau','Sardauna','Takum','Ussa','Wukari','Yorro','Zing'],
  'Adamawa': ['Demsa','Fufure','Ganye','Gayuk','Gombi','Grie','Hong','Jada','Lamurde','Madagali','Maiha','Mayo Belwa','Michika','Mubi North','Mubi South','Numan','Shelleng','Song','Toungo','Yola North','Yola South'],
  'Gombe': ['Akko','Balanga','Billiri','Dukku','Funakaye','Gombe','Kaltungo','Kwami','Nafada','Shongom','Yamaltu/Deba'],
  'Yobe': ['Bade','Bursari','Damaturu','Fika','Fune','Geidam','Gujba','Gulani','Jakusko','Karasuwa','Machina','Nangere','Nguru','Potiskum','Tarmuwa','Yunusari','Yusufari'],
  'Zamfara': ['Anka','Bakura','Birnin Magaji/Kiyaw','Bukkuyum','Bungudu','Gummi','Gusau','Kaura Namoda','Maradun','Maru','Shinkafi','Talata Mafara','Tsafe','Zurmi'],
  'Kebbi': ['Aleiro','Arewa','Argungu','Augie','Bagudo','Birnin Kebbi','Bunza','Dandi','Fakai','Gwandu','Jega','Kalgo','Koko/Besse','Maiyama','Ngaski','Sakaba','Shanga','Suru','Wasagu/Danko','Yauri','Zuru'],
  'Nasarawa': ['Akwanga','Awe','Doma','Karu','Keana','Keffi','Kokona','Lafia','Nasarawa','Nasarawa Egon','Obi','Toto','Wamba'],
};

// Generate installment options similar to the reference
const INSTALLMENT_OPTIONS = [
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `${i + 2}_weeks`,
    label: `${i + 2} Weeks`,
    duration: i + 2,
    interestRate: (i + 2) * 0.015 // 1.5% per week
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 2}_months`,
    label: `${i + 2} Months`,
    duration: i + 2,
    interestRate: (i + 2) * 0.05 // 5% per month
  }))
];

const PAYMENT_METHODS = [
  {
    id: 'paystack',
    label: 'Korapay (Full Payment)',
    sub: 'Card, Bank Transfer, USSD',
    desc: 'Pay the full amount instantly and securely via Korapay.',
    color: '#F7941D',
    icon: (
      <svg width="28" height="18" viewBox="0 0 80 30" fill="none">
        <rect width="80" height="30" rx="5" fill="#F7941D"/>
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">KORA</text>
      </svg>
    ),
  },
  {
    id: 'klump',
    label: 'Klump BNPL',
    sub: 'Buy Now, Pay Later in 4',
    desc: 'Use the official Klump widget to split your payment into 4.',
    color: '#5B2D90',
    badge: 'KLUMP',
    icon: (
      <svg width="28" height="18" viewBox="0 0 80 30" fill="none">
        <rect width="80" height="30" rx="5" fill="#5B2D90"/>
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">K</text>
      </svg>
    ),
  },
  {
    id: 'installment',
    label: 'Custom Instalment Pay',
    sub: 'Flexible Weeks or Months',
    desc: 'Pay a 30% deposit today, and the rest automatically later.',
    color: '#16a34a',
    badge: 'FLEX',
    icon: (
      <svg width="28" height="18" viewBox="0 0 80 30" fill="none">
        <rect width="80" height="30" rx="5" fill="#16a34a"/>
        <circle cx="20" cy="15" r="5" fill="white" />
        <circle cx="40" cy="15" r="5" fill="white" />
        <circle cx="60" cy="15" r="5" fill="white" />
      </svg>
    ),
  },
  {
    id: 'food_subscription',
    label: 'Foodstuffs Subscription',
    sub: 'Weekly or Monthly',
    desc: 'Subscribe to have these food items delivered to you regularly.',
    color: '#0284c7', // sky-600
    badge: 'SUBSCRIBE',
    icon: (
      <svg width="28" height="18" viewBox="0 0 80 30" fill="none">
        <rect width="80" height="30" rx="5" fill="#ea580c"/>
        <circle cx="40" cy="15" r="8" stroke="white" strokeWidth="2" fill="none"/>
        <text x="40" y="19" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">₦</text>
      </svg>
    ),
  },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [address, setAddress] = useState({ full_name: '', phone: '', address_line1: '', city: '', state: '', country: 'Nigeria' });
  const [paymentMethod, setPaymentMethod] = useState('paystack');

  // Klump open state
  const [klumpOpen, setKlumpOpen] = useState(false);

  // Custom Installment States
  const [installmentPlanId, setInstallmentPlanId] = useState(INSTALLMENT_OPTIONS[0].id);

  // Subscription States
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('weekly');



  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
  
  const shipping = cartTotal >= 80000 ? 0 : (STATE_SHIPPING_FEES[address.state] ?? STATE_SHIPPING_FEES.default);
  const subTotal = cartTotal + shipping;

  // Installment Calculations
  const activePlan = INSTALLMENT_OPTIONS.find(p => p.id === installmentPlanId);
  const interestAmount = paymentMethod === 'installment' ? Math.floor(subTotal * activePlan.interestRate) : 0;
  const grandTotal = subTotal + interestAmount;
  const depositAmount = paymentMethod === 'installment' ? Math.floor(grandTotal * 0.30) : grandTotal;
  const recurringAmount = paymentMethod === 'installment' ? Math.floor((grandTotal - depositAmount) / activePlan.duration) : 0;

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      setUser(session.user);
      if (session.user.user_metadata?.full_name) {
        setAddress(a => ({ ...a, full_name: session.user.user_metadata.full_name }));
      }
    };
    init();
    if (cartItems.length === 0) navigate('/cart');
  }, [navigate, cartItems.length]);

  const createOrder = async (status = 'pending', paymentRef = null, meta = {}) => {
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user.id,
      total_amount: grandTotal,
      shipping_amount: shipping,
      status,
      payment_method: paymentMethod,
      payment_reference: paymentRef,
      shipping_address: address,
      payment_meta: meta,
    }).select().single();
    if (error) throw error;
    await supabase.from('order_items').insert(
      cartItems.map(i => ({ order_id: order.id, product_id: i.product.id, quantity: i.quantity, price: i.product.price }))
    );
    return order;
  };

  // ── Korapay Native ────────────────────────────────────────────────────────
  const handleKorapayNative = async () => {
    setLoading(true);
    try {
      const order = await createOrder('pending');
      if (!window.Korapay?.initialize) { alert('Korapay not loaded. Please refresh.'); setLoading(false); return; }

      window.Korapay.initialize({
        key: KORAPAY_PUBLIC_KEY,
        reference: `samsara_${order.id}_${Date.now()}`,
        amount: grandTotal,
        currency: 'NGN',
        customer: {
          name: address.full_name,
          email: user.email,
        },
        onSuccess: function(data) {
          (async () => {
            await supabase.from('orders').update({ status: 'processing', payment_reference: data.reference }).eq('id', order.id);
            await clearCart();
            setOrderId(order.id);
            setOrderPlaced(true);
            setLoading(false);
          })();
        },
        onClose: function() {
          setLoading(false);
        },
        onFailed: function() {
          setLoading(false);
          alert('Payment failed. Please try again.');
        },
      });
    } catch (e) { alert(e.message); setLoading(false); }
  };

  // ── Klump Native SDK ──────────────────────────────────────────────────────
  const closeKlump = () => {
    const klumpDiv = document.getElementById('klump__checkout');
    if (klumpDiv) klumpDiv.innerHTML = '';
    document.querySelectorAll('[id^="klump"]').forEach(el => {
      if (el.id !== 'klump__checkout') el.remove();
    });
    document.querySelectorAll('iframe[src*="klump"]').forEach(el => el.remove());
    setKlumpOpen(false);
    setLoading(false);
  };

  const handleKlumpNative = async () => {
    setLoading(true);
    try {
      await loadKlumpScript();
      const KlumpCtor = window.Klump || (0, eval)('Klump');
      if (!KlumpCtor) throw new Error('Klump SDK not loaded. Please check your connection.');

      const order = await createOrder('pending');

      const klumpData = {
        publicKey: KLUMP_PUBLIC_KEY,
        data: {
          amount: grandTotal,
          currency: 'NGN',
          shipping_fee: shipping,
          merchant_reference: `samsara_${order.id}_${Date.now()}`,
          meta_data: {
            customer: address.full_name || 'Guest',
            email: user.email,
            phone: address.phone,
            shipping_address: address,
          },
          items: cartItems.map(item => ({
            image_url: item.product.image_url || '',
            item_url: `https://samsarachoice.com/product/${item.product.slug || item.product.id}`,
            name: item.product.name,
            unit_price: item.product.price,
            quantity: item.quantity,
          })),
        },
        onSuccess: async (data) => {
          await supabase.from('orders').update({ status: 'processing', payment_reference: data?.data?.reference || 'klump_paid' }).eq('id', order.id);
          await clearCart();
          setOrderId(order.id);
          setKlumpOpen(false);
          setOrderPlaced(true);
          setLoading(false);
        },
        onError: (err) => { console.error(err); closeKlump(); alert('Klump payment failed or was declined.'); },
        onLoad: () => { setKlumpOpen(true); setLoading(false); },
        onOpen: () => { setKlumpOpen(true); },
        onClose: () => { closeKlump(); },
      };
      new KlumpCtor(klumpData);
    } catch (e) { alert(e.message); setLoading(false); }
  };

  // ── Custom Instalment Flow ────────────────────────────────────────────────
  const handleCustomInstallment = async () => {
    setLoading(true);

    const meta = {
      type: 'custom_installment',
      plan: activePlan.label,
      deposit_amount: depositAmount,
      recurring_amount: recurringAmount,
      duration: activePlan.duration,
      continuous_payment_method: 'korapay',
    };

    try {
      const order = await createOrder('pending', null, meta);
      if (!window.Korapay?.initialize) throw new Error('Korapay not loaded. Please refresh.');

      window.Korapay.initialize({
        key: KORAPAY_PUBLIC_KEY,
        reference: `samsara_dep_${order.id}_${Date.now()}`,
        amount: depositAmount,
        currency: 'NGN',
        customer: {
          name: address.full_name,
          email: user.email,
        },
        onSuccess: function(data) {
          (async () => {
            await supabase.from('orders').update({
              status: 'processing',
              payment_reference: data.reference,
              payment_meta: { ...meta, deposit_ref: data.reference, deposit_paid: true },
            }).eq('id', order.id);
            await clearCart();
            setOrderId(order.id);
            setOrderPlaced(true);
            setLoading(false);
          })();
        },
        onClose: function() {
          setLoading(false);
        },
        onFailed: function() {
          setLoading(false);
          alert('Deposit payment failed. Please try again.');
        },
      });
    } catch (e) { alert(e.message); setLoading(false); }
  };

  // ── Food Subscription ─────────────────────────────────────────────────────
  const handleFoodSubscription = async () => {
    setLoading(true);
    try {
      const meta = { is_subscription: true, frequency: subscriptionFrequency };
      const order = await createOrder('pending', null, meta);
      
      // Initialize Korapay for the first subscription payment
      if (!window.Korapay?.initialize) { alert('Korapay not loaded. Please refresh.'); setLoading(false); return; }

      window.Korapay.initialize({
        key: KORAPAY_PUBLIC_KEY,
        reference: `samsara_sub_${order.id}_${Date.now()}`,
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
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'paystack') handleKorapayNative();
    else if (paymentMethod === 'klump') handleKlumpNative();
    else if (paymentMethod === 'installment') handleCustomInstallment();
    else if (paymentMethod === 'food_subscription') handleFoodSubscription();
  };

  // ─── Order Success ───────────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="container py-20 flex justify-center items-center min-h-[60vh]">
        <div className="max-w-md w-full bg-card border rounded-2xl p-10 text-center shadow-sm">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-4 text-sm">
            {paymentMethod === 'food_subscription'
                ? "Subscription activated! Your first delivery will be prepared right away."
                : "Payment confirmed! We'll start preparing your order right away."}
          </p>
          <p className="font-mono text-xs text-muted-foreground mb-6">Order #{orderId?.slice(0, 8).toUpperCase()}</p>
          <button onClick={() => navigate('/orders')} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md font-medium transition-colors">
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="container py-12 max-w-5xl">
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[{ n: 1, label: 'Delivery' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Review' }].map((s, i, arr) => (
          <React.Fragment key={s.n}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step >= s.n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {s.n} {s.label}
            </div>
            {i < arr.length - 1 && <div className={`flex-1 h-0.5 ${step > s.n ? 'bg-primary' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">

          {/* ─── Step 1: Address ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Delivery Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                    <input className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={address.full_name} onChange={e => setAddress(a => ({ ...a, full_name: e.target.value }))} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number</label>
                    <input className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} placeholder="+234 800 000 0000" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Street Address</label>
                  <input className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={address.address_line1} onChange={e => setAddress(a => ({ ...a, address_line1: e.target.value }))} placeholder="123 Main Street, Lekki" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">State</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={address.state}
                      onChange={e => setAddress(a => ({ ...a, state: e.target.value, city: '' }))}
                    >
                      <option value="">Select State</option>
                      {Object.keys(NIGERIA_STATES).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">City / LGA</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      value={address.city}
                      onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                      disabled={!address.state}
                    >
                      <option value="">Select City / LGA</option>
                      {(NIGERIA_STATES[address.state] || []).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md font-medium transition-colors mt-4 disabled:opacity-50" onClick={() => setStep(2)} disabled={!address.full_name || !address.address_line1 || !address.city}>
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Payment ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === m.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-muted-foreground/30 hover:bg-muted/20'}`}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="mt-1 h-4 w-4 accent-primary shrink-0" />
                    <div className="shrink-0 mt-0.5">{m.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{m.label}</p>
                        {m.badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">{m.badge}</span>}
                        <span className="text-[10px] text-muted-foreground">{m.sub}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    </div>
                    {paymentMethod === m.id && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
                  </label>
                ))}
              </div>

              {/* ── Subscription Frequency Selection ─────────────────────── */}
              {paymentMethod === 'food_subscription' && (
                <div className="mt-4 border border-sky-500/30 bg-sky-500/5 rounded-xl p-5 space-y-5">
                  <div>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-2">Choose Delivery Frequency</label>
                    <div className="flex gap-3">
                      <label className={`flex-1 p-3 border rounded-lg cursor-pointer flex items-center gap-2 ${subscriptionFrequency === 'weekly' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200'}`}>
                        <input type="radio" name="freq" value="weekly" checked={subscriptionFrequency === 'weekly'} onChange={() => setSubscriptionFrequency('weekly')} className="hidden" />
                        <span className="font-medium text-sm">Weekly</span>
                      </label>
                      <label className={`flex-1 p-3 border rounded-lg cursor-pointer flex items-center gap-2 ${subscriptionFrequency === 'monthly' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200'}`}>
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
              
              {/* ── Custom Installment Sub-Form ──────────────────────────── */}
              {paymentMethod === 'installment' && (
                <div className="mt-4 border border-green-500/30 bg-green-500/5 rounded-xl p-5 space-y-5">
                  <div>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-2"><Calendar className="h-4 w-4" /> Choose Plan Duration</label>
                    <select 
                      className="w-full h-11 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      value={installmentPlanId}
                      onChange={e => setInstallmentPlanId(e.target.value)}
                    >
                      {INSTALLMENT_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label} ({opt.interestRate * 100}% Interest)</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-start gap-3 text-green-700 dark:text-green-400 text-sm p-3 bg-green-500/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <p>Total with Interest: <strong>{fmt(grandTotal)}</strong></p>
                      <p>Pay 30% Deposit Now: <strong>{fmt(depositAmount)}</strong></p>
                      <p>Then {activePlan.duration} payments of: <strong>{fmt(recurringAmount)}</strong></p>
                    </div>
                  </div>

                  {/* Deposit Payment Note */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Deposit Payment</p>
                    <div className="p-3 border rounded-lg text-sm bg-background">
                      Your {fmt(depositAmount)} deposit will be processed securely via Paystack.
                    </div>
                  </div>

                  {/* Continuous Payments Note */}
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Continuous Payments
                    </p>
                    <div className="p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
                      Subsequent instalments will be automatically and securely processed via Paystack on their due dates.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 h-11 border rounded-md text-sm font-medium hover:bg-muted transition-colors">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md font-medium transition-colors flex items-center justify-center gap-1">
                  Review Order <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Review ──────────────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-6">Review Your Order</h2>
              <div className="mb-4 p-4 bg-muted/40 rounded-xl text-sm space-y-1">
                <p className="font-semibold">Delivering to:</p>
                <p className="text-muted-foreground">{address.full_name} · {address.phone}</p>
                <p className="text-muted-foreground">{address.address_line1}, {address.city}, {address.state}</p>
              </div>
              <div className="mb-4 p-4 bg-muted/40 rounded-xl text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold">Payment:</span>
                  <span className="text-muted-foreground">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
                </div>
                {paymentMethod === 'installment' && (
                  <div className="pl-6 space-y-1 text-green-600 dark:text-green-400 text-xs">
                    <p>Total (w/ interest): {fmt(grandTotal)}</p>
                    <p>Deposit due now: {fmt(depositAmount)}</p>
                    <p>Remaining: {activePlan.duration} payments of {fmt(recurringAmount)}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-muted overflow-hidden shrink-0">
                      {item.product?.image_url && <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{fmt((item.product?.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 h-11 border rounded-md text-sm font-medium hover:bg-muted transition-colors">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <>Place Order · {fmt(paymentMethod === 'installment' ? depositAmount : grandTotal)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Order Summary Sidebar ────────────────────────────────────────── */}
        <div className="h-fit sticky top-24 space-y-4">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(cartTotal)}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {!address.state ? 'Select state' : shipping === 0 ? 'FREE' : fmt(shipping)}
                </span>
              </div>
              {address.state && shipping > 0 && (
                <p className="text-[11px] text-muted-foreground">{address.state} delivery rate applies</p>
              )}
              {paymentMethod === 'installment' && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Interest ({activePlan.interestRate * 100}%)</span>
                  <span>+{fmt(interestAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{fmt(grandTotal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Klump SDK required mount point */}
    <div id="klump__checkout"></div>

    {/* Floating close button — rendered on top of Klump's full-screen overlay via a portal */}
    {klumpOpen && createPortal(
      <button
        onClick={closeKlump}
        title="Close Klump"
        style={{
          position: 'fixed',
          top: '18px',
          right: '18px',
          zIndex: 2147483647,
          background: '#111',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#333'}
        onMouseLeave={e => e.currentTarget.style.background = '#111'}
      >
        <X color="white" size={20} />
      </button>,
      document.body
    )}
    </>
  );
};

export default CheckoutPage;
