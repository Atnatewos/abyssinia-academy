/**
 * @fileoverview Admin Form Field Primitives
 *
 * Labeled, accessible form controls with inline error + hint slots.
 * Every field generates a stable id via useId so labels bind correctly
 * even when multiple instances render on one page.
 *
 * Exports: AdminInput, AdminSelect, AdminTextarea, AdminCheckbox
 *
 * Path: apps/web/components/admin/ui/AdminInput.jsx
 */

import React, { useId } from 'react';
import clsx from 'clsx';

const CONTROL =
  'box-border w-full px-3.5 py-2.5 rounded-md bg-bg-input font-sans text-sm ' +
  'text-text-main border border-solid border-border-medium outline-none ' +
  'transition-colors duration-fast placeholder:text-text-dim ' +
  'hover:border-border-hover focus:border-accent focus:bg-bg-card-solid ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const LABEL = 'text-xs font-bold text-text-muted';
const HINT = 'm-0 text-2xs text-text-dim';
const ERROR = 'm-0 text-2xs font-semibold text-error';

/**
 * Shared field wrapper: label → control → hint/error.
 */
const FieldShell = ({ id, label, hint, error, required, children }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    {label && (
      <label htmlFor={id} className={LABEL}>
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className={ERROR} role="alert">{error}</p>
    ) : hint ? (
      <p className={HINT}>{hint}</p>
    ) : null}
  </div>
);

/**
 * AdminInput — text/number/date/email input with label + validation.
 */
export const AdminInput = ({
  label,
  hint,
  error,
  type = 'text',
  className,
  id: idProp,
  required,
  ...rest
}) => {
  const autoId = useId();
  const id = idProp || autoId;
  const isNumber = type === 'number';

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        type={type}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={clsx(
          CONTROL,
          error && 'border-error/60 focus:border-error',
          isNumber &&
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          className
        )}
        {...rest}
      />
    </FieldShell>
  );
};

/**
 * AdminSelect — native select styled to match inputs.
 *
 * @param {Array<{value:string,label:string}>} props.options
 */
export const AdminSelect = ({
  label,
  hint,
  error,
  options = [],
  className,
  id: idProp,
  required,
  children,
  ...rest
}) => {
  const autoId = useId();
  const id = idProp || autoId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={clsx(CONTROL, 'cursor-pointer', error && 'border-error/60', className)}
        {...rest}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
    </FieldShell>
  );
};

/**
 * AdminTextarea — multi-line input with label + validation.
 */
export const AdminTextarea = ({
  label,
  hint,
  error,
  rows = 3,
  className,
  id: idProp,
  required,
  ...rest
}) => {
  const autoId = useId();
  const id = idProp || autoId;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={clsx(CONTROL, 'resize-y min-h-[5rem]', error && 'border-error/60', className)}
        {...rest}
      />
    </FieldShell>
  );
};

/**
 * AdminCheckbox — accent-colored checkbox with inline label.
 */
export const AdminCheckbox = ({ label, className, id: idProp, ...rest }) => {
  const autoId = useId();
  const id = idProp || autoId;

  return (
    <label
      htmlFor={id}
      className={clsx(
        'inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-text-main',
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="w-4 h-4 shrink-0 accent-accent cursor-pointer"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
};

export default AdminInput;