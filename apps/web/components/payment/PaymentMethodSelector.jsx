/**
 * @fileoverview Payment Method Selector Component
 * Grid of payment method options
 * Path: apps/web/components/payment/PaymentMethodSelector.jsx
 */

const PaymentMethodSelector = ({ methods = [], selected = '', onSelect }) => {
  if (!methods || methods.length === 0) {
    return <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>No payment methods available.</p>;
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