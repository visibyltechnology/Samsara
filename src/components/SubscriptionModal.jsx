import React from 'react';
import { X, CheckCircle, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_NAME, SUBSCRIPTION_PERKS } from '../data/products';
import { useApp } from '../context/AppContext';

const formatPrice = (n) => `₦${n.toLocaleString()}`;

const SubscriptionModal = ({ onClose, onSubscribe, onSkip }) => {
  const { subscription } = useApp();
  const alreadySubscribed = subscription?.active;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        <div className="modal-icon">
          <Sparkles size={32} color="#1b5e3a" />
        </div>

        <h2 className="modal-title">Never Run Out of Essentials!</h2>
        <p className="modal-subtitle">
          Subscribe to our <strong>{SUBSCRIPTION_NAME}</strong> and get curated fresh groceries delivered to your door every month.
        </p>

        <div className="modal-price">
          {formatPrice(SUBSCRIPTION_PRICE)}<span>/month</span>
        </div>

        <ul className="modal-perks">
          {SUBSCRIPTION_PERKS.map((perk, i) => (
            <li key={i}>
              <CheckCircle size={16} color="#1b5e3a" />
              {perk}
            </li>
          ))}
        </ul>

        {alreadySubscribed ? (
          <div className="modal-already">✓ You're already subscribed!</div>
        ) : (
          <div className="modal-actions">
            <button className="btn btn-primary btn-block" onClick={onSubscribe}>
              Yes! Subscribe for {formatPrice(SUBSCRIPTION_PRICE)}/month
            </button>
            <button className="btn btn-ghost btn-block" onClick={onSkip}>
              No thanks, just this order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;
