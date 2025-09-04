'use client';

import { useState, useEffect } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Button } from '@/components/ui/Button';
import { 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  X,
  Database,
  Package,
  Truck,
  Factory
} from 'lucide-react';

// 데이터 인터페이스
interface InputData {
  id: number;
  로트번호: string;
  생산품명: string;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  주문처명?: string;
  오더번호?: string;
}

interface OutputData {
  id: number;
  로트번호: string;
  생산품명: string;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  산출물명: string;
  수량: number;
  단위: string;
  주문처명?: string;
  오더번호?: string;
}

interface TransportData {
  id: number;
  생산품명: string;
  로트번호: string;
  운송물질: string;
  운송수량: number;
  운송일자: string;
  도착공정: string;
  출발지: string;
  이동수단: string;
  주문처명?: string;
  오더번호?: string;
}

interface ProcessData {
  id: number;
  공정명: string;
  생산제품: string;
  세부공정: string;
  공정설명: string;
  '공정 설명'?: string;
  created_at?: string;
  updated_at?: string;
}

// 삭제 로그 인터페이스
interface DeleteLog {
  id: string;
  tableName: string;
  columnName: string;
  deletedData: any;
  deletedAt: string;
  deletedBy: string;
}

export default function DataDeletePage() {
  const [inputData, setInputData] = useState<InputData[]>([]);
  const [outputData, setOutputData] = useState<OutputData[]>([]);
  const [transportData, setTransportData] = useState<TransportData[]>([]);
  const [processData, setProcessData] = useState<ProcessData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 삭제 로그 저장 함수
  const saveDeleteLog = (tableName: string, columnName: string, deletedData: any) => {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('data_delete_logs') || '[]');
      const newLog: DeleteLog = {
        id: Date.now().toString(),
        tableName,
        columnName,
        deletedData,
        deletedAt: new Date().toISOString(),
        deletedBy: 'user' // 실제로는 사용자 정보를 가져와야 함
      };
      
      existingLogs.push(newLog);
      localStorage.setItem('data_delete_logs', JSON.stringify(existingLogs));
      console.log('✅ 삭제 로그 저장 완료:', newLog);
    } catch (error) {
      console.error('❌ 삭제 로그 저장 실패:', error);
    }
  };

  // 데이터 로드 함수
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      
      // 모든 데이터를 병렬로 로드
      const [inputResponse, outputResponse, transportResponse, processResponse] = await Promise.all([
        fetch(`${gatewayUrl}/api/datagather/input-data`),
        fetch(`${gatewayUrl}/api/datagather/output-data`),
        fetch(`${gatewayUrl}/api/datagather/transport-data`),
        fetch(`${gatewayUrl}/api/datagather/process-data`)
      ]);

      if (inputResponse.ok) {
        const inputResult = await inputResponse.json();
        setInputData(inputResult.success ? inputResult.data : []);
      }

      if (outputResponse.ok) {
        const outputResult = await outputResponse.json();
        setOutputData(outputResult.success ? outputResult.data : []);
      }

      if (transportResponse.ok) {
        const transportResult = await transportResponse.json();
        setTransportData(transportResult.success ? transportResult.data : []);
      }

      if (processResponse.ok) {
        const processResult = await processResponse.json();
        setProcessData(processResult.success ? processResult.data : []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 삭제 함수들
  const deleteInputData = async (id: number) => {
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/api/datagather/input-data/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const deletedItem = inputData.find(item => item.id === id);
        if (deletedItem) {
          saveDeleteLog('input_data', 'id', deletedItem);
        }
        setInputData(prev => prev.filter(item => item.id !== id));
        setSuccessMessage('투입물 데이터가 삭제되었습니다.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('삭제에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const deleteOutputData = async (id: number) => {
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/api/datagather/output-data/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const deletedItem = outputData.find(item => item.id === id);
        if (deletedItem) {
          saveDeleteLog('output_data', 'id', deletedItem);
        }
        setOutputData(prev => prev.filter(item => item.id !== id));
        setSuccessMessage('산출물 데이터가 삭제되었습니다.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('삭제에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const deleteTransportData = async (id: number) => {
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/api/datagather/transport-data/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const deletedItem = transportData.find(item => item.id === id);
        if (deletedItem) {
          saveDeleteLog('transport_data', 'id', deletedItem);
        }
        setTransportData(prev => prev.filter(item => item.id !== id));
        setSuccessMessage('운송 데이터가 삭제되었습니다.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('삭제에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const deleteProcessData = async (id: number) => {
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
      const response = await fetch(`${gatewayUrl}/api/datagather/process-data/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const deletedItem = processData.find(item => item.id === id);
        if (deletedItem) {
          saveDeleteLog('process_data', 'id', deletedItem);
        }
        setProcessData(prev => prev.filter(item => item.id !== id));
        setSuccessMessage('공정 데이터가 삭제되었습니다.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('삭제에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <CommonShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ecotrace-text">데이터 삭제 관리</h1>
          <p className="text-ecotrace-text-secondary mt-2">
            업로드된 데이터를 삭제하고 삭제 로그를 관리합니다.
          </p>
        </div>

        {/* 상단 컨트롤 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={loadData}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '로딩 중...' : '새로고침'}
            </Button>
          </div>
        </div>

        {/* 성공/에러 메시지 */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-400">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* 테이블 형식 레이아웃 */}
        <div className="space-y-8">
          {/* 투입물 데이터 테이블 */}
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-ecotrace-border">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-ecotrace-text">투입물 데이터</h2>
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {inputData.length}개
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ecotrace-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산품명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입물명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-ecotrace-textSecondary">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ecotrace-border">
                  {inputData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-ecotrace-textSecondary">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    inputData.map((item) => (
                      <tr key={item.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.id}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.로트번호 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.생산품명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.투입물명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.단위 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.투입일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.종료일 || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => deleteInputData(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 산출물 데이터 테이블 */}
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-ecotrace-border">
              <Package className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-ecotrace-text">산출물 데이터</h2>
              <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                {outputData.length}개
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ecotrace-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산품명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">산출물명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">수량</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">단위</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">투입일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">종료일</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-ecotrace-textSecondary">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ecotrace-border">
                  {outputData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-ecotrace-textSecondary">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    outputData.map((item) => (
                      <tr key={item.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.id}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.로트번호 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.생산품명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.산출물명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.단위 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.투입일 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.종료일 || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => deleteOutputData(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 운송 데이터 테이블 */}
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-ecotrace-border">
              <Truck className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-ecotrace-text">운송 데이터</h2>
              <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full">
                {transportData.length}개
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ecotrace-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산품명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">로트번호</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송물질</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송수량</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">운송일자</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">도착공정</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">출발지</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-ecotrace-textSecondary">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ecotrace-border">
                  {transportData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-ecotrace-textSecondary">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    transportData.map((item) => (
                      <tr key={item.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.id}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.생산품명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.로트번호 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.운송물질 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.운송수량 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.운송일자 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.도착공정 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.출발지 || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => deleteTransportData(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 공정 데이터 테이블 */}
          <div className="bg-ecotrace-surface border border-ecotrace-border rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-ecotrace-border">
              <Factory className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-ecotrace-text">공정 데이터</h2>
              <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
                {processData.length}개
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ecotrace-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">생산제품</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">세부공정</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ecotrace-textSecondary">공정설명</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-ecotrace-textSecondary">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ecotrace-border">
                  {processData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-ecotrace-textSecondary">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    processData.map((item) => (
                      <tr key={item.id} className="hover:bg-ecotrace-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.id}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.공정명 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.생산제품 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item.세부공정 || '-'}</td>
                        <td className="px-4 py-3 text-sm text-ecotrace-text">{item['공정 설명'] || item.공정설명 || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => deleteProcessData(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </CommonShell>
  );
}
