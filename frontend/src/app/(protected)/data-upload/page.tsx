'use client';

import { useState, useRef } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Upload, FileText, Database, Brain, CheckCircle, AlertCircle, ArrowRight, Download, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/atomic/atoms';
import { Input } from '@/components/atomic/atoms';
import TabGroup from '@/components/atomic/molecules/TabGroup';
import { parseExcel, createColumns } from '@/lib';

type TabKey = 'standard' | 'actual' | 'classification' | 'transport' | 'process';

interface TabState {
  rows: Record<string, any>[];
  columns: { key: string; header: string }[];
  fileName?: string;
}

interface TabConfig {
  id: TabKey;
  label: string;
  subtitle: string;
  templateUrl: string;
}

const DataUploadPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>('standard');
  const [data, setData] = useState<Record<TabKey, TabState>>({
    standard: { rows: [], columns: [] },
    actual: { rows: [], columns: [] },
    classification: { rows: [], columns: [] },
    transport: { rows: [], columns: [] },
    process: { rows: [], columns: [] }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const fileRefs = useRef<Record<TabKey, HTMLInputElement | null>>({
    standard: null,
    actual: null,
    classification: null,
    transport: null,
    process: null
  });

  const tabConfigs: TabConfig[] = [
    { id: 'standard', label: '기준정보', subtitle: '(기준 정보)', templateUrl: '/api/templates?type=standard' },
    { id: 'actual', label: '실적정보', subtitle: '(실적 데이터)', templateUrl: '/api/templates?type=actual' },
    { id: 'classification', label: '데이터분류', subtitle: '(분류 데이터)', templateUrl: '/api/templates?type=classification' },
    { id: 'transport', label: '운송정보', subtitle: '(운송 데이터)', templateUrl: '/api/templates?type=transport' },
    { id: 'process', label: '공정정보', subtitle: '(공정 데이터)', templateUrl: '/api/templates?type=process' }
  ];

  const handleFileUpload = async (file: File, tabKey: TabKey) => {
    setIsProcessing(true);
    
    try {
      const result = await parseExcel(file);
      const columns = createColumns(result.headers);
      
      setData(prev => ({
        ...prev,
        [tabKey]: {
          rows: result.rows,
          columns: columns,
          fileName: file.name
        }
      }));
      
      setToast({
        message: `${tabConfigs.find(t => t.id === tabKey)?.label} 파일이 성공적으로 업로드되었습니다!`,
        type: 'success'
      });
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      setToast({
        message: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, tabKey: TabKey) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, tabKey);
    }
  };

  const handleUploadClick = (tabKey: TabKey) => {
    if (fileRefs.current[tabKey]) {
      fileRefs.current[tabKey]?.click();
    }
  };

  const addRow = (tabKey: TabKey) => {
    const currentData = data[tabKey];
    if (currentData.columns.length === 0) return;

    const newRow: Record<string, any> = {};
    currentData.columns.forEach(col => {
      newRow[col.key] = '';
    });

    setData(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        rows: [...prev[tabKey].rows, newRow]
      }
    }));
  };

  const deleteRow = (tabKey: TabKey, rowIndex: number) => {
    setData(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        rows: prev[tabKey].rows.filter((_, index) => index !== rowIndex)
      }
    }));
  };

  const updateCell = (tabKey: TabKey, rowIndex: number, columnKey: string, value: string) => {
    setData(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        rows: prev[tabKey].rows.map((row, index) => 
          index === rowIndex ? { ...row, [columnKey]: value } : row
        )
      }
    }));
  };

  const handleSave = (tabKey: TabKey) => {
    const currentData = data[tabKey];
    if (currentData.rows.length === 0) {
      setToast({
        message: '저장할 데이터가 없습니다.',
        type: 'error'
      });
      return;
    }

    // Mock 저장 처리
    setToast({
      message: `${tabConfigs.find(t => t.id === tabKey)?.label} 데이터가 저장되었습니다!`,
      type: 'success'
    });
  };

  const handleConfirm = (tabKey: TabKey) => {
    const currentData = data[tabKey];
    if (currentData.rows.length === 0) {
      setToast({
        message: '확인할 데이터가 없습니다.',
        type: 'error'
      });
      return;
    }

    // Mock 확인 처리
    setToast({
      message: `${tabConfigs.find(t => t.id === tabKey)?.label} 데이터 확인이 완료되었습니다!`,
      type: 'success'
    });
  };

  const renderStandardActualTab = (tabKey: TabKey) => {
    const currentData = data[tabKey];
    const tabConfig = tabConfigs.find(t => t.id === tabKey);

    return (
      <div className="space-y-4">
        {/* 상단 정보 */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{tabConfig?.label}</h3>
            <p className="text-sm text-gray-600">{tabConfig?.subtitle}</p>
          </div>
          {currentData.fileName && (
            <div className="text-sm text-gray-500">
              파일: {currentData.fileName} ({currentData.rows.length}행)
            </div>
          )}
        </div>

        {/* 템플릿 다운로드 및 업로드 */}
        <div className="flex items-center space-x-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <a href={tabConfig?.templateUrl} download>
              <Download className="w-4 h-4" />
              <span>템플릿 다운로드</span>
            </a>
          </Button>

          <Button
            onClick={() => handleUploadClick(tabKey)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? '처리 중...' : '파일 업로드'}</span>
          </Button>

          <input
            ref={(el) => { fileRefs.current[tabKey] = el; }}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFileChange(e, tabKey)}
            className="hidden"
          />
        </div>

        {/* 데이터 테이블 */}
        {currentData.rows.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">데이터 미리보기</h4>
              <Button
                onClick={() => addRow(tabKey)}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>행 추가</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {currentData.columns.map((col, index) => (
                      <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        {col.header}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {currentData.columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 border-b border-gray-200">
                          <Input
                            value={row[col.key] || ''}
                            onChange={(e) => updateCell(tabKey, rowIndex, col.key, e.target.value)}
                            inputSize="sm"
                            className="w-full"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 border-b border-gray-200">
                        <Button
                          onClick={() => deleteRow(tabKey, rowIndex)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="flex justify-end space-x-3 pt-3">
              <Button
                onClick={() => handleSave(tabKey)}
                disabled={currentData.rows.length === 0}
                variant="outline"
                size="sm"
              >
                저장
              </Button>
              <Button
                onClick={() => handleConfirm(tabKey)}
                disabled={currentData.rows.length === 0}
                size="sm"
              >
                확인
              </Button>
            </div>
          </div>
        )}

        {/* 업로드 안내 */}
        {currentData.rows.length === 0 && (
          <div className="text-center py-8">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">파일을 업로드하여 데이터를 시작하세요</p>
            <p className="text-sm text-gray-400">CSV, Excel 파일을 지원합니다</p>
          </div>
        )}
      </div>
    );
  };

  const renderClassificationTab = () => {
    const currentData = data.classification;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">데이터분류</h3>
            <p className="text-sm text-gray-600">(분류 데이터)</p>
          </div>
          {currentData.fileName && (
            <div className="text-sm text-gray-500">
              파일: {currentData.fileName} ({currentData.rows.length}행)
            </div>
          )}
        </div>

        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">데이터분류는 읽기 전용입니다</p>
          <p className="text-sm text-gray-400">업로드된 데이터를 분류 기준에 따라 조회할 수 있습니다</p>
        </div>

        {currentData.rows.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-3">분류 데이터</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {currentData.columns.map((col, index) => (
                      <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {currentData.columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 border-b border-gray-200 text-sm text-gray-900">
                          {row[col.key] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTransportTab = () => {
    return renderStandardActualTab('transport');
  };

  const renderProcessTab = () => {
    return renderStandardActualTab('process');
  };

  const renderTabContent = (tabKey: TabKey) => {
    switch (tabKey) {
      case 'standard':
      case 'actual':
        return renderStandardActualTab(tabKey);
      case 'classification':
        return renderClassificationTab();
      case 'transport':
        return renderTransportTab();
      case 'process':
        return renderProcessTab();
      default:
        return null;
    }
  };

  return (
    <CommonShell>
      <div className="min-h-screen p-4 space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900 text-center">데이터 업로드</h1>
          <p className="text-gray-700 text-sm text-center max-w-2xl mx-auto">
            각 탭에서 필요한 데이터를 업로드하고 관리합니다
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          {/* 탭 그룹 */}
          <TabGroup
            tabs={tabConfigs.map(config => ({
              id: config.id,
              label: config.label,
              content: renderTabContent(config.id)
            }))}
            activeTab={activeTab}
            onTabChange={(tabId: string) => setActiveTab(tabId as TabKey)}
            variant="underline"
          />
        </div>
      </div>

      {/* 토스트 알림 */}
      {toast && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className='w-5 h-5' />
            ) : (
              <AlertCircle className='w-5 h-5' />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </CommonShell>
  );
};

export default DataUploadPage;
