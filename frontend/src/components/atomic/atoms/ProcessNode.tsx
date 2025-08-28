'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { renderFourDirectionHandles } from './HandleStyles';

interface ProcessNodeProps {
  data: {
    label: string;
    description?: string;
    processData?: any;
    [key: string]: any;
  };
  isConnectable?: boolean;
  targetPosition?: Position | Position[];
  sourcePosition?: Position | Position[];
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'process';
  size?: 'sm' | 'md' | 'lg';
  showHandles?: boolean;
  onDoubleClick?: (node: any) => void;
  selected?: boolean;
}

const variantStyles = {
  default: 'bg-white border-gray-800 text-gray-800',
  primary: 'bg-blue-50 border-blue-600 text-blue-900',
  success: 'bg-green-50 border-green-600 text-green-900',
  warning: 'bg-yellow-50 border-yellow-600 text-yellow-900',
  danger: 'bg-red-50 border-red-600 text-red-900',
  process: 'bg-blue-50 border-blue-300 text-blue-800', // 공정용 스타일
};

const sizeStyles = {
  sm: 'px-2 py-1 min-w-[80px] text-xs',
  md: 'px-4 py-3 min-w-[120px] text-sm',
  lg: 'px-6 py-4 min-w-[160px] text-base',
};

function ProcessNode({
  data,
  isConnectable = true,
  targetPosition,
  sourcePosition,
  variant,
  size,
  showHandles,
  onDoubleClick,
  selected,
}: ProcessNodeProps) {
  const finalVariant = variant || data.variant || 'process';
  const finalSize = size || data.size || 'md';
  const finalShowHandles =
    showHandles !== undefined
      ? showHandles
      : data.showHandles !== undefined
        ? data.showHandles
        : true;

  const nodeClasses = `
    ${variantStyles[finalVariant as keyof typeof variantStyles]} 
    ${sizeStyles[finalSize as keyof typeof sizeStyles]}
    border-2 rounded-lg shadow-md relative hover:shadow-lg transition-all duration-200
    hover:scale-105 cursor-pointer
  `.trim();

  const handleDoubleClick = () => {
    if (onDoubleClick) onDoubleClick({ data, selected });
  };

  return (
    <div 
      className={`${nodeClasses} ${selected ? 'border-2 border-opacity-100 shadow-lg' : ''}`}
      onDoubleClick={handleDoubleClick}
      style={{ 
        cursor: data.processData ? 'pointer' : 'default',
        pointerEvents: 'auto'
      }}
    >
      {/* 🎯 4방향 핸들 - HandleStyles.tsx 함수 사용 */}
      {finalShowHandles && renderFourDirectionHandles(isConnectable)}

      {/* 노드 내용 */}
      <div className='text-center'>
        <div
          className={`font-semibold mb-1 ${finalSize === 'lg' ? 'text-lg' : finalSize === 'sm' ? 'text-xs' : 'text-sm'}`}
        >
          {finalVariant === 'process' ? '⚙️ ' : ''}{data.label}
        </div>
        {data.description && (
          <div
            className={`text-opacity-70 ${finalSize === 'lg' ? 'text-sm' : 'text-xs'}`}
          >
            {data.description}
          </div>
        )}
        {data.processData && (
          <div className="space-y-1 mt-2">
            <div className={`text-xs text-opacity-60 ${finalSize === 'lg' ? 'text-sm' : 'text-xs'}`}>
              공정: {data.processData.process_name}
            </div>
            {data.processData.energy_source && (
              <div className={`text-xs text-opacity-60 ${finalSize === 'lg' ? 'text-sm' : 'text-xs'}`}>
                에너지: {data.processData.energy_source}
              </div>
            )}
            {data.processData.process_type && (
              <div className={`text-xs text-opacity-60 ${finalSize === 'lg' ? 'text-sm' : 'text-xs'}`}>
                유형: {data.processData.process_type}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProcessNode);
