interface ParsedExcelData {
  rows: Record<string, any>[];
  headers: string[];
}

/**
 * CSV 파일을 파싱하여 헤더와 행 데이터를 추출합니다
 */
function parseCSV(content: string): ParsedExcelData {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return { rows: [], headers: [] };
  }

  // 첫 번째 줄을 헤더로 사용
  const headers = lines[0].split(',').map(header => header.trim());
  
  // 헤더를 안전한 키로 변환
  const safeKeys = headers.map(header => 
    header.replace(/[^a-zA-Z0-9가-힣]/g, '_').replace(/^_+|_+$/g, '')
  );

  // 데이터 행 파싱
  const rows = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(value => value.trim());
    const row: Record<string, any> = {};
    
    safeKeys.forEach((key, i) => {
      row[key] = values[i] || '';
    });
    
    return row;
  });

  return { rows, headers };
}

/**
 * Excel 파일을 파싱합니다 (CSV만 지원, XLSX는 향후 확장)
 */
export async function parseExcel(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          const result = parseCSV(content);
          resolve(result);
        } else {
          reject(new Error('현재 CSV 파일만 지원됩니다. XLSX 파일은 향후 지원 예정입니다.'));
        }
      } catch (error) {
        reject(new Error('파일 파싱 중 오류가 발생했습니다.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('파일 읽기 중 오류가 발생했습니다.'));
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reject(new Error('지원하지 않는 파일 형식입니다. CSV 파일을 사용해주세요.'));
    }
  });
}

/**
 * 헤더를 안전한 컬럼 키로 변환합니다
 */
export function normalizeColumnKey(header: string): string {
  return header
    .replace(/[^a-zA-Z0-9가-힣]/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

/**
 * 컬럼 정보를 생성합니다
 */
export function createColumns(headers: string[]): { key: string; header: string }[] {
  return headers.map(header => ({
    key: normalizeColumnKey(header),
    header: header
  }));
}
