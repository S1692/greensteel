'use client';

import React from 'react';
import { renderFourDirectionHandles } from './HandleStyles';

interface ProductNodeData {
  label: string;
  description: string;
  variant: string;
  productData: any;
  name: string;
  type: string;
  parameters: {
    product_id: string;
    cn_code: string;
    production_qty: number;
    sales_qty: number;
    export_qty: number;
    inventory_qty: number;
    defect_rate: number;
    period_start: string;
    period_end: string;
  };
  status: string;
}

interface ProductNodeProps {
  data: ProductNodeData;
  selected?: boolean;
}

const ProductNode: React.FC<ProductNodeProps> = ({ data, selected }) => {
  return (
    <div 
      className={`p-4 rounded-lg border-2 min-w-[200px] transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-purple-300'
      } bg-purple-50 text-purple-800 relative`}
      style={{ pointerEvents: 'auto' }}
    >
      {/* 4방향 핸들 렌더링 */}
      {renderFourDirectionHandles(true)}
      
      {/* 노드 내용 */}
      <div className="text-center">
        <div className="font-semibold text-lg mb-2">📦 {data.label}</div>
        <div className="text-sm text-purple-600 mb-2">{data.description}</div>
        
        {/* 제품 정보 */}
        {data.productData && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>생산량:</span>
              <span className="font-medium">{data.productData.production_qty || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>수출량:</span>
              <span className="font-medium">{data.productData.export_qty || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>CN 코드:</span>
              <span className="font-medium">{data.productData.cn_code || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>상태:</span>
              <span className={`font-medium ${
                data.status === 'active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.status === 'active' ? '활성' : '비활성'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductNode;
