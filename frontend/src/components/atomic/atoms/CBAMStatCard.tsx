import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CBAMStatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  bgColor: string;
  iconColor: string;
}

export const CBAMStatCard: React.FC<CBAMStatCardProps> = ({
  icon: Icon,
  title,
  value,
  bgColor,
  iconColor
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};
