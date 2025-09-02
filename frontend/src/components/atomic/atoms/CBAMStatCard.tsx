import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CBAMStatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

export const CBAMStatCard: React.FC<CBAMStatCardProps> = ({
  icon: Icon,
  title,
  value,
  bgColor,
  iconColor,
  borderColor
}) => {
  return (
    <div className={`bg-ecotrace-surface rounded-lg p-6 border ${borderColor} hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-ecotrace-textSecondary">{title}</p>
          <p className="text-2xl font-bold text-ecotrace-text">{value}</p>
        </div>
      </div>
    </div>
  );
};
