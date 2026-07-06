'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export type PasswordInputVariant = 'student' | 'admin';

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: PasswordInputVariant;
  visible?: boolean;
}

export interface ShowPasswordCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: PasswordInputVariant;
  disabled?: boolean;
}

const variantStyles = {
  student: {
    input: 'input-field',
    checkbox:
      'flex cursor-pointer select-none items-center gap-2 text-xs text-slate-600',
    checkboxInput:
      'h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60',
  },
  admin: {
    input:
      'w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-primary placeholder:text-admin-muted/60 focus:outline-none focus:ring-2 focus:ring-admin-accent/30 disabled:cursor-not-allowed disabled:opacity-60',
    checkbox:
      'flex cursor-pointer select-none items-center gap-2 text-2xs text-admin-muted',
    checkboxInput:
      'h-3.5 w-3.5 shrink-0 rounded border-admin-border text-admin-accent focus:ring-admin-accent/20 disabled:cursor-not-allowed disabled:opacity-60',
  },
} as const;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { variant = 'student', visible = false, disabled, className, id, ...props },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const styles = variantStyles[variant];

    return (
      <input
        ref={ref}
        id={inputId}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={className ?? styles.input}
        {...props}
      />
    );
  },
);

export function ShowPasswordCheckbox({
  id,
  checked,
  onChange,
  variant = 'student',
  disabled = false,
}: ShowPasswordCheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? `${generatedId}-show-password`;
  const styles = variantStyles[variant];

  return (
    <label htmlFor={checkboxId} className={styles.checkbox}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className={styles.checkboxInput}
      />
      Show password
    </label>
  );
}
