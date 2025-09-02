import React from 'react';

interface CBAMTabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const CBAMTabButton: React.FC<CBAMTabButtonProps> = ({
  isActive,
  onClick,
  children
}) => {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-ecotrace-textSecondary hover:text-ecotrace-text hover:border-ecotrace-border'
      }`}
    >
      {children}
    </button>
  );
};
