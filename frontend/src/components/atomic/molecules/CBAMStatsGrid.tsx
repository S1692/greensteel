import React from 'react';
import { Factory, Package, Settings, MapPin } from 'lucide-react';
import { CBAMStatCard } from '../atoms/CBAMStatCard';

interface CBAMStatsGridProps {
  installs: any[];
  products: any[];
  processes: any[];
  mappings: any[];
}

export const CBAMStatsGrid: React.FC<CBAMStatsGridProps> = ({
  installs,
  products,
  processes,
  mappings
}) => {
  const stats = [
    {
      icon: Factory,
      title: '사업장',
      value: installs.length,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      icon: Package,
      title: '제품',
      value: products.length,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      icon: Settings,
      title: '공정',
      value: processes.length,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      icon: MapPin,
      title: '매핑',
      value: mappings.length,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <CBAMStatCard key={index} {...stat} />
      ))}
    </div>
  );
};
