'use client';

import React from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

interface CustomEdgeProps extends EdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  selected?: boolean;
  data?: any;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  selected,
  data,
  source,
  target
}) => {
  const [edgePath, arrowPath, reverseArrowPath] = React.useMemo(() => {
    // React Flow 공식 문서: getBezierPath 사용으로 부드러운 곡선 생성
    const [path, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
    
    // 화살표 크기 설정
    const arrowLength = 14;
    const arrowWidth = 10;
    
    // 화살표 방향 계산 (source에서 target으로)
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const angle = Math.atan2(dy, dx);
    
    // 메인 화살표 (target 쪽에 위치)
    const arrowX = targetX - arrowLength * Math.cos(angle);
    const arrowY = targetY - arrowLength * Math.sin(angle);
    
    // 메인 화살표 경로
    const arrowPath = `M ${arrowX - arrowWidth * Math.cos(angle - Math.PI/6)} ${arrowY - arrowWidth * Math.sin(angle - Math.PI/6)} 
                       L ${targetX} ${targetY} 
                       L ${arrowX - arrowWidth * Math.cos(angle + Math.PI/6)} ${arrowY - arrowWidth * Math.sin(angle + Math.PI/6)} Z`;
    
    // 역방향 화살표 (source 쪽에 위치) - 양방향 연결 시 사용
    const reverseArrowX = sourceX + arrowLength * Math.cos(angle);
    const reverseArrowY = sourceY + arrowLength * Math.sin(angle);
    
    const reverseArrowPath = `M ${reverseArrowX - arrowWidth * Math.cos(angle - Math.PI/6)} ${reverseArrowY - arrowWidth * Math.sin(angle - Math.PI/6)} 
                              L ${sourceX} ${sourceY} 
                              L ${reverseArrowX - arrowWidth * Math.cos(angle + Math.PI/6)} ${reverseArrowY - arrowWidth * Math.sin(angle + Math.PI/6)} Z`;
    
    return [path, arrowPath, reverseArrowPath];
  }, [sourceX, sourceY, targetX, targetY]);

  // ✅ React Flow 공식 문서: 임시 엣지와 실제 엣지 구분
  const isTemporary = data?.isTemporary || false;
  const isRealEdge = data?.edgeData && !isTemporary;

  // ✅ 중복 렌더링 방지: 실제 엣지만 표시
  if (!isRealEdge && !isTemporary) {
    return null;
  }

  // 노드 타입에 따른 화살표 방향 결정
  const getArrowDirection = () => {
    if (!source || !target) return 'forward'; // 기본값
    
    const sourceType = source.startsWith('product-') ? 'product' : 
                      source.startsWith('process-') ? 'process' : 'unknown';
    const targetType = target.startsWith('product-') ? 'product' : 
                      target.startsWith('process-') ? 'process' : 'unknown';
    
    // 제품 → 공정: 순방향 화살표
    if (sourceType === 'product' && targetType === 'process') {
      return 'forward';
    }
    // 공정 → 제품: 역방향 화살표
    else if (sourceType === 'process' && targetType === 'product') {
      return 'reverse';
    }
    // 제품 ↔ 제품 또는 공정 ↔ 공정: 양방향 화살표
    else if (sourceType === targetType) {
      return 'bidirectional';
    }
    
    return 'forward'; // 기본값
  };

  const arrowDirection = getArrowDirection();

  // 색상 설정
  const strokeColor = selected ? '#3b82f6' : isTemporary ? '#6b7280' : '#64748b';
  const strokeWidth = selected ? 8 : isTemporary ? 6 : 6;

  return (
    <>
      {/* 메인 엣지 경로 */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 화살표 렌더링 */}
      {arrowDirection === 'forward' && (
        <path
          d={arrowPath}
          fill={strokeColor}
          stroke="none"
        />
      )}
      
      {arrowDirection === 'reverse' && (
        <path
          d={reverseArrowPath}
          fill={strokeColor}
          stroke="none"
        />
      )}
      
      {arrowDirection === 'bidirectional' && (
        <>
          <path
            d={arrowPath}
            fill={strokeColor}
            stroke="none"
          />
          <path
            d={reverseArrowPath}
            fill={strokeColor}
            stroke="none"
          />
        </>
      )}
    </>
  );
};

export default CustomEdge;
