'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Package, Plus, Settings } from 'lucide-react';

interface ProductNodeData {
  id?: number;
  name?: string;
  label?: string;
  category?: string;
  quantity?: number;
  showHandles?: boolean;
  onAddProcess?: (productData: any) => void;
  onEditProduct?: (productData: any) => void;
  [key: string]: any; // 추가 속성들을 허용
}

const ProductNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as ProductNodeData;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // 우클릭 메뉴 표시
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 공정 노드 추가
  const handleAddProcess = () => {
    if (nodeData.onAddProcess) {
      nodeData.onAddProcess(nodeData);
    }
    setShowContextMenu(false);
  };

  // 제품 편집
  const handleEditProduct = () => {
    if (nodeData.onEditProduct) {
      nodeData.onEditProduct(nodeData);
    }
    setShowContextMenu(false);
  };

  return (
    <>
      <div 
        className={`bg-blue-600 text-white p-4 rounded-lg border-2 min-w-[150px] cursor-pointer ${
          selected ? 'border-yellow-400 shadow-lg' : 'border-blue-700'
        }`}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleAddProcess}
      >
        {/* 입력 핸들들 */}
        {Boolean(nodeData.showHandles) && (
          <>
            <Handle
              type="target"
              position={Position.Top}
              id="top"
              className="w-3 h-3 bg-white border-2 border-blue-600"
            />
            <Handle
              type="target"
              position={Position.Left}
              id="left"
              className="w-3 h-3 bg-white border-2 border-blue-600"
            />
          </>
        )}
        
        {/* 출력 핸들들 */}
        {Boolean(data.showHandles) && (
          <>
            <Handle
              type="source"
              position={Position.Right}
              id="right"
              className="w-3 h-3 bg-white border-2 border-blue-600"
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id="bottom"
              className="w-3 h-3 bg-white border-2 border-blue-600"
            />
          </>
        )}
        
        {/* 노드 내용 */}
        <div className="flex items-center space-x-2 mb-2">
          <Package className="h-5 w-5" />
          <h3 className="font-semibold text-sm">제품</h3>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="font-medium">{nodeData.name || nodeData.label || '제품명 없음'}</div>
          {nodeData.category && (
            <div className="text-blue-200">카테고리: {nodeData.category}</div>
          )}
          {nodeData.quantity !== undefined && (
            <div className="text-blue-200">수량: {nodeData.quantity}</div>
          )}
        </div>

        {/* 더블클릭 안내 */}
        <div className="text-xs text-blue-200 mt-2 opacity-60">
          더블클릭: 공정 추가
        </div>
      </div>

      {/* 우클릭 컨텍스트 메뉴 */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px]"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button
            onClick={handleAddProcess}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4 text-blue-600" />
            <span>공정 노드 추가</span>
          </button>
          <button
            onClick={handleEditProduct}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-2"
          >
            <Settings className="h-4 w-4 text-gray-600" />
            <span>제품 편집</span>
          </button>
        </div>
      )}
    </>
  );
});

ProductNode.displayName = 'ProductNode';

export default ProductNode;
