'use client';

import { useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';

// ============================================================================
// 🎯 React Flow 백엔드 연동 훅 (Mock 버전)
// ============================================================================

export const useReactFlowAPI = () => {
  // ============================================================================
  // 🎯 플로우 관리 API (Mock 구현)
  // ============================================================================

  const createFlow = useCallback(async (data: any): Promise<any | null> => {
    console.log('Mock: 플로우 생성', data);
    return {
      id: `flow-${Date.now()}`,
      name: data.name,
      description: data.description,
      viewport: { x: 0, y: 0, zoom: 1 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  const getFlowState = useCallback(
    async (flowId: string): Promise<any | null> => {
      console.log('Mock: 플로우 상태 조회', flowId);
      return {
        flow: {
          id: flowId,
          name: '기존 플로우',
          description: '로드된 플로우',
          viewport: { x: 0, y: 0, zoom: 1 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        nodes: [],
        edges: [],
      };
    },
    []
  );

  const updateFlow = useCallback(
    async (flowId: string, data: any): Promise<any | null> => {
      console.log('Mock: 플로우 업데이트', flowId, data);
      return {
        id: flowId,
        ...data,
        updated_at: new Date().toISOString(),
      };
    },
    []
  );

  const deleteFlow = useCallback(async (flowId: string): Promise<boolean> => {
    console.log('Mock: 플로우 삭제', flowId);
    return true;
  }, []);

  // ============================================================================
  // 🎯 노드 관리 API (Mock 구현)
  // ============================================================================

  const createNode = useCallback(async (data: any): Promise<any | null> => {
    console.log('Mock: 노드 생성', data);
    return {
      id: data.node_id,
      flow_id: data.flow_id,
      node_id: data.node_id,
      type: data.type,
      position: data.position,
      data: data.data,
      width: data.width,
      height: data.height,
      style: data.style,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  const updateNode = useCallback(
    async (nodeId: string, data: any): Promise<any | null> => {
      console.log('Mock: 노드 업데이트', nodeId, data);
      return {
        id: nodeId,
        ...data,
        updated_at: new Date().toISOString(),
      };
    },
    []
  );

  const deleteNode = useCallback(async (nodeId: string): Promise<boolean> => {
    console.log('Mock: 노드 삭제', nodeId);
    return true;
  }, []);

  // ============================================================================
  // 🎯 엣지 관리 API (Mock 구현)
  // ============================================================================

  const createEdge = useCallback(async (data: any): Promise<any | null> => {
    console.log('Mock: 엣지 생성', data);
    return {
      id: data.edge_id,
      flow_id: data.flow_id,
      edge_id: data.edge_id,
      source: data.source,
      target: data.target,
      source_handle: data.source_handle,
      target_handle: data.target_handle,
      type: data.type,
      data: data.data,
      style: data.style,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  const updateEdge = useCallback(
    async (edgeId: string, data: any): Promise<any | null> => {
      console.log('Mock: 엣지 업데이트', edgeId, data);
      return {
        id: edgeId,
        ...data,
        updated_at: new Date().toISOString(),
      };
    },
    []
  );

  const deleteEdge = useCallback(async (edgeId: string): Promise<boolean> => {
    console.log('Mock: 엣지 삭제', edgeId);
    return true;
  }, []);

  // ============================================================================
  // 🎯 뷰포트 관리 API (Mock 구현)
  // ============================================================================

  const updateViewport = useCallback(async (data: any): Promise<boolean> => {
    console.log('Mock: 뷰포트 업데이트', data);
    return true;
  }, []);

  // ============================================================================
  // 🎯 배치 작업 API (Mock 구현)
  // ============================================================================

  const saveFlowState = useCallback(
    async (
      flowId: string,
      nodes: Node[],
      edges: Edge[],
      viewport: { x: number; y: number; zoom: number }
    ): Promise<boolean> => {
      try {
        console.log('Mock: 플로우 상태 저장', {
          flowId,
          nodes,
          edges,
          viewport,
        });

        // 뷰포트 업데이트
        await updateViewport({ flow_id: flowId, viewport });

        // 노드/엣지 저장 (실제로는 더 복잡한 로직 필요)
        const nodePromises = nodes.map(node =>
          createNode({
            flow_id: flowId,
            node_id: node.id,
            type: node.type || 'default',
            position: node.position,
            data: node.data,
            width: node.width,
            height: node.height,
            style: node.style,
          })
        );

        const edgePromises = edges.map(edge =>
          createEdge({
            flow_id: flowId,
            edge_id: edge.id,
            source: edge.source,
            target: edge.target,
            source_handle: edge.sourceHandle || undefined,
            target_handle: edge.targetHandle || undefined,
            type: edge.type,
            data: edge.data,
            style: edge.style,
          })
        );

        await Promise.all([...nodePromises, ...edgePromises]);
        return true;
      } catch (error) {
        console.error('Mock: 플로우 상태 저장 실패:', error);
        return false;
      }
    },
    [updateViewport, createNode, createEdge]
  );

  // ============================================================================
  // 🎯 데이터 변환 유틸리티
  // ============================================================================

  const convertBackendToFrontend = useCallback((backendState: any) => {
    const nodes: Node[] = backendState.nodes.map((nodeData: any) => ({
      id: nodeData.node_id,
      type: nodeData.type,
      position: nodeData.position,
      data: nodeData.data,
      width: nodeData.width,
      height: nodeData.height,
      style: nodeData.style,
    }));

    const edges: Edge[] = backendState.edges.map((edgeData: any) => ({
      id: edgeData.edge_id,
      source: edgeData.source,
      target: edgeData.target,
      sourceHandle: edgeData.source_handle,
      targetHandle: edgeData.target_handle,
      type: edgeData.type,
      data: edgeData.data,
      style: edgeData.style,
    }));

    return {
      flowId: backendState.flow.id,
      flow: backendState.flow,
      nodes,
      edges,
      viewport: backendState.flow.viewport,
    };
  }, []);

  return {
    // 플로우 관리
    createFlow,
    getFlowState,
    updateFlow,
    deleteFlow,

    // 노드 관리
    createNode,
    updateNode,
    deleteNode,

    // 엣지 관리
    createEdge,
    updateEdge,
    deleteEdge,

    // 뷰포트 관리
    updateViewport,

    // 배치 작업
    saveFlowState,

    // 유틸리티
    convertBackendToFrontend,
  };
};
