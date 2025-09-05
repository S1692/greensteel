import React from 'react';
import { EditableRow } from '@/types/inputData';

interface InputFieldRendererProps {
  row: EditableRow;
  column: string;
  rowErrors: { [key: string]: { [column: string]: string } };
  onInputChange: (rowId: string, column: string, value: string) => void;
  onNumericInput: (e: React.KeyboardEvent<HTMLInputElement>, column: string) => void;
  onDateComparison: (rowId: string, column: string, value: string) => void;
  validateInput: (column: string, value: string) => { isValid: boolean; errorMessage: string };
  isNewRow: (row: EditableRow) => boolean;
}

const InputFieldRenderer: React.FC<InputFieldRendererProps> = ({
  row,
  column,
  rowErrors,
  onInputChange,
  onNumericInput,
  onDateComparison,
  validateInput,
  isNewRow
}) => {
  const value = row.modifiedData[column] || '';
  const isNewRowData = isNewRow(row);
  const isRequired = ['주문처명', '오더번호', '로트번호', '생산품명', '생산수량', '생산수량_단위', '투입일', '종료일', '공정', '투입물명', '수량', '투입물_단위'].includes(column);
  
  // 편집 모드가 아닌 경우 읽기 전용으로 표시
  if (!row.isEditing) {
    return <span className='text-white/60'>{value || '-'}</span>;
  }
  
  // Excel 데이터는 AI 추천 답변만 편집 가능, 새로 추가된 데이터는 모든 필드 편집 가능
  if (!isNewRowData && column !== 'AI추천답변') {
    // Excel 데이터의 다른 필드는 읽기 전용
    return <span className='text-white/60'>{value || '-'}</span>;
  }
  
  // 새로 추가된 데이터는 모든 필드 편집 가능 (위의 조건을 통과한 경우)
  // isNewRowData가 true이면 모든 필드가 편집 가능해야 함
  
  const getInputClassName = () => {
    let baseClass = 'w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
    
    if (isNewRowData) {
      baseClass += ' border-green-300 bg-green-50 text-black';
    } else if (row.isEditing) {
      baseClass += ' border-blue-300 bg-blue-50 text-black';
    } else {
      baseClass += ' border-gray-300 bg-white text-black';
    }
    
    return baseClass;
  };

  const handleInputChange = (newValue: string) => {
    onInputChange(row.id, column, newValue);
    
    if (column === '투입일' || column === '종료일') {
      onDateComparison(row.id, column, newValue);
    }
  };

  switch (column) {
    case '주문처명':
      return (
        <div className='relative'>
          <input
            type='text'
            value={value}
            maxLength={50}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={isRequired ? '주문처명을 입력하세요 *' : '주문처명을 입력하세요'}
            className={getInputClassName()}
          />
          {isRequired && (
            <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
          )}
          {rowErrors[row.id]?.[column] && (
            <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
          )}
        </div>
      );
    
    case '오더번호':
      return (
        <div className='relative'>
          <input
            type='text'
            value={value}
            maxLength={20}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={isRequired ? '오더번호를 입력하세요 *' : '오더번호를 입력하세요'}
            className={getInputClassName()}
          />
          {isRequired && (
            <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
          )}
          {rowErrors[row.id]?.[column] && (
            <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
          )}
        </div>
      );
    
    case '로트번호':
    case '생산수량':
    case '수량':
      return (
        <div className='relative'>
          <input
            type='text'
            value={value}
            maxLength={20}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => onNumericInput(e, column)}
            placeholder={isRequired ? '숫자만 입력 *' : '숫자만 입력'}
            className={getInputClassName()}
          />
          {isRequired && (
            <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
          )}
          {rowErrors[row.id]?.[column] && (
            <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
          )}
        </div>
      );
    
    case '투입일':
    case '종료일':
      return (
        <div className='relative'>
          <input
            type='date'
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            className={getInputClassName()}
          />
          {isRequired && (
            <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
          )}
          {rowErrors[row.id]?.[column] && (
            <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
          )}
        </div>
      );
    
    case '생산품명':
      return (
        <div className='relative'>
          <input
            type='text'
            value={value}
            maxLength={50}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={isRequired ? '생산품명을 입력하세요 *' : '생산품명을 입력하세요'}
            className={getInputClassName()}
          />
          {isRequired && (
            <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
          )}
          {rowErrors[row.id]?.[column] && (
            <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
          )}
        </div>
      );
    
    case '공정':
      return (
        <div className='relative'>
          <input
            type='text'
            value={value}
            maxLength={50}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={isRequired ? '공정명을 입력하세요 *' : '공정명을 입력하세요'}
            className={getInputClassName()}
          />
          {isRequired && (
            <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
          )}
          {rowErrors[row.id]?.[column] && (
            <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
          )}
        </div>
      );
    
    case '투입물명':
      return (
        <div className='relative'>
          <input
            type='text'
            value={value}
            maxLength={100}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={isRequired ? '투입물명을 입력하세요 *' : '투입물명을 입력하세요'}
            className={getInputClassName()}
          />
          {isRequired && (
            <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
          )}
          {rowErrors[row.id]?.[column] && (
            <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
          )}
        </div>
      );
    
    case '생산수량_단위':
    case '투입물_단위':
    case '단위':
      return (
        <div className='relative'>
          <input
            type='text'
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={column === '생산수량_단위' ? '생산수량 단위를 입력하세요 (예: kg, t, 개수)' : 
                       column === '투입물_단위' ? '투입물 단위를 입력하세요 (예: kg, t, 개수)' :
                       '단위를 입력하세요 (예: kg, t, 개수)'}
            className={getInputClassName()}
          />
          {isRequired && (
            <span className='absolute -top-2 -right-2 text-red-500 text-xs'>*</span>
          )}
          {rowErrors[row.id]?.[column] && (
            <p className='text-xs text-red-400 mt-1'>{rowErrors[row.id][column]}</p>
          )}
        </div>
      );
    
    case 'AI추천답변':
      return (
        <div className='relative'>
          <input
            type='text'
            value={value}
            maxLength={20}
            onChange={(e) => onInputChange(row.id, column, e.target.value)}
            placeholder={isNewRowData ? 'AI 추천 답변을 입력하세요' : 'AI 추천 답변을 수정하거나 입력하세요'}
            className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isNewRowData ? 'border-green-300 bg-green-50 text-black' : 'border-blue-300 bg-blue-50 text-black'
            }`}
          />
          <span className={`absolute -top-2 -right-2 text-xs ${
            isNewRowData ? 'text-green-500' : 'text-blue-500'
          }`}>
            ✏️
          </span>
        </div>
      );
    
    default:
      return (
        <span>{value || '-'}</span>
      );
  }
};

export default InputFieldRenderer;





