'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit3, Save, X, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface AIProcessedRow {
  상태: string;
  로트번호: string;
  생산품명: string;
  투입일: string;
  종료일: string;
  공정: string;
  품번: string;
  투입물명: string;
  투입물명수정: string;
  수량: string;
  지시번호: string;
  ai_processed: boolean;
  row_index: number;
  error?: string;
}

interface AIProcessedDataTableProps {
  data: AIProcessedRow[];
  onFeedback: (feedback: {
    row_index: number;
    original_material: string;
    corrected_material: string;
    reason: string;
    production_name: string;
    process: string;
  }) => void;
  onAddRow?: (newRow: Omit<AIProcessedRow, 'row_index' | 'ai_processed'>) => void;
  onDeleteRow?: (rowIndex: number) => void;
}

const AIProcessedDataTable: React.FC<AIProcessedDataTableProps> = ({ data, onFeedback, onAddRow, onDeleteRow }) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<AIProcessedRow | null>(null);
  const [feedbackReasons, setFeedbackReasons] = useState<{ [key: number]: string }>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRowData, setNewRowData] = useState<Omit<AIProcessedRow, 'row_index' | 'ai_processed'>>({
    상태: '',
    로트번호: '',
    생산품명: '',
    투입일: '',
    종료일: '',
    공정: '',
    품번: '',
    투입물명: '',
    투입물명수정: '',
    수량: '',
    지시번호: ''
  });

  // 디버깅을 위한 로그
  console.log('AIProcessedDataTable received data:', data);
  console.log('총 데이터 수:', data.length);
  console.log('AI 처리된 데이터 구조:', data.map(row => ({
    row_index: row.row_index,
    투입물명: row.투입물명,
    투입물명수정: row.투입물명수정,
    ai_processed: row.ai_processed,
    method: row.method || 'unknown'
  })));
  
  // 투입물명수정 필드가 있는 행 수 체크
  const correctedRows = data.filter(row => row.투입물명수정 && row.투입물명수정.trim() !== '');
  console.log('AI 수정된 행 수:', correctedRows.length, '/', data.length);

  // AI 처리 결과만 표시하는 컬럼 (수정 전/후 제거)
  const displayColumns = [
    '상태', '로트번호', '생산품명', '투입일', '종료일', 
    '공정', '품번', '투입물명', '투입물명수정', '수량', '지시번호'
  ];

  const handleEdit = (row: AIProcessedRow) => {
    setEditingRow(row.row_index);
    setEditData({ ...row });
  };

  const handleSave = () => {
    if (editData) {
      // 피드백 데이터 전송
      onFeedback({
        row_index: editData.row_index,
        original_material: editData.투입물명,
        corrected_material: editData.투입물명수정,
        reason: feedbackReasons[editData.row_index] || '',
        production_name: editData.생산품명,
        process: editData.공정
      });

      // 편집 모드 종료
      setEditingRow(null);
      setEditData(null);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const handleInputChange = (field: keyof AIProcessedRow, value: string) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleReasonChange = (rowIndex: number, reason: string) => {
    setFeedbackReasons(prev => ({
      ...prev,
      [rowIndex]: reason
    }));
  };

  const handleNewRowInputChange = (field: keyof typeof newRowData, value: string) => {
    setNewRowData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddRow = () => {
    if (onAddRow) {
      // 필수 필드 검증
      if (!newRowData.상태 || !newRowData.투입물명) {
        alert('상태와 투입물명은 필수 입력 항목입니다.');
        return;
      }
      
      onAddRow(newRowData);
      
      // 폼 초기화
      setNewRowData({
        상태: '',
        로트번호: '',
        생산품명: '',
        투입일: '',
        종료일: '',
        공정: '',
        품번: '',
        투입물명: '',
        투입물명수정: '',
        수량: '',
        지시번호: ''
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (onDeleteRow && confirm('이 행을 삭제하시겠습니까?')) {
      onDeleteRow(rowIndex);
    }
  };

  // 특정 열이 편집 가능한지 확인하는 함수 - AI 수정 투입물 명만 편집 가능
  const isEditableColumn = (column: string) => {
    return column === 'AI 수정 투입물 명';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">AI 처리 결과</h3>
          <span className="text-sm text-gray-500">
            ({data.filter(row => row.ai_processed).length}행 AI 처리됨)
          </span>
        </div>
        
        {/* + 버튼으로 새 행 추가 */}
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 행 추가
        </Button>
      </div>

      {/* 새 행 추가 폼 */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">새 행 추가</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              placeholder="상태"
              value={newRowData.상태}
              onChange={(e) => handleNewRowInputChange('상태', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="로트번호"
              value={newRowData.로트번호}
              onChange={(e) => handleNewRowInputChange('로트번호', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="생산품명"
              value={newRowData.생산품명}
              onChange={(e) => handleNewRowInputChange('생산품명', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="투입일"
              value={newRowData.투입일}
              onChange={(e) => handleNewRowInputChange('투입일', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="종료일"
              value={newRowData.종료일}
              onChange={(e) => handleNewRowInputChange('종료일', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="공정"
              value={newRowData.공정}
              onChange={(e) => handleNewRowInputChange('공정', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="품번"
              value={newRowData.품번}
              onChange={(e) => handleNewRowInputChange('품번', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="투입물명"
              value={newRowData.투입물명}
              onChange={(e) => handleNewRowInputChange('투입물명', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="AI 수정 투입물 명"
              value={newRowData.투입물명수정}
              onChange={(e) => handleNewRowInputChange('투입물명수정', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="수량"
              value={newRowData.수량}
              onChange={(e) => handleNewRowInputChange('수량', e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="지시번호"
              value={newRowData.지시번호}
              onChange={(e) => handleNewRowInputChange('지시번호', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleAddRow}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              추가
            </Button>
            <Button
              onClick={() => setShowAddForm(false)}
              size="sm"
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              취소
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-blue-50">
              {displayColumns.map((column, index) => (
                <th
                  key={index}
                  className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {column}
                </th>
              ))}
              <th className="border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700">
                수정
              </th>
              <th className="border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700">
                사유
              </th>
              <th className="border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700">
                삭제
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.row_index} className={rowIndex % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                {displayColumns.map((column, colIndex) => {
                  // 칼럼명에 따른 필드 키 매핑 (투입물명수정은 직접 매핑)
                  const fieldKey = column;
                  const value = row[fieldKey as keyof AIProcessedRow] || '';
                  const isEditing = editingRow === row.row_index;
                  const isEditable = isEditing && isEditableColumn(column);
                  
                  // 디버깅을 위한 로그
                  if (column === '투입물명수정') {
                    console.log(`Row ${row.row_index}, ${column}:`, {
                      fieldKey,
                      value,
                      originalValue: row.투입물명수정,
                      ai_processed: row.ai_processed
                    });
                  }
                  
                  return (
                    <td
                      key={colIndex}
                      className={`border border-gray-200 px-3 py-2 text-sm ${
                        isEditable ? 'bg-yellow-50' : ''
                      }`}
                    >
                      {isEditable ? (
                        <Input
                          value={editData?.투입물명수정 || ''}
                          onChange={(e) => handleInputChange('투입물명수정', e.target.value)}
                          className="w-full text-sm"
                          placeholder="수정된 투입물명을 입력하세요"
                        />
                      ) : (
                        <span className={row.error ? 'text-red-600' : ''}>
                          {String(value)}
                        </span>
                      )}
                    </td>
                  );
                })}
                
                {/* 수정 버튼 */}
                <td className="border border-gray-200 px-3 py-2 text-center">
                  {editingRow === row.row_index ? (
                    <div className="flex space-x-1 justify-center">
                      <Button
                        onClick={handleSave}
                        size="sm"
                        className="h-6 px-2 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={handleCancel}
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleEdit(row)}
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-blue-600 border-blue-500 hover:bg-blue-50"
                      disabled={!!row.error}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  )}
                </td>
                
                {/* 사유 입력 */}
                <td className="border border-gray-200 px-3 py-2">
                  <Input
                    placeholder="수정 사유 (선택사항)"
                    value={feedbackReasons[row.row_index] || ''}
                    onChange={(e) => handleReasonChange(row.row_index, e.target.value)}
                    className="w-full text-sm"
                    disabled={editingRow !== row.row_index}
                  />
                </td>

                {/* 삭제 버튼 */}
                <td className="border border-gray-200 px-3 py-2 text-center">
                  <Button
                    onClick={() => handleDeleteRow(row.row_index)}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-red-600 border-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI 처리 상태 요약 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <span className="font-medium text-gray-900">총 행 수:</span>
            <span className="ml-2 text-gray-600">{data.length}</span>
          </div>
          <div className="text-center">
            <span className="font-medium text-gray-900">AI 처리됨:</span>
            <span className="ml-2 text-green-600">
              {data.filter(row => row.ai_processed).length}
            </span>
          </div>
          <div className="text-center">
            <span className="font-medium text-gray-900">오류 발생:</span>
            <span className="ml-2 text-red-600">
              {data.filter(row => row.error).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProcessedDataTable;
