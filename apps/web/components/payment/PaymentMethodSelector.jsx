/**
 * @fileoverview Payment Method Selector Component
 * Grid of payment method options
 * ALL display text from i18n → t.checkout.* — zero hardcoded strings
 * Path: apps/web/components/payment/PaymentMethodSelector.jsx
 */

import { useLanguage } from '../../context/LanguageContext';

/**
 * PaymentMethodSelector — Grid of payment method buttons
 * @param {object} props
 * @param {Array} props.methods - Payment method objects from config
 * @param {string} props.selected - Currently selected method ID
 * @param {function} props.onSelect - Callback(methodId) when a method is selected
 */
const PaymentMethodSelector = ({ methods = [], selected = '', onSelect }) => {
  const { t } = useLanguage();

  if (!methods || methods.length === 0) {
    return (
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>
        {t.checkout?.noPaymentMethods || 'No payment methods available.'}
      </p>
    );
  }

  return (
    <div className="payment-methods-grid">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onSelect(method.id)}
          className={`payment-method-btn ${selected === method.id ? 'selected' : ''}`}
        >
          <span>{method.icon || '💳'}</span>
          {method.name}
        </button>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;