'use client';

import type { ChangeEvent, FocusEvent } from 'react';
import { DEFAULT_COUNTRY_CODE } from './formatPhone';

export interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (mobile: string) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  id = 'mobile',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  className,
}: PhoneInputProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? `${hintId} ${errorId}` : hintId;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(digits);
  };

  return (
    <div className={className}>
      <div
        className={`flex overflow-hidden rounded-xl border bg-white transition focus-within:ring-2 ${
          error
            ? 'border-red-300 focus-within:border-red-400 focus-within:ring-red-100'
            : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-indigo-500/20'
        } ${disabled ? 'opacity-60' : ''}`}
      >
        <span
          className="inline-flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-700"
          aria-label="Country code plus nine one"
        >
          {DEFAULT_COUNTRY_CODE}
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={10}
          placeholder="9876543210"
          aria-label="Mobile number"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      <p id={hintId} className="mt-1.5 text-xs text-slate-500">
        Enter 10-digit mobile without country code
      </p>

      {error ? (
        <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
