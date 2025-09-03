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
      className={`bg-green-600 text-white p-4 rounded-lg border-2 min-w-[180px] cursor-pointer ${
        selected ? 'border-yellow-400 shadow-lg' : 'border-green-700'
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
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="h-5 w-5" />
          <h3 className="font-semibold text-sm">공정</h3>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="font-medium">{nodeData.name}</div>
          {nodeData.description && (
            <div className="text-green-200">{nodeData.description}</div>
          )}
          
          {/* 배출량 정보 */}
          {nodeData.processData && (
            <div className="mt-2 pt-2 border-t border-green-500">
              <div className="text-green-200">직접귀속: {nodeData.processData.attr_em || 0}</div>
              <div className="text-green-200">투입물: {nodeData.processData.total_matdir_emission || 0}</div>
              <div className="text-green-200">연료: {nodeData.processData.total_fueldir_emission || 0}</div>
            </div>
          )}
        </div>
    </div>
  );
});

ProcessNode.displayName = 'ProcessNode';

export default ProcessNode;
