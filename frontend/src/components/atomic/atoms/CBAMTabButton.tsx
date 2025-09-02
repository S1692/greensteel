import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CBAMTabButtonProps {
  id: 'overview' | 'install' | 'boundary' | 'reports' | 'settings';
  name: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: (id: 'overview' | 'install' | 'boundary' | 'reports' | 'settings') => void;
}

export const CBAMTabButton: React.FC<CBAMTabButtonProps> = ({
  id,
  name,
  icon: Icon,
  isActive,
  onClick
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{name}</span>
    </button>
  );
};
