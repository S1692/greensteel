'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Home,
  BarChart3,
  Shield,
  FileText,
  Database,
  Cog,
  Table,
  BarChart,
  Edit3,
  Download,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

// 데이터 타입 정의
interface DataItem {
  id: string;
  name: string;
  category?: string;
  type?: string;
  quantity?: number;
  unit?: string;
  classification?: '원료' | '유틸리티' | '폐기물' | '공정생산물';
  source: 'input' | 'output'; // 투입물인지 산출물인지 구분
  [key: string]: any;
}

interface ClassificationData {
  원료: DataItem[];
  유틸리티: DataItem[];
  폐기물: DataItem[];
  공정생산물: DataItem[];
}

export default function DataClassificationPage() {
  // 상태 관리
  const [data, setData] = useState<DataItem[]>([]);
  const [classificationData, setClassificationData] = useState<ClassificationData>({
    원료: [],
    유틸리티: [],
    폐기물: [],
    공정생산물: []
  });
  const [selectedData, setSelectedData] = useState<DataItem[]>([]);
  const [currentClassification, setCurrentClassification] = useState<'원료' | '유틸리티' | '폐기물' | '공정생산물'>('원료');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 드래그 앤 드롭 상태
  const [isDragOver, setIsDragOver] = useState(false);

  // refs
  const fileRef = useRef<HTMLInputElement>(null);

  // 엑셀 파일 읽기 함수
  const readExcelFile = (file: File): Promise<{ data: any[], columns: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('데이터가 충분하지 않습니다.'));
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map((row: any, index: number) => {
            const obj: any = { id: `temp_${index + 1}` };
            headers.forEach((header, colIndex) => {
              obj[header] = row[colIndex] || '';
            });
            return obj;
          });

          resolve({ data: rows, columns: headers });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 데이터 업로드
  const handleUpload = async (file: File) => {
    try {
      const result = await readExcelFile(file);
      const dataWithSource = result.data.map((item: any) => ({
        ...item,
        source: 'input' as const
      }));
      setData(dataWithSource);
      setError(null);
      setSuccessMessage('데이터 업로드 성공');
      setTimeout(() => setSuccessMessage(null), 3000);
      console.log('데이터 업로드 성공:', dataWithSource.length, '개 항목');
    } catch (err) {
      console.error('데이터 업로드 오류:', err);
      setError('데이터 업로드에 실패했습니다.');
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );

    if (excelFile) {
      handleUpload(excelFile);
    } else {
      setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 데이터 선택/선택 해제
  const toggleDataSelection = (data: DataItem) => {
    setSelectedData(prev => {
      const exists = prev.find(item => item.id === data.id);
      if (exists) {
        return prev.filter(item => item.id !== data.id);
      } else {
        return [...prev, data];
      }
    });
  };

  // 선택된 데이터를 현재 분류로 이동
  const applyClassification = () => {
    if (selectedData.length === 0) {
      setError('분류할 데이터를 선택해주세요.');
      return;
    }

    // 분류 데이터에 추가
    setClassificationData(prev => ({
      ...prev,
      [currentClassification]: [...prev[currentClassification], ...selectedData]
    }));

    // 원본 데이터에서 제거
    setData(prev => prev.filter(item => !selectedData.find(selected => selected.id === item.id)));

    // 선택 해제
    setSelectedData([]);
    
    setSuccessMessage(`${selectedData.length}개 항목이 ${currentClassification}로 분류되었습니다.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 분류된 데이터를 원본으로 되돌리기
  const moveBackToOriginal = (data: DataItem, source: keyof ClassificationData) => {
    // 원본 데이터에 추가
    setData(prev => [...prev, data]);

    // 분류 데이터에서 제거
    setClassificationData(prev => ({
      ...prev,
      [source]: prev[source].filter(item => item.id !== data.id)
    }));
  };

  // 분류 결과를 localStorage에 저장
  const saveClassificationToDB = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      localStorage.setItem('classificationData', JSON.stringify(classificationData));
      setSuccessMessage('분류 결과가 저장되었습니다.');
      console.log('분류 결과 저장 성공:', classificationData);
    } catch (err) {
      console.error('분류 결과 저장 오류:', err);
      setError('분류 결과 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // 데이터 검색
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 분류별 색상 및 스타일
  const getClassificationStyle = (classification: keyof ClassificationData) => {
    const styles = {
      원료: { color: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
      유틸리티: { color: 'bg-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
      폐기물: { color: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-200' },
      공정생산물: { color: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-200' }
    };
    return styles[classification];
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* 왼쪽 사이드바 메뉴 */}
      <div className='w-64 bg-white shadow-lg border-r border-gray-200'>
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center'>
              <BarChart3 className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>GreenSteel</h1>
              <p className='text-sm text-gray-600 mt-1'>AI 기반 데이터 관리 시스템</p>
            </div>
          </div>
          
          <h2 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>메뉴</h2>
          <nav className='space-y-1'>
            <a href='/' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <Home className='w-5 h-5' />
              <span className='text-sm font-medium'>홈</span>
            </a>
            <a href='/lca' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <BarChart3 className='w-5 h-5' />
              <span className='text-sm font-medium'>LCA</span>
            </a>
            <a href='/cbam' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <Shield className='w-5 h-5' />
              <span className='text-sm font-medium'>CBAM</span>
            </a>
            <a href='/data-upload' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <FileText className='w-5 h-5' />
              <span className='text-sm font-medium'>데이터 업로드</span>
            </a>
            <div className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg border border-blue-200'>
              <Database className='w-5 h-5' />
              <span className='text-sm font-medium'>데이터 분류</span>
            </div>
            <a href='/settings' className='flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100'>
              <Cog className='w-5 h-5' />
              <span className='text-sm font-medium'>설정</span>
            </a>
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='flex-1 flex flex-col'>
        {/* 상단 헤더 */}
        <div className='bg-white shadow-sm border-b border-gray-200'>
          <div className='px-8 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <h1 className='text-2xl font-bold text-gray-900'>데이터 분류</h1>
              </div>
              <div className='flex gap-3'>
                <Button
                  onClick={saveClassificationToDB}
                  disabled={isLoading}
                  className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded-lg'
                >
                  <Save className='w-4 h-4 mr-2' />
                  분류 결과 저장
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 표시 */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-8 mt-4 rounded-lg flex items-center gap-2'>
            <AlertCircle className='w-5 h-5' />
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 mx-8 mt-4 rounded-lg flex items-center gap-2'>
            <CheckCircle className='w-5 h-5' />
            {successMessage}
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className='flex-1 p-8 overflow-hidden'>
          <div className='h-full flex gap-6'>
            
            {/* 왼쪽: 데이터 표시 및 업로드 */}
            <div className='flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col'>
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <Table className='w-5 h-5 text-blue-600' />
                    </div>
                    <div>
                      <h2 className='text-lg font-semibold text-gray-900'>데이터</h2>
                      <p className='text-sm text-gray-600'>엑셀 파일을 업로드하고 분류할 데이터를 선택하세요</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={() => fileRef.current?.click()}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg'
                    >
                      <Upload className='w-4 h-4 mr-2' />
                      엑셀 업로드
                    </Button>
                    <div className='text-sm text-gray-500'>
                      총 {data.length}개 항목
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 검색 */}
              <div className='px-6 py-4 border-b border-gray-100'>
                <input
                  type='text'
                  placeholder='데이터 검색...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              
              <div className='flex-1 p-6 overflow-y-auto relative'>
                {data.length === 0 ? (
                  /* 드래그 앤 드롭 영역 */
                  <div
                    className={`h-full border-2 border-dashed transition-all ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className='text-center py-20'>
                      <FileSpreadsheet className={`mx-auto h-16 w-16 mb-4 ${
                        isDragOver ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <p className={`text-xl font-medium mb-2 ${
                        isDragOver ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {isDragOver ? '파일을 여기에 드롭하세요!' : '엑셀 파일을 드래그 앤 드롭하거나'}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {isDragOver ? '드롭하면 자동으로 업로드됩니다' : '위의 업로드 버튼을 클릭하세요'}
                      </p>
                      <p className='text-xs text-gray-400 mt-2'>
                        지원 형식: .xlsx, .xls
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 데이터 테이블 */
                  <div className='space-y-3'>
                    {filteredData.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedData.find(selected => selected.id === item.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleDataSelection(item)}
                      >
                        <div className='flex items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={selectedData.find(selected => selected.id === item.id) !== undefined}
                            onChange={() => toggleDataSelection(item)}
                            className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                          />
                          <div className='flex-1'>
                            <h3 className='font-medium text-gray-900'>{item.name || '이름 없음'}</h3>
                            <div className='flex items-center gap-4 mt-1 text-sm text-gray-600'>
                              {item.category && <span>카테고리: {item.category}</span>}
                              {item.type && <span>유형: {item.type}</span>}
                              {item.quantity && <span>수량: {item.quantity} {item.unit || ''}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 분류 설정 및 결과 */}
            <div className='w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col'>
              <div className='p-6 border-b border-gray-200'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>데이터 분류</h2>
                <div className='text-sm text-gray-500 mb-4'>
                  선택된 항목: {selectedData.length}개
                </div>
                
                {/* 분류 선택 */}
                <div className='space-y-3 mb-4'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='classification'
                      value='원료'
                      checked={currentClassification === '원료'}
                      onChange={(e) => setCurrentClassification(e.target.value as any)}
                      className='text-blue-600'
                    />
                    <span className='text-sm font-medium'>원료</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='classification'
                      value='유틸리티'
                      checked={currentClassification === '유틸리티'}
                      onChange={(e) => setCurrentClassification(e.target.value as any)}
                      className='text-blue-600'
                    />
                    <span className='text-sm font-medium'>유틸리티</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='classification'
                      value='폐기물'
                      checked={currentClassification === '폐기물'}
                      onChange={(e) => setCurrentClassification(e.target.value as any)}
                      className='text-blue-600'
                    />
                    <span className='text-sm font-medium'>폐기물</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='classification'
                      value='공정생산물'
                      checked={currentClassification === '공정생산물'}
                      onChange={(e) => setCurrentClassification(e.target.value as any)}
                      className='text-blue-600'
                    />
                    <span className='text-sm font-medium'>공정생산물</span>
                  </label>
                </div>
                
                {/* 분류 적용 버튼 */}
                <Button
                  onClick={applyClassification}
                  disabled={selectedData.length === 0}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed'
                >
                  <CheckCircle className='w-4 h-4 mr-2' />
                  {currentClassification}로 분류 적용
                </Button>
              </div>
              
              {/* 분류 결과 */}
              <div className='flex-1 p-6 overflow-y-auto'>
                <h3 className='text-md font-semibold text-gray-900 mb-4'>분류 결과</h3>
                <div className='space-y-4'>
                  {(Object.keys(classificationData) as Array<keyof ClassificationData>).map((classification) => {
                    if (classificationData[classification].length === 0) return null;
                    
                    const style = getClassificationStyle(classification);
                    
                    return (
                      <div key={classification} className='border border-gray-200 rounded-lg p-3'>
                        <h4 className={`text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2`}>
                          <div className={`w-2 h-2 ${style.color} rounded-full`}></div>
                          {classification} ({classificationData[classification].length}개)
                        </h4>
                        <div className='space-y-2 max-h-32 overflow-y-auto'>
                          {classificationData[classification].map((item) => (
                            <div key={item.id} className={`p-2 border rounded text-sm ${style.bg} ${style.border}`}>
                              <div className='flex items-center justify-between'>
                                <div className='flex-1'>
                                  <div className='font-medium text-gray-900 truncate'>{item.name || '이름 없음'}</div>
                                </div>
                                <Button
                                  onClick={() => moveBackToOriginal(item, classification)}
                                  variant='ghost'
                                  size='sm'
                                  className='text-red-600 hover:text-red-700 hover:bg-red-100 p-1 h-6 w-6'
                                >
                                  <X className='w-3 h-3' />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {Object.values(classificationData).every(arr => arr.length === 0) && (
                  <div className='text-center py-8 text-gray-500'>
                    <BarChart className='mx-auto h-8 w-8 mb-2' />
                    <p className='text-sm'>분류된 데이터가 없습니다</p>
                    <p className='text-xs'>왼쪽에서 데이터를 선택하여 분류하세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileRef}
        type='file'
        accept='.xlsx,.xls'
        onChange={handleFileSelect}
        className='hidden'
      />
    </div>
  );
}
