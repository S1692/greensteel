import React from 'react';
import { DataPreview, EditableRow } from '@/types/inputData';

interface DataPreviewTableProps {
  inputData: DataPreview | null;
  editableInputRows: EditableRow[];
  editReasons: { [key: string]: string };
  rowErrors: { [key: string]: { [column: string]: string } };
  onInputChange: (rowId: string, column: string, value: string) => void;
  onToggleRowEdit: (rowId: string) => void;
  onConfirmRow: (rowId: string) => void;
  onCancelRowEdit: (rowId: string) => void;
  onDeleteRow: (rowId: string) => void;
  onAddNewRow: () => void;
  onEditReasonChange: (rowId: string, reason: string) => void;
  onNumericInput: (e: React.KeyboardEvent<HTMLInputElement>, column: string) => void;
  onDateComparison: (rowId: string, column: string, value: string) => void;
  renderInputField: (row: EditableRow, column: string) => React.ReactNode;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  inputData,
  editableInputRows,
  editReasons,
  rowErrors,
  onInputChange,
  onToggleRowEdit,
  onConfirmRow,
  onCancelRowEdit,
  onDeleteRow,
  onAddNewRow,
  onEditReasonChange,
  onNumericInput,
  onDateComparison,
  renderInputField
}) => {
  return (
    <div className='stitch-card p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-lg font-semibold text-white'>데이터 미리보기</h3>
          {inputData ? (
            <p className='text-sm text-white/60'>
              파일: {inputData.filename} | 
              크기: {inputData.fileSize} MB | 
              행 수: {inputData.data.length}
            </p>
          ) : (
            <p className='text-sm text-white/60'>
              파일을 업로드하면 데이터 미리보기가 표시됩니다.
            </p>
          )}
        </div>
      </div>

      {/* 데이터 테이블 */}
      {inputData ? (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse border border-white/20'>
            <thead>
              <tr className='bg-white/10'>
                {inputData.columns.map((column) => (
                  <th key={column} className='border border-white/20 px-3 py-2 text-left text-sm font-medium text-white'>
                    {column}
                  </th>
                ))}
                <th className='border border-white/20 px-3 py-2 text-left text-sm font-medium text-white'>작업</th>
              </tr>
            </thead>
            <tbody>
              {editableInputRows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className='border-b border-white/10 hover:bg-white/5'>
                    {inputData.columns.map((column) => (
                      <td key={column} className='border border-white/20 px-3 py-2 text-sm text-white'>
                        {row.isEditing ? (
                          renderInputField(row, column)
                        ) : (
                          <span className={column === 'AI추천답변' ? 'text-blue-300' : ''}>
                            {row.modifiedData[column] || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className='border border-white/20 px-3 py-2 text-sm'>
                      {row.isEditing ? (
                        <div className='flex gap-2'>
                          <button
                            onClick={() => onConfirmRow(row.id)}
                            className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1'
                          >
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                            </svg>
                            확인
                          </button>
                          <button
                            onClick={() => onCancelRowEdit(row.id)}
                            className='bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1'
                          >
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
                            </svg>
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className='flex gap-2'>
                          <button
                            onClick={() => onToggleRowEdit(row.id)}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1'
                          >
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                            </svg>
                            편집
                          </button>
                          <button
                            onClick={() => onDeleteRow(row.id)}
                            className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1'
                          >
                            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' clipRule='evenodd' />
                              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                            </svg>
                            삭제
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {/* 수정 사유 입력 행 (Excel 데이터 편집 시에만) */}
                  {row.isEditing && !row.isNewlyAdded && (
                    <tr className='bg-white/5 border-b border-white/10'>
                      <td colSpan={inputData.columns.length + 1} className='px-3 py-3'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0'>
                            <span className='text-xs text-white/60 font-medium'>수정 사유 (Excel 데이터 편집 시):</span>
                          </div>
                          <div className='flex-1'>
                            <input
                              type='text'
                              value={editReasons[row.id] || ''}
                              onChange={(e) => onEditReasonChange(row.id, e.target.value)}
                              placeholder='AI 추천 답변 수정 사유를 입력하세요'
                              className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='text-center py-8 text-white/60'>
          <svg className='w-16 h-16 mx-auto mb-4 opacity-50' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' clipRule='evenodd' />
          </svg>
          <p>파일을 업로드하면 데이터 테이블이 표시됩니다.</p>
        </div>
      )}

      {/* 데이터 추가 버튼 */}
      {inputData && (
        <div className='mt-4 flex justify-center'>
          <button
            onClick={onAddNewRow}
            className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z' clipRule='evenodd' />
            </svg>
            데이터 추가
          </button>
        </div>
      )}
    </div>
  );
};

export default DataPreviewTable;