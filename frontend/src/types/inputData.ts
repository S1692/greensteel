// 투입물 데이터 관련 타입 정의
export type DataRow = {
  주문처명?: string;
  오더번호?: string;
  로트번호?: string;
  생산품명?: string;
  생산수량?: string;
  투입일?: string;
  종료일?: string;
  공정?: string;
  투입물명?: string;
  수량?: string;
  단위?: string;
  AI추천답변?: string; // frontend에서만 표시, DB 저장 시 투입물명으로 대체
  [key: string]: any;
};

export interface DataPreview {
  filename: string;
  fileSize: string;
  data: Array<DataRow>;
  columns: string[];
}

export interface AIProcessedData {
  status: string;
  message: string;
  filename: string;
  total_rows: number;
  processed_rows: number;
  data: Array<DataRow>;
  columns: string[];
}

export interface EditableRow {
  id: string;
  originalData: DataRow;
  modifiedData: DataRow;
  isEditing: boolean;
  isNewlyAdded?: boolean;
}
