'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Settings } from 'lucide-react';

interface ProcessNodeData {
  id: number;
  name: string;
  description?: string;
  processData?: {
    attr_em?: number;
    total_matdir_emission?: number;
    total_fueldir_emission?: number;
    calculation_date?: string;
  };
  showHandles?: boolean;
  onDoubleClick?: (processData: any) => void;
}

const ProcessNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as any;
  
  const handleDoubleClick = () => {
    if (nodeData.onDoubleClick) {
      nodeData.onDoubleClick(nodeData);
    }
  };
  
  return (
    <div 
      className={`bg-white text-gray-800 p-4 rounded-lg border-2 min-w-[280px] cursor-pointer shadow-lg ${
        selected ? 'border-yellow-400 shadow-lg' : 'border-blue-500'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {/* 입력 핸들들 */}
      {nodeData.showHandles && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            className="w-3 h-3 bg-white border-2 border-green-600"
          />
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            className="w-3 h-3 bg-white border-2 border-green-600"
          />
        </>
      )}
      
      {/* 출력 핸들들 */}
      {data.showHandles && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="w-3 h-3 bg-white border-2 border-green-600"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            className="w-3 h-3 bg-white border-2 border-green-600"
          />
        </>
      )}
      
        {/* 노드 내용 */}
        <div className="flex items-center space-x-2 mb-3">
          <Settings className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-sm text-blue-800">공정: {nodeData.name}</h3>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">시작일:</span>
            <span className="font-medium">N/A</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">종료일:</span>
            <span className="font-medium">N/A</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">직접귀속배출량:</span>
            <span className="font-medium text-red-600">
              {(nodeData.processData?.attr_em || nodeData.attrdir_em || 0).toFixed(2)} tCO2e
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">누적 직접귀속배출량:</span>
            <span className="font-medium text-red-600">
              {(nodeData.processData?.cumulative_emission || nodeData.cumulative_emission || 0).toFixed(2)} tCO2e
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">원료직접:</span>
            <span className="font-medium text-red-600">
              {(nodeData.processData?.total_matdir_emission || nodeData.total_matdir_emission || 0).toFixed(2)} tCO2e
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">연료직접:</span>
            <span className="font-medium text-red-600">
              {(nodeData.processData?.total_fueldir_emission || nodeData.total_fueldir_emission || 0).toFixed(2)} tCO2e
            </span>
          </div>
        </div>
        
        {/* 투입량 입력 버튼 */}
        <div className="mt-3 pt-2 border-t border-gray-300">
          <button 
            className="w-full bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 transition-colors"
            onClick={handleDoubleClick}
          >
            투입량 입력
          </button>
        </div>
    </div>
  );
});

ProcessNode.displayName = 'ProcessNode';

export default ProcessNode;
