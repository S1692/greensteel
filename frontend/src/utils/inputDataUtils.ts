import { DataRow, EditableRow } from '@/types/inputData';

// 템플릿 형식 검증
export const validateTemplateFormat = (columns: string[]): { isValid: boolean; errorMessage?: string } => {
  const requiredColumns = [
    '주문처명', '오더번호', '로트번호', '생산품명', '생산수량', '생산수량_단위', '투입일', '종료일', '공정', '투입물명', '수량', '투입물_단위'
  ];
  
  // 정확한 칼럼명 매칭 (공백, 언더스코어 무시)
  const hasAllRequiredColumns = requiredColumns.every(requiredCol => {
    const found = columns.some(uploadedCol => {
      const cleanRequired = requiredCol.trim().toLowerCase().replace(/[\s_]/g, '');
      const cleanUploaded = uploadedCol.trim().toLowerCase().replace(/[\s_]/g, '');
      return cleanRequired === cleanUploaded;
    });
    return found;
  });
  
  if (!hasAllRequiredColumns) {
    const missingColumns = requiredColumns.filter(requiredCol => {
      return !columns.some(uploadedCol => {
        const cleanRequired = requiredCol.trim().toLowerCase().replace(/[\s_]/g, '');
        const cleanUploaded = uploadedCol.trim().toLowerCase().replace(/[\s_]/g, '');
        return cleanRequired === cleanUploaded;
      });
    });
    return { 
      isValid: false, 
      errorMessage: `템플릿을 확인해 주세요. 누락된 컬럼: ${missingColumns.join(', ')}` 
    };
  }
  
  // 추가 칼럼이 있는지 확인 (정확히 12개 칼럼만 허용)
  if (columns.length !== 12) {
    return { 
      isValid: false, 
      errorMessage: `템플릿을 확인해 주세요. 정확히 12개 칼럼이어야 합니다. 현재: ${columns.length}개` 
    };
  }
  
  return { isValid: true };
};

// 입력 유효성 검사
export const validateInput = (column: string, value: string): { isValid: boolean; errorMessage: string } => {
  if (value.length > 50) {
    console.log(`글자 수 초과: ${column} - ${value.length}글자`);
    return { isValid: false, errorMessage: '50자 이하로 입력해주세요.' };
  }
  
  switch (column) {
    case '로트번호':
      // 로트번호는 문자열로 처리
      if (!value || value.trim() === '') {
        return { isValid: false, errorMessage: '로트번호는 필수 입력 항목입니다.' };
      }
      return { isValid: true, errorMessage: '' };
    case '생산수량':
    case '수량':
      // 수량은 숫자만 입력 가능
      const isNumberValid = /^\d+(\.\d+)?$/.test(value);
      if (!isNumberValid) {
        console.log(`숫자만 입력 가능: ${column} - ${value}`);
        return { isValid: false, errorMessage: '숫자만 입력 가능합니다.' };
      }
      // 0보다 큰 값인지 확인
      const numValue = parseFloat(value);
      if (numValue <= 0) {
        return { isValid: false, errorMessage: '0보다 큰 값을 입력해주세요.' };
      }
      return { isValid: true, errorMessage: '' };
    case '투입일':
    case '종료일':
      if (!value || value === '') {
        return { isValid: true, errorMessage: '' };
      }
      
      // YYYY-MM-DD 형식 검증
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        console.log(`날짜 형식 오류: ${column} - ${value}`);
        return { isValid: false, errorMessage: 'YYYY-MM-DD 형식으로 입력해주세요.' };
      }
      
      // 유효한 날짜인지 검증
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        console.log(`유효하지 않은 날짜: ${column} - ${value}`);
        return { isValid: false, errorMessage: '유효한 날짜를 입력해주세요.' };
      }
      
      // 미래 날짜 제한 (선택사항)
      const today = new Date();
      today.setHours(23, 59, 59, 999); // 오늘의 마지막 시간
      if (date > today) {
        console.log(`미래 날짜 입력: ${column} - ${value}`);
        return { isValid: false, errorMessage: '미래 날짜는 입력할 수 없습니다.' };
      }
      
      return { isValid: true, errorMessage: '' };
    case '생산품명':
    case '투입물명':
    case '공정':
      // 한글, 영문, 숫자, 공백, 특수문자 허용
      const isNameValid = /^[가-힣a-zA-Z0-9\s\-_()]*$/.test(value);
      if (!isNameValid) {
        console.log(`텍스트 입력 오류: ${column} - ${value}`);
        return { isValid: false, errorMessage: '한글, 영문, 숫자, 특수문자만 입력 가능합니다.' };
      }
      return { isValid: true, errorMessage: '' };
    case '투입물_단위':
      const isUnitValid = /^[가-힣a-zA-Z0-9\s\-_()\/]*$/.test(value);
      if (!isUnitValid) {
        console.log(`텍스트 입력 오류: ${column} - ${value}`);
        return { isValid: false, errorMessage: '한글, 영문, 숫자, 특수문자, /만 입력 가능합니다.' };
      }
      return { isValid: true, errorMessage: '' };
    default:
      return { isValid: true, errorMessage: '' };
  }
};

// 새로운 행인지 확인하는 함수
export const isNewRow = (row: EditableRow): boolean => {
  return !row.originalData || Object.keys(row.originalData).length === 0 || 
         Object.values(row.originalData).every(val => val === '' || val === null || val === undefined);
};

// Excel 날짜를 PostgreSQL date 형식으로 변환하는 함수
export const convertExcelDate = (excelDate: any): string | null => {
  if (!excelDate || excelDate === '') return null;
  
  try {
    // 이미 문자열 형태의 날짜인 경우
    if (typeof excelDate === 'string') {
      return excelDate;
    }
    
    // Excel 날짜 숫자인 경우 (1900년 1월 1일부터의 일수)
    if (typeof excelDate === 'number') {
      const baseDate = new Date(1900, 0, 1); // JavaScript는 0부터 시작
      const resultDate = new Date(baseDate.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000);
      return resultDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    }
    
    return null;
  } catch (error) {
    console.warn('날짜 변환 실패:', excelDate, error);
    return null;
  }
};

// 숫자 입력 필드에서 문자 입력 방지
export const handleNumericInput = (e: React.KeyboardEvent<HTMLInputElement>, column: string) => {
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  const isNumericColumn = ['로트번호', '생산수량', '수량'].includes(column);
  
  if (isNumericColumn) {
    // 숫자, 소수점, 허용된 키만 입력 가능
    if (!/[\d.]/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
      return;
    }
    
    // 소수점은 한 번만 입력 가능
    if (e.key === '.' && (e.currentTarget.value.includes('.') || e.currentTarget.value === '')) {
      e.preventDefault();
      return;
    }
  }
};

// 날짜 비교 검증 함수
export const validateDateComparison = (
  rowId: string, 
  column: string, 
  value: string, 
  editableInputRows: EditableRow[],
  updateRowError: (rowId: string, column: string, errorMessage: string) => void,
  clearRowError: (rowId: string, column: string) => void
): void => {
  const row = editableInputRows.find(r => r.id === rowId);
  if (!row) return;
  
  if (column === '투입일' && row.modifiedData['종료일']) {
    const inputDate = new Date(value);
    const endDate = new Date(row.modifiedData['종료일']);
    if (inputDate > endDate) {
      updateRowError(rowId, column, '투입일은 종료일보다 늦을 수 없습니다.');
    } else {
      clearRowError(rowId, column);
    }
  } else if (column === '종료일' && row.modifiedData['투입일']) {
    const startDate = new Date(row.modifiedData['투입일']);
    const endDate = new Date(value);
    if (startDate > endDate) {
      updateRowError(rowId, column, '종료일은 투입일보다 빠를 수 없습니다.');
    } else {
      clearRowError(rowId, column);
    }
  }
};
