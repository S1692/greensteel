export type ProjectMeta = {
  projectName: string
  createdAt: string // 프로젝트 생성일
  updatedAt: string // 프로젝트 수정일
  owner: {
    name: string // 담당자명
    department: string // 부서
    position: string // 직위
  }
  reason: string // 연구 수행 이유
  period: { start: string; end: string } // 연구 시작일, 연구 종료일
  approvalStatus: {
    status: "pending" | "approved" | "rejected"
    approvedAt?: string
    approvedBy?: string
    rejectedAt?: string
    rejectedBy?: string
    rejectionReason?: string
  }
  // 기존 필드들 (제품 정보는 별도 탭으로 이동)
  productName?: string
  majorFunction?: string
  secondaryFunction?: string
  productClass?: string
  productFeatures?: string
  productPhoto?: string
  packaging?: { min: string; out: string }
}

export type AnalysisScope = {
  lifecycle: "Gate-to-Gate" | "Cradle-to-Gate" | "Cradle-to-Grave"
  processOverview: {
    name: string
    subProcesses: string[]
    description?: string
    drawingFile?: string
    fileUrl?: string
  }
  dataQuality: {
    temporal: string // 시간적 범위(데이터 수집기간)
    technical: string // 기술적 범위(기술/공정 상태)
    geographic: string // 지리적 범위(국가/사업장)
    source: "primary" | "secondary" | "mixed"
    dataSources?: string // 데이터 출처 (연동)
    peerReview?: string // 비판적 검토(텍스트)
  }
  exclusions: { massCutoff?: string; rules?: string } // 제외 기준(누적 질량 등)
  assumptions: string // 가정 및 제한사항
  methodSet: "EF 3.1" // 영향평가 방법론 (고정, 확장 가능)
  summary: string // 목적 및 범위 요약(자동 생성)
}

export type LciItem = {
  id: string
  process: string
  flow: string
  direction: "in" | "out"
  qty: number
  unit: string
}

export type LciaRun = {
  id: string
  method: "EF 3.1"
  categories: string[]
  status: "idle" | "running" | "done"
  results?: Array<{ category: string; value: number; unit: string }>
}

export type Interpretation = {
  contributionTop: Array<{ name: string; share: number }>
  sensitivity: Array<{ parameter: string; delta: number; impactDelta: number }>
}

export type ReportModel = {
  productInfo: ProjectMeta
  scope: AnalysisScope
  methodTable: Array<{ category: string; indicator: string; unit: string }>
  resultsTable: Array<{
    category: string
    manufacture: number
    preManufacture: number
    total: number
    unit: string
    shareManufacture?: number
    shareTotal?: number
  }>
}

export type Project = {
  id: string
  name: string
  description: string
  status: "진행 중" | "완료" | "draft" | "frozen" | "approved"
  createdAt: string
  updatedAt: string
  meta?: ProjectMeta
  scope?: AnalysisScope
  lci?: LciItem[]
  lcia?: LciaRun[]
  interpretation?: Interpretation
}
