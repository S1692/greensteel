'use client';

import React from 'react';
import { cn } from '@/lib';

interface TabItem {
  key: string;
  label: string;
}

interface TabsProps<T extends string = string> {
  items: TabItem[];
  value?: T;
  onChange?: (key: T) => void;
  variant?: 'default' | 'underline' | 'pills';
  className?: string;
}

const Tabs = <T extends string = string>({
  items,
  value,
  onChange,
  variant = 'default',
  className
}: TabsProps<T>) => {
  const [internalValue, setInternalValue] = React.useState<T>(items[0]?.key as T);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleTabClick = (key: string) => {
    if (onChange) {
      onChange(key as T);
    } else {
      setInternalValue(key as T);
    }
  };

  const variants = {
    default: {
      container: 'flex space-x-1 bg-gray-100 rounded-lg p-1',
      tab: 'px-3 py-2 text-sm font-medium rounded-md transition-colors',
      active: 'bg-white text-gray-900 shadow-sm',
      inactive: 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
    },
    underline: {
      container: 'flex space-x-1 bg-gray-900 rounded-lg p-1',
      tab: 'px-4 py-2 text-sm font-medium rounded-md transition-colors',
      active: 'bg-gray-700 text-white shadow-sm',
      inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
    },
    pills: {
      container: 'flex flex-wrap gap-2',
      tab: 'px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap',
      active: 'bg-blue-600 text-white',
      inactive: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={cn('w-full', className)}>
      <div className={currentVariant.container}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabClick(item.key)}
            className={cn(
              currentVariant.tab,
              currentValue === item.key ? currentVariant.active : currentVariant.inactive
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
