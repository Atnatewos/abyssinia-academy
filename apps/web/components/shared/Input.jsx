/**
 * @fileoverview Styled Input Component
 * Consistent form input with glassmorphism styling
 * Path: apps/web/components/shared/Input.jsx
 */

/**
 * Input - Styled text input field
 * @param {object} props - All standard input attributes plus:
 * @param {string} [props.label] - Input label
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.className] - Additional CSS classes
 */
const Input = ({ label, error, className = '', ...inputProps }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          {label}
        </label>
      )}
      <input
        {...inputProps}
        className={`w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border transition-colors text-slate-900 dark:text-slate-100 text-xs focus:outline-none ${
          error
            ? 'border-red-500/50 focus:border-red-400'
            : 'border-slate-700/30 focus:border-amber-400'
        } ${className}`}
      />
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;