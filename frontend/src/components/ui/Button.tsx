import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'successSoft';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'outline'
      ? 'stitch-btn stitch-btn--outline'
      : variant === 'ghost'
        ? 'stitch-btn stitch-btn--ghost'
        : variant === 'successSoft'
          ? 'stitch-btn stitch-btn--success-soft'
          : 'stitch-btn stitch-btn--primary';

  const sizeClass =
    size === 'sm'
      ? 'px-3 py-1.5 text-sm'
      : size === 'lg'
        ? 'px-6 py-3 text-lg'
        : 'px-4 py-2 text-base';

  return (
    <button className={clsx(variantClass, sizeClass, className)} {...props}>
      {children}
    </button>
  );
}
