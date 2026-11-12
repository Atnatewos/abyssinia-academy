/**
 * @fileoverview Payment Method Selector — Tailwind
 * Path: apps/web/components/payment/PaymentMethodSelector.jsx
 */
import { useLanguage } from '../../context/LanguageContext';

const PaymentMethodSelector = ({ methods = [], selected = '', onSelect }) => {
  const { t } = useLanguage();

  if (!methods || methods.length === 0) {
    return <p className="text-xs text-slate-500 text-center py-4">{t.checkout?.noPaymentMethods || 'No payment methods available.'}</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {methods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onSelect(method.id)}
          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
            selected === method.id
              ? 'bg-amber-500/10 border-amber-500 text-amber-500'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-xl">{method.icon || '💳'}</span>
          <span className="text-xs font-semibold">{method.name}</span>
        </button>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;