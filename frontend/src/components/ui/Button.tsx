import React from 'react';

export function Button({
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center w-full',
        'rounded-lg px-4 py-2.5 font-medium',
        'bg-[var(--accent)] text-white',
        'hover:brightness-110 active:brightness-95',
        'shadow-[0_8px_20px_rgba(46,144,250,.35)] hover:shadow-[0_10px_26px_rgba(46,144,250,.45)]',
        'transition-[filter,box-shadow,transform] duration-150',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
