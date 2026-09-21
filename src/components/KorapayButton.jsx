import React, { useEffect, useState } from 'react';

const KorapayButton = ({ amount = 1000, customerName = 'Customer', customerEmail = 'customer@example.com', onSuccess, onClose }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load Korapay script
    const script = document.createElement('script');
    script.src = 'https://korapay.com/merchant/api/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = (e) => {
    e.preventDefault();
    if (!window.Korapay) return;

    window.Korapay.initialize({
      key: 'pk_live_ZEMDixqt5DcwbTVE35hR5rouew2LPu3UXPsWRNnG',
      reference: `ref_${Date.now()}`,
      amount: amount,
      currency: 'NGN',
      customer: {
        name: customerName,
        email: customerEmail
      },
      onClose: function () {
        if (onClose) onClose();
      },
      onSuccess: function (data) {
        if (onSuccess) onSuccess(data);
      }
    });
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={!isReady}
      className="btn btn-primary hover-lift"
      style={{ marginLeft: '1rem' }}
    >
      Pay with Korapay {isReady ? '' : '(Loading...)'}
    </button>
  );
};

export default KorapayButton;
