// ============================================================================
// 🏭 Install (사업장) 관련 타입
// ============================================================================

export interface Install {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📦 Product (제품) 관련 타입
// ============================================================================

export interface Product {
  id: number;
  install_id: number;
  product_name: string;
  product_category: '단순제품' | '복합제품';
  prostart_period: string;
  proend_period: string;
  product_cncode?: string;
  goods_name?: string;
  aggrgoods_name?: string;
  product_amount: number;
  product_sell?: number;
  product_eusell?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ⚙️ Process (공정) 관련 타입
// ============================================================================

export interface Process {
  id: number;
  process_name: string;
  start_period: string;
  end_period: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 🔗 ProductProcess (제품-공정 관계) 관련 타입
// ============================================================================

export interface ProductProcess {
  id: number;
  product_id: number;
  process_id: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📥 ProcessInput (공정 투입물) 관련 타입
// ============================================================================

export type InputType = 'material' | 'fuel' | 'electricity';
export type AllocationMethod = 'direct' | 'proportional' | 'time_based' | 'mass_based' | 'energy_based';

export interface ProcessInput {
  id: number;
  process_id: number;
  input_type: InputType;
  input_name: string;
  amount: number;
  factor?: number;
  oxy_factor?: number;
  direm_emission?: number;
  indirem_emission?: number;
  emission_factor_id?: number;
  allocation_method: AllocationMethod;
  allocation_ratio?: number;
  measurement_uncertainty?: number;
  data_quality?: string;
  verification_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📊 EmissionFactor (배출계수) 관련 타입
// ============================================================================

export type FactorType = 'fuel' | 'electricity' | 'process' | 'precursor';

export interface EmissionFactor {
  id: number;
  factor_type: FactorType;
  material_name: string;
  emission_factor: number;
  unit: string;
  source?: string;
  valid_from: string;
  valid_to?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 🔗 Edge (노드 간 연결) 관련 타입
// ============================================================================

export type EdgeKind = 'consume' | 'produce' | 'continue';

export interface Edge {
  id: number;
  source_id: number;
  target_id: number;
  edge_kind: EdgeKind;
  qty?: number;
  source_type: 'product' | 'process';
  target_type: 'product' | 'process';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📊 EmissionAttribution (배출량 귀속) 관련 타입
// ============================================================================

export type EmissionType = 'direct' | 'indirect' | 'precursor';

export interface EmissionAttribution {
  id: number;
  product_id?: number;
  process_id?: number;
  emission_type: EmissionType;
  emission_amount: number;
  attribution_method: AllocationMethod;
  allocation_ratio?: number;
  calculation_date: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📈 ProductEmissions (제품별 총 배출량) 관련 타입
// ============================================================================

export interface ProductEmissions {
  id: number;
  product_id: number;
  direct_emission: number;
  indirect_emission: number;
  precursor_emission: number;
  total_emission: number;
  emission_intensity?: number;
  calculation_date: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📋 CBAMDeclaration (CBAM 신고) 관련 타입
// ============================================================================

export type DeclarationStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface CBAMDeclaration {
  id: number;
  product_id: number;
  declaration_period: string;
  total_emission: number;
  embedded_emission: number;
  carbon_price?: number;
  declaration_status: DeclarationStatus;
  submitted_at?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 🏢 Company (기업) 관련 타입
// ============================================================================

export interface Company {
  id: number;
  company_id: string;
  password: string;
  installation: string;
  installation_en?: string;
  economic_activity?: string;
  economic_activity_en?: string;
  representative?: string;
  representative_en?: string;
  email?: string;
  telephone?: string;
  street?: string;
  street_en?: string;
  number?: string;
  number_en?: string;
  postcode?: string;
  city?: string;
  city_en?: string;
  country?: string;
  country_en?: string;
  unlocode?: string;
  source_latitude?: number;
  source_longitude?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 👤 User (사용자) 관련 타입
// ============================================================================

export type UserRole = '관리자' | '실무자' | '승인 전';

export interface User {
  id: number;
  username: string;
  password: string;
  full_name: string;
  company_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📊 Performance (성과) 관련 타입
// ============================================================================

export interface Performance {
  id: number;
  process_name: string;
  production_amount: number;
  unit: string;
  period_start?: string;
  period_end?: string;
  efficiency?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 🚚 Transport (운송) 관련 타입
// ============================================================================

export type TransportMode = 'road' | 'rail' | 'sea' | 'air';

export interface Transport {
  id: number;
  mode: TransportMode;
  distance_km?: number;
  fuel_type?: string;
  fuel_consumption?: number;
  fuel_unit?: string;
  emission_factor?: number;
  total_emission?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📋 Base (기본 데이터) 관련 타입
// ============================================================================

export interface BaseData {
  id: number;
  name: string;
  type?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  source?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📤 Output (실적정보(산출물) 데이터) 관련 타입
// ============================================================================

export interface OutputData {
  id: number;
  name: string;
  type?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  destination?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📊 데이터 업로드 관련 타입
// ============================================================================

export interface DataPreview {
  filename: string;
  fileSize: string;
  data: Array<{
    로트번호?: string | number;
    생산품명?: string;
    생산수량?: string | number;
    투입일?: string | number;
    종료일?: string | number;
    공정?: string;
    투입물명?: string;
    수량?: string | number;
    단위?: string;
    AI추천답변?: string;
    [key: string]: any;
  }>;
  columns: string[];
}

export interface AIProcessedData {
  status: string;
  message: string;
  filename: string;
  total_rows: number;
  processed_rows: number;
  data: Array<{
    로트번호?: string | number;
    생산품명?: string;
    생산수량?: string | number;
    투입일?: string | number;
    종료일?: string | number;
    공정?: string;
    투입물명?: string;
    수량?: string | number;
    단위?: string;
    AI추천답변?: string;
    [key: string]: any;
  }>;
  columns: string[];
}

// ============================================================================
// 🔧 기존 타입들 (하위 호환성 유지)
// ============================================================================

export interface ProjectMeta {
  id?: string;
  projectName: string;
  reason: string;
  owner: string;
  period: string;
  unit: string;
  productName: string;
  majorFunction: string;
  secondaryFunction: string;
  productClass: string;
  productFeatures: string;
  packaging: string;
}

export interface AnalysisScope {
  lifecycle: string;
  processOverview: string;
  dataQuality: string;
  exclusions: string;
  assumptions: string;
  methodSet: string;
  summary: string;
}

export interface LciItem {
  id: string;
  processName: string;
  category: string;
  unit: string;
  value: number;
  uncertainty: number;
  dataQuality: string;
  source: string;
  notes: string;
}

export interface LciaResult {
  id: string;
  category: string;
  value: number;
  unit: string;
  method: string;
  timestamp: string;
}

export interface ReportConfig {
  format: 'pdf' | 'docx' | 'html';
  includeCharts: boolean;
  includeTables: boolean;
  sections: string[];
}

// 새로운 데이터 업로드 스키마 타입 정의
export interface InputDataSchema {
  id?: number;
  로트번호: string;
  생산품명: string;
  생산수량: number;
  투입일: string | null;
  종료일: string | null;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  AI추천답변?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OutputDataSchema {
  id?: number;
  로트번호: string;
  생산품명: string;
  생산수량: number;
  투입일: string | null;
  종료일: string | null;
  공정: string;
  산출물명: string;
  수량: number;
  단위: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransportDataSchema {
  id?: number;
  생산품명: string;
  로트번호: string;
  운송물질: string;
  운송수량: number;
  운송일자: string | null;
  도착공정: string;
  출발지: string;
  이동수단: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessDataSchema {
  id?: number;
  공정명: string;
  공정설명: string;
  공정유형: string;
  공정단계: string;
  공정효율: number;
  created_at?: string;
  updated_at?: string;
}
