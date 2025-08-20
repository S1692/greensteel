import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'successSoft';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
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

  return (
    <button className={clsx(variantClass, className)} {...props}>
      {children}
    </button>
  );
}
