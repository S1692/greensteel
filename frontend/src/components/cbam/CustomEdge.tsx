'use client';

import React, { useMemo } from 'react';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  selected?: boolean;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  selected 
}) => {
  const [edgePath] = useMemo(() => {
    const cx = (sourceX + targetX) / 2;
    return [`M ${sourceX} ${sourceY} Q ${cx} ${sourceY} ${targetX} ${targetY}`];
  }, [sourceX, sourceY, targetX, targetY]);

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      stroke={selected ? '#3b82f6' : '#6b7280'}
      strokeWidth={selected ? 3 : 2}
      fill="none"
    />
  );
};

export default CustomEdge;
