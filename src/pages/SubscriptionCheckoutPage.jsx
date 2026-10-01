import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, CreditCard, CheckCircle2, Loader2, Package } from 'lucide-react';

const KORAPAY_PUBLIC_KEY = 'pk_live_ZEMDixqt5DcwbTVE35hR5rouew2LPu3UXPsWRNnG'; // Replace with Korapay public key

const STATE_SHIPPING_FEES = {
  'Lagos': 2000,
  'Ogun': 3500, 'Oyo': 3500, 'Osun': 3500, 'Ekiti': 3500, 'Ondo': 3500,
  default: 5000,
};

const FULL_NIGERIA_STATES = {
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

export default function SubscriptionCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bundle, frequency, price } = location.state || {};

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState({ full_name: '', phone: '', address_line1: '', city: '', state: '', country: 'Nigeria' });
  const [subscriptionPlaced, setSubscriptionPlaced] = useState(false);

  useEffect(() => {
    if (!bundle) {
      navigate('/bundles');
      return;
    }
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { state: { returnTo: '/subscription-checkout', bundle, frequency, price } });
      } else {
        setUser(session.user);
        // Fetch default profile address if available
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setAddress({
            full_name: profile.full_name || '',
            phone: profile.phone || '',
            address_line1: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            country: 'Nigeria'
          });
        }
      }
    };
    checkUser();
  }, [navigate, bundle, frequency, price]);

  if (!bundle) return null;

  const fmt = (n) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
  
  const shipping = address.state ? (STATE_SHIPPING_FEES[address.state] ?? STATE_SHIPPING_FEES.default) : 0;
  const grandTotal = price + shipping;

  const handleSubscribe = async () => {
    setLoading(true);
    
    if (!window.Korapay?.initialize) { 
      alert('Korapay not loaded. Please refresh.'); 
      setLoading(false); 
      return; 
    }

    // 1. Create a placeholder subscription record
    // We do this first so we have a reference ID for Korapay
    const { data: subData, error: subErr } = await supabase.from('subscriptions').insert([{
      user_id: user.id,
      bundle_id: bundle.id,
      frequency: frequency,
      quantity: 1,
      status: 'paused', // Paused until payment is verified
      next_billing_date: new Date(Date.now() + (frequency === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      delivery_address: address
    }]).select().single();

    if (subErr) {
      alert('Could not initialize subscription. ' + subErr.message);
      setLoading(false);
      return;
    }

    const subId = subData.id;

    // 2. Initialize Korapay
    window.Korapay.initialize({
      key: KORAPAY_PUBLIC_KEY,
      reference: `sub_${subId}_${Date.now()}`,
      amount: grandTotal,
      currency: 'NGN',
      customer: {
        name: address.full_name,
        email: user.email,
      },
      onSuccess: function(data) {
        (async () => {
          // Update subscription to active
          await supabase.from('subscriptions').update({ 
            status: 'active',
            payment_token: data.reference // Typically Korapay webhooks would provide a real token, using ref as placeholder
          }).eq('id', subId);

          // Create first order
          const { data: orderData } = await supabase.from('orders').insert([{
            user_id: user.id,
            status: 'processing',
            total_amount: grandTotal,
            shipping_address: address,
            payment_method: 'korapay',
            payment_reference: data.reference,
            is_subscription: true
          }]).select().single();

          if (orderData) {
            // Create order item
            await supabase.from('order_items').insert([{
              order_id: orderData.id,
              product_id: null, // Depending on if bundles are products. For now, store in meta
              quantity: 1,
              price: price
            }]);
          }

          // Record payment history
          await supabase.from('subscription_history').insert([{
            subscription_id: subId,
            amount: grandTotal,
            status: 'success',
            order_id: orderData?.id,
            korapay_reference: data.reference
          }]);

          setSubscriptionPlaced(true);
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
  };

  if (subscriptionPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Subscription Active!</h2>
          <p className="text-slate-600 mb-8">
            Your {frequency} {bundle.name} subscription has been activated successfully. Your first bundle is being prepared.
          </p>
          <button 
            onClick={() => navigate('/profile')} 
            className="w-full bg-primary text-white h-12 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Manage Subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-bold mb-8 text-slate-900">Subscribe & Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Address */}
            <div className={`bg-white border rounded-2xl p-6 shadow-sm ${step !== 1 ? 'opacity-70' : ''}`}>
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Delivery Address
              </h2>
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name</label>
                      <input className="w-full h-10 px-3 rounded-md border text-sm focus:ring-2 focus:ring-primary/50" value={address.full_name} onChange={e => setAddress(a => ({ ...a, full_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone Number</label>
                      <input className="w-full h-10 px-3 rounded-md border text-sm focus:ring-2 focus:ring-primary/50" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Street Address</label>
                    <input className="w-full h-10 px-3 rounded-md border text-sm focus:ring-2 focus:ring-primary/50" value={address.address_line1} onChange={e => setAddress(a => ({ ...a, address_line1: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">State</label>
                      <select className="w-full h-10 px-3 rounded-md border text-sm focus:ring-2 focus:ring-primary/50" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value, city: '' }))}>
                        <option value="">Select State</option>
                        {Object.keys(FULL_NIGERIA_STATES).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">City / LGA</label>
                      <select className="w-full h-10 px-3 rounded-md border text-sm focus:ring-2 focus:ring-primary/50 disabled:opacity-50" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} disabled={!address.state}>
                        <option value="">Select City</option>
                        {(FULL_NIGERIA_STATES[address.state] || []).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button 
                    className="w-full bg-primary text-white h-11 rounded-md font-medium mt-4 disabled:opacity-50" 
                    onClick={() => setStep(2)} 
                    disabled={!address.full_name || !address.address_line1 || !address.state || !address.city}
                  >
                    Continue to Payment
                  </button>
                </div>
              ) : (
                <div className="text-sm flex justify-between items-center">
                  <div>
                    <p className="font-medium">{address.full_name}</p>
                    <p className="text-slate-600">{address.address_line1}, {address.city}, {address.state}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-primary font-medium text-sm">Edit</button>
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-white border rounded-2xl p-6 shadow-sm ${step !== 2 ? 'opacity-50' : ''}`}>
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Subscription Payment
              </h2>
              {step === 2 && (
                <div>
                  <p className="text-sm text-slate-600 mb-6">
                    By subscribing, you authorize Samsara Choice to automatically charge your card {frequency} until you cancel. You can manage or cancel your subscription anytime from your profile.
                  </p>
                  <button 
                    onClick={handleSubscribe} 
                    disabled={loading}
                    className="w-full h-12 bg-[#F7941D] hover:bg-[#F7941D]/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Subscribe & Pay ${fmt(grandTotal)}`}
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-5">
            <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-lg mb-4">Subscription Summary</h2>
              
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src={bundle.image_url} alt={bundle.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{bundle.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1 capitalize">{frequency} Plan</p>
                </div>
              </div>

              {bundle.id === 'custom' && bundle.items && (
                <div className="mb-6 space-y-2 max-h-48 overflow-y-auto pr-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Items Included</p>
                  {bundle.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-slate-600">
                      <span>{item.quantity}x {item.product.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Bundle Price</span>
                  <span className="font-medium">{fmt(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Delivery Fee ({frequency})</span>
                  <span className="font-medium">{!address.state ? 'Select state' : fmt(shipping)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center mb-6">
                <div>
                  <span className="block font-bold text-lg text-slate-900">Total</span>
                  <span className="text-[11px] text-slate-500">Charged {frequency}</span>
                </div>
                <span className="text-2xl font-black text-primary">{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
