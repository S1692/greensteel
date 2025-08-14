import React from 'react';

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        'w-full rounded-lg px-3 py-2.5',
        'bg-[#1a1f26] text-[var(--text-1)] placeholder-[var(--text-muted)]',
        'border border-[rgba(255,255,255,.08)]',
        'outline-none focus:ring-4 focus:ring-[var(--focus)] focus:border-[var(--accent)]',
        'transition-colors',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
