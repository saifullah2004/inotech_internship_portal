import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefilledReadOnly?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefilledReadOnly = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          readOnly={prefilledReadOnly}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors duration-150 ${
            prefilledReadOnly
              ? 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800 text-neutral-500 cursor-not-allowed'
              : error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
              : 'focus:border-brand focus:ring-1 focus:ring-brand'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
