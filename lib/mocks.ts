// lib/mocks.ts

import type { LciItem, ProjectMeta, AnalysisScope, Project } from "@/lib/types"

// 프로젝트 더미 데이터 (철강 산업 중심) - 확장
export const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "고강도 강판 LCA",
    description: "고강도 강판 제조 공정의 환경 영향 평가",
    status: "진행 중",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "proj-2", 
    name: "자동차용 냉간압연강판 LCA",
    description: "자동차용 냉간압연강판 생산의 환경 영향 분석",
    status: "완료",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
  },
  {
    id: "proj-3",
    name: "건축용 H형강 LCA", 
    description: "건축용 H형강 생산 및 사용의 환경 영향",
    status: "진행 중",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-19",
  },
  {
    id: "proj-4",
    name: "조선용 후판 LCA",
    description: "조선용 후판 제조 공정의 환경 영향 평가",
    status: "진행 중",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-17",
  },
  {
    id: "proj-5",
    name: "전기강판 LCA",
    description: "전기강판 생산 공정의 환경 영향 분석",
    status: "완료",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-16",
  },
  {
    id: "proj-6",
    name: "스테인리스강 LCA",
    description: "스테인리스강 제조 공정의 환경 영향 평가",
    status: "진행 중",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-15",
  },
  {
    id: "proj-7",
    name: "특수강 LCA",
    description: "특수강 제조 공정의 환경 영향 분석",
    status: "완료",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-14",
  },
  {
    id: "proj-8",
    name: "도금강판 LCA",
    description: "아연도금강판 생산 공정의 환경 영향 평가",
    status: "진행 중",
    createdAt: "2023-12-28",
    updatedAt: "2024-01-13",
  },
  {
    id: "proj-9",
    name: "강관 LCA",
    description: "원형강관 제조 공정의 환경 영향 분석",
    status: "완료",
    createdAt: "2023-12-25",
    updatedAt: "2024-01-12",
  },
  {
    id: "proj-10",
    name: "철근 LCA",
    description: "철근 제조 공정의 환경 영향 평가",
    status: "진행 중",
    createdAt: "2023-12-20",
    updatedAt: "2024-01-11",
  },
]

// 프로젝트별 메타 데이터 (철강 산업 중심)
export const mockProjectMetas: Record<string, Partial<ProjectMeta>> = {
  "proj-1": {
    projectName: "고강도 강판 LCA 프로젝트",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    owner: {
      name: "김철강",
      department: "철강 LCA 연구팀",
      position: "수석연구원"
    },
    reason: "고강도 강판의 환경 영향을 평가하여 친환경 제품 개발을 위한 기초 자료 확보",
    period: { start: "2024-01-01", end: "2024-12-31" },
    approvalStatus: {
      status: "approved",
      approvedAt: "2024-01-16",
      approvedBy: "김승인"
    },
    productName: "고강도 강판 (AHSS)",
    majorFunction: "자동차 차체 구조재",
    secondaryFunction: "충격 흡수 및 경량화",
    productClass: "고강도 자동차용 강판",
    productFeatures: "항복강도 980MPa 이상, 연신율 15% 이상",
    packaging: { min: "PE 필름", out: "강재 팔레트" },
  },
  "proj-2": {
    projectName: "자동차용 냉간압연강판 LCA 프로젝트",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    owner: {
      name: "박자동",
      department: "자동차용강재 연구팀",
      position: "책임연구원"
    },
    reason: "자동차용 냉간압연강판의 환경 영향을 평가하여 친환경 자동차 개발 지원",
    period: { start: "2024-01-01", end: "2024-06-30" },
    approvalStatus: {
      status: "approved",
      approvedAt: "2024-01-12",
      approvedBy: "박승인"
    },
    productName: "냉간압연강판",
    majorFunction: "자동차 외판 및 내장재",
    secondaryFunction: "표면 품질 및 치수 정밀도",
    productClass: "자동차용 냉간압연강판",
    productFeatures: "항복강도 180-350MPa, 표면 품질 A급",
    packaging: { min: "PE 필름", out: "강재 코일" },
  },
  "proj-3": {
    projectName: "건축용 H형강 LCA 프로젝트",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-19",
    owner: {
      name: "이건축",
      department: "건축용강재 연구팀",
      position: "선임연구원"
    },
    reason: "건축용 H형강의 환경 영향을 평가하여 친환경 건축물 설계 지원",
    period: { start: "2024-01-01", end: "2024-12-31" },
    approvalStatus: {
      status: "pending"
    },
    productName: "H형강",
    majorFunction: "건축물 구조재",
    secondaryFunction: "내진 및 내화 성능",
    productClass: "건축용 구조용강재",
    productFeatures: "항복강도 235-355MPa, 내진 성능 보장",
    packaging: { min: "방청유", out: "강재 번들" },
  },
  "proj-4": {
    projectName: "조선용 후판 LCA 프로젝트",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-17",
    owner: {
      name: "최조선",
      department: "조선용강재 연구팀",
      position: "연구원"
    },
    reason: "조선용 후판의 환경 영향을 평가하여 친환경 선박 건조 지원",
    period: { start: "2024-01-01", end: "2024-12-31" },
    approvalStatus: {
      status: "rejected",
      rejectedAt: "2024-01-10",
      rejectedBy: "이반려",
      rejectionReason: "연구 범위가 너무 광범위합니다. 구체적인 공정 범위를 명시해주세요."
    },
    productName: "조선용 후판",
    majorFunction: "선체 구조재",
    secondaryFunction: "내식성 및 용접성",
    productClass: "조선용 구조용강판",
    productFeatures: "항복강도 235-355MPa, 내식성 보장",
    packaging: { min: "방청유", out: "강재 팔레트" },
  },
  "proj-5": {
    projectName: "전기강판 LCA 프로젝트",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-16",
    owner: {
      name: "정전기",
      department: "전기강재 연구팀",
      position: "수석연구원"
    },
    reason: "전기강판의 환경 영향을 평가하여 친환경 전기기기 개발 지원",
    period: { start: "2023-07-01", end: "2024-06-30" },
    approvalStatus: {
      status: "approved",
      approvedAt: "2024-01-07",
      approvedBy: "최승인"
    },
    productName: "전기강판",
    majorFunction: "전기기기 코어재",
    secondaryFunction: "자기 특성 및 전기적 특성",
    productClass: "전기용 강판",
    productFeatures: "자기 유도 1.7T 이상, 철손 2.0W/kg 이하",
    packaging: { min: "절연지", out: "강재 코일" },
  },
}

// 프로젝트별 분석 범위 데이터 (철강 산업 중심)
export const mockAnalysisScopes: Record<string, Partial<AnalysisScope>> = {
  "proj-1": {
    lifecycle: "Gate-to-Gate",
    processOverview: {
      name: "고강도 강판 제조 공정",
      subProcesses: ["제철", "제강", "압연", "열처리", "도금"],
      description: "고강도 강판 제조를 위한 제철부터 최종 제품까지의 전체 공정",
    },
    dataQuality: {
      temporal: "2023년 1월 ~ 12월",
      technical: "현재 운영 중인 제철소 생산 기술",
      geographic: "한국 포항제철소",
      source: "primary",
      dataSources: "포항제철소 생산 데이터, 에너지 사용량 데이터",
      peerReview: "내부 LCA 전문가 검토 완료",
    },
    exclusions: { 
      massCutoff: "1%", 
      rules: "질량 기준 1% 미만, 에너지 기준 1% 미만, 환경영향 기준 1% 미만 제외" 
    },
    assumptions: "표준 대기 조건, 정상 생산 조건, 평균 운전 효율 적용",
    methodSet: "EF 3.1",
    summary: "고강도 강판 1톤 생산에 대한 게이트-투-게이트 LCA 연구",
  },
  "proj-2": {
    lifecycle: "Cradle-to-Gate",
    processOverview: {
      name: "냉간압연강판 제조 공정",
      subProcesses: ["제철", "제강", "열간압연", "냉간압연", "열처리"],
      description: "냉간압연강판 제조를 위한 원료부터 최종 제품까지의 전체 공정",
    },
    dataQuality: {
      temporal: "2023년 7월 ~ 12월",
      technical: "현재 운영 중인 압연 공장 기술",
      geographic: "한국 광양제철소",
      source: "primary",
      dataSources: "광양제철소 생산 데이터, 에너지 사용량 데이터",
      peerReview: "내부 LCA 전문가 검토 완료",
    },
    exclusions: { 
      massCutoff: "1%", 
      rules: "질량 기준 1% 미만, 에너지 기준 1% 미만, 환경영향 기준 1% 미만 제외" 
    },
    assumptions: "표준 대기 조건, 정상 생산 조건, 평균 운전 효율 적용",
    methodSet: "EF 3.1",
    summary: "냉간압연강판 1톤 생산에 대한 크래들-투-게이트 LCA 연구",
  },
  "proj-3": {
    lifecycle: "Cradle-to-Grave",
    processOverview: {
      name: "H형강 생산 및 사용 공정",
      subProcesses: ["제철", "제강", "압연", "성형", "건축물 사용", "폐기"],
      description: "H형강 생산부터 건축물 사용 및 폐기까지의 전체 생명주기",
    },
    dataQuality: {
      temporal: "2023년 1월 ~ 12월",
      technical: "현재 운영 중인 제철소 및 건축 기술",
      geographic: "한국 전역",
      source: "mixed",
      dataSources: "포항제철소 생산 데이터, 건축물 사용 데이터, 폐기 데이터",
      peerReview: "내부 LCA 전문가 및 건축 전문가 검토 완료",
    },
    exclusions: { 
      massCutoff: "1%", 
      rules: "질량 기준 1% 미만, 에너지 기준 1% 미만, 환경영향 기준 1% 미만 제외" 
    },
    assumptions: "표준 대기 조건, 정상 생산 조건, 평균 운전 효율, 50년 사용 수명 적용",
    methodSet: "EF 3.1",
    summary: "H형강 1톤의 전체 생명주기에 대한 크래들-투-그레이브 LCA 연구",
  },
}

// 프로젝트별 LCI 데이터 (철강 산업 중심)
export const mockLciItemsByProject: Record<string, LciItem[]> = {
  "proj-1": [
    // 원료 투입
    { id: "1", process: "제철공정", flow: "철광석", direction: "in", qty: 1500, unit: "kg" },
    { id: "2", process: "제철공정", flow: "코크스", direction: "in", qty: 450, unit: "kg" },
    { id: "3", process: "제철공정", flow: "석회석", direction: "in", qty: 200, unit: "kg" },
    { id: "4", process: "제철공정", flow: "전력", direction: "in", qty: 800, unit: "kWh" },
    { id: "5", process: "제철공정", flow: "천연가스", direction: "in", qty: 120, unit: "m³" },
    
    // 중간 제품
    { id: "6", process: "제강공정", flow: "선철", direction: "in", qty: 1000, unit: "kg" },
    { id: "7", process: "제강공정", flow: "스크랩", direction: "in", qty: 200, unit: "kg" },
    { id: "8", process: "제강공정", flow: "산소", direction: "in", qty: 50, unit: "m³" },
    { id: "9", process: "제강공정", flow: "전력", direction: "in", qty: 300, unit: "kWh" },
    
    // 압연 공정
    { id: "10", process: "압연공정", flow: "슬라브", direction: "in", qty: 1100, unit: "kg" },
    { id: "11", process: "압연공정", flow: "전력", direction: "in", qty: 400, unit: "kWh" },
    { id: "12", process: "압연공정", flow: "연료", direction: "in", qty: 80, unit: "GJ" },
    
    // 열처리 공정
    { id: "13", process: "열처리공정", flow: "압연강판", direction: "in", qty: 1050, unit: "kg" },
    { id: "14", process: "열처리공정", flow: "전력", direction: "in", qty: 200, unit: "kWh" },
    { id: "15", process: "열처리공정", flow: "가스", direction: "in", qty: 60, unit: "m³" },
    
    // 최종 제품
    { id: "16", process: "최종공정", flow: "고강도강판", direction: "out", qty: 1000, unit: "kg" },
    
    // 부산물
    { id: "17", process: "제철공정", flow: "슬래그", direction: "out", qty: 300, unit: "kg" },
    { id: "18", process: "제철공정", flow: "고로가스", direction: "out", qty: 2000, unit: "m³" },
    { id: "19", process: "제강공정", flow: "제강슬래그", direction: "out", qty: 150, unit: "kg" },
  ],
  "proj-2": [
    // 원료 투입
    { id: "1", process: "제철공정", flow: "철광석", direction: "in", qty: 1400, unit: "kg" },
    { id: "2", process: "제철공정", flow: "코크스", direction: "in", qty: 420, unit: "kg" },
    { id: "3", process: "제철공정", flow: "석회석", direction: "in", qty: 180, unit: "kg" },
    { id: "4", process: "제철공정", flow: "전력", direction: "in", qty: 750, unit: "kWh" },
    
    // 열간압연 공정
    { id: "5", process: "열간압연공정", flow: "슬라브", direction: "in", qty: 1050, unit: "kg" },
    { id: "6", process: "열간압연공정", flow: "전력", direction: "in", qty: 350, unit: "kWh" },
    { id: "7", process: "열간압연공정", flow: "연료", direction: "in", qty: 70, unit: "GJ" },
    
    // 냉간압연 공정
    { id: "8", process: "냉간압연공정", flow: "열간압연강판", direction: "in", qty: 1000, unit: "kg" },
    { id: "9", process: "냉간압연공정", flow: "전력", direction: "in", qty: 500, unit: "kWh" },
    { id: "10", process: "냉간압연공정", flow: "냉각수", direction: "in", qty: 200, unit: "m³" },
    
    // 열처리 공정
    { id: "11", process: "열처리공정", flow: "냉간압연강판", direction: "in", qty: 950, unit: "kg" },
    { id: "12", process: "열처리공정", flow: "전력", direction: "in", qty: 150, unit: "kWh" },
    { id: "13", process: "열처리공정", flow: "가스", direction: "in", qty: 40, unit: "m³" },
    
    // 최종 제품
    { id: "14", process: "최종공정", flow: "냉간압연강판", direction: "out", qty: 900, unit: "kg" },
    
    // 부산물
    { id: "15", process: "제철공정", flow: "슬래그", direction: "out", qty: 280, unit: "kg" },
    { id: "16", process: "냉간압연공정", flow: "폐유", direction: "out", qty: 5, unit: "kg" },
  ],
  "proj-3": [
    // 생산 단계
    { id: "1", process: "제철공정", flow: "철광석", direction: "in", qty: 1600, unit: "kg" },
    { id: "2", process: "제철공정", flow: "코크스", direction: "in", qty: 480, unit: "kg" },
    { id: "3", process: "제철공정", flow: "전력", direction: "in", qty: 850, unit: "kWh" },
    
    // 성형 공정
    { id: "4", process: "성형공정", flow: "슬라브", direction: "in", qty: 1200, unit: "kg" },
    { id: "5", process: "성형공정", flow: "전력", direction: "in", qty: 600, unit: "kWh" },
    { id: "6", process: "성형공정", flow: "연료", direction: "in", qty: 100, unit: "GJ" },
    
    // 최종 제품
    { id: "7", process: "최종공정", flow: "H형강", direction: "out", qty: 1100, unit: "kg" },
    
    // 사용 단계 (50년 사용)
    { id: "8", process: "사용단계", flow: "유지보수에너지", direction: "in", qty: 50, unit: "kWh" },
    
    // 폐기 단계
    { id: "9", process: "폐기단계", flow: "폐H형강", direction: "out", qty: 1100, unit: "kg" },
    { id: "10", process: "폐기단계", flow: "재활용에너지", direction: "in", qty: 200, unit: "kWh" },
  ],
}

// 프로젝트별 LCIA 결과 데이터 (철강 산업 중심)
export const mockLciaResultsByProject: Record<string, Array<{ category: string; value: number; unit: string }>> = {
  "proj-1": [
    { category: "기후변화 (GWP100)", value: 1850.2, unit: "kg CO₂-eq" },
    { category: "산성화 (AP)", value: 12.4, unit: "mol H+ eq" },
    { category: "부영양화 (EP)", value: 3.2, unit: "kg PO4 eq" },
    { category: "수자원 이용", value: 45.8, unit: "m³" },
    { category: "화석연료 고갈", value: 1250.6, unit: "MJ" },
    { category: "광화학산화물생성 (POCP)", value: 0.8, unit: "kg NMVOC eq" },
    { category: "자원고갈 (ADP)", value: 0.15, unit: "kg Sb eq" },
  ],
  "proj-2": [
    { category: "기후변화 (GWP100)", value: 1650.8, unit: "kg CO₂-eq" },
    { category: "산성화 (AP)", value: 10.2, unit: "mol H+ eq" },
    { category: "부영양화 (EP)", value: 2.8, unit: "kg PO4 eq" },
    { category: "수자원 이용", value: 38.5, unit: "m³" },
    { category: "화석연료 고갈", value: 1100.3, unit: "MJ" },
    { category: "광화학산화물생성 (POCP)", value: 0.6, unit: "kg NMVOC eq" },
    { category: "자원고갈 (ADP)", value: 0.12, unit: "kg Sb eq" },
  ],
  "proj-3": [
    { category: "기후변화 (GWP100)", value: 2100.5, unit: "kg CO₂-eq" },
    { category: "산성화 (AP)", value: 15.8, unit: "mol H+ eq" },
    { category: "부영양화 (EP)", value: 4.1, unit: "kg PO4 eq" },
    { category: "수자원 이용", value: 52.3, unit: "m³" },
    { category: "화석연료 고갈", value: 1400.2, unit: "MJ" },
    { category: "광화학산화물생성 (POCP)", value: 1.2, unit: "kg NMVOC eq" },
    { category: "자원고갈 (ADP)", value: 0.18, unit: "kg Sb eq" },
  ],
}

// 기존 데이터 유지 (하위 호환성)
export const mockProjectMeta: Partial<ProjectMeta> = mockProjectMetas["proj-1"]
export const mockAnalysisScope: Partial<AnalysisScope> = mockAnalysisScopes["proj-1"]
export const mockLciItems: LciItem[] = mockLciItemsByProject["proj-1"]
export const mockLciaResults: Array<{ category: string; value: number; unit: string }> = mockLciaResultsByProject["proj-1"]

// 리포트 모델 더미 데이터
export const mockReportModel = {
  projectInfo: {
    name: "고강도 강판 LCA 프로젝트",
    date: "2024-01-20",
    version: "1.0",
    author: "철강 LCA 연구팀",
  },
  productInfo: {
    productName: "고강도 강판 (AHSS)",
    owner: "철강 LCA 연구팀",
    period: "2024-01-01 ~ 2024-12-31",
    productClass: "고강도 자동차용 강판",
    majorFunction: "자동차 차체 구조재",
    secondaryFunction: "충격 흡수 및 경량화",
    unit: "1 ton",
    packaging: {
      min: "PE 필름",
      out: "강재 팔레트",
    },
    productFeatures: "항복강도 980MPa 이상, 연신율 15% 이상",
  },
  scope: {
    lifecycle: "Gate-to-Gate",
    dataQuality: {
      temporal: "2023년 1월 ~ 12월",
      technical: "현재 운영 중인 제철소 생산 기술",
      geographic: "한국 포항제철소",
      source: "primary",
    },
  },
  methodTable: [
    {
      method: "EF 3.1",
      category: "기후변화",
      indicator: "GWP100",
      unit: "kg CO₂-eq",
    },
    {
      method: "EF 3.1",
      category: "산성화",
      indicator: "AP",
      unit: "mol H+ eq",
    },
    {
      method: "EF 3.1",
      category: "부영양화",
      indicator: "EP",
      unit: "kg PO4 eq",
    },
  ],
  resultsTable: [
    {
      category: "기후변화 (GWP100)",
      preManufacture: 0,
      beforeManufacturing: 0,
      manufacturing: 1850.2,
      total: 1850.2,
      unit: "kg CO₂-eq",
      manufacturingContribution: 100,
      totalContribution: 100,
    },
    {
      category: "산성화 (AP)",
      preManufacture: 0,
      beforeManufacturing: 0,
      manufacturing: 12.4,
      total: 12.4,
      unit: "mol H+ eq",
      manufacturingContribution: 100,
      totalContribution: 100,
    },
    {
      category: "부영양화 (EP)",
      preManufacture: 0,
      beforeManufacturing: 0,
      manufacturing: 3.2,
      total: 3.2,
      unit: "kg PO4 eq",
      manufacturingContribution: 100,
      totalContribution: 100,
    },
  ],
}

// LCIA 영향범주 더미 (철강 산업 중심)
export const mockLciaCategories: string[] = [
  "기후변화 (GWP100)",
  "오존층 고갈 (ODP)",
  "산성화 (AP)",
  "부영양화 (EP)",
  "인체 독성 (HTP)",
  "수자원 이용",
  "화석연료 고갈",
  "광화학산화물생성 (POCP)",
  "자원고갈 (ADP)",
  "생태독성 (ETP)",
]

// 철강 산업 특화 데이터
export const steelIndustryData = {
  // 제철소 정보
  steelPlants: [
    {
      id: "plant-1",
      name: "포항제철소",
      location: "경상북도 포항시",
      capacity: "500만톤/년",
      products: ["고강도강판", "자동차용강판", "조선용강판"],
    },
    {
      id: "plant-2", 
      name: "광양제철소",
      location: "전라남도 광양시",
      capacity: "1800만톤/년",
      products: ["열간압연강판", "냉간압연강판", "후판"],
    },
    {
      id: "plant-3",
      name: "당진제철소",
      location: "충청남도 당진시",
      capacity: "400만톤/년",
      products: ["전기강판", "특수강", "스테인리스강"],
    },
  ],
  
  // 철강 제품 분류
  steelProducts: [
    {
      category: "자동차용강판",
      types: ["고강도강판(AHSS)", "냉간압연강판", "도금강판"],
      applications: ["차체구조재", "충격흡수부재", "외판"],
    },
    {
      category: "건축용강재",
      types: ["H형강", "I형강", "각형강관", "원형강관", "철근"],
      applications: ["구조재", "기둥", "보", "트러스", "콘크리트 보강"],
    },
    {
      category: "조선용강판",
      types: ["일반구조용강판", "용접구조용강판", "내식성강판", "후판"],
      applications: ["선체", "갑판", "격벽", "용접부"],
    },
    {
      category: "전기용강재",
      types: ["전기강판", "실리콘강판", "무방향성전기강판"],
      applications: ["변압기", "모터", "발전기", "전자기기"],
    },
    {
      category: "특수강재",
      types: ["스테인리스강", "공구강", "베어링강", "스프링강"],
      applications: ["화학설비", "공구", "베어링", "스프링"],
    },
  ],
  
  // 환경 영향 요인
  environmentalFactors: [
    {
      process: "제철공정",
      factors: ["CO2 배출", "대기오염물질", "폐열", "슬래그"],
      impact: "높음",
    },
    {
      process: "제강공정", 
      factors: ["전력사용", "산소소비", "폐가스", "제강슬래그"],
      impact: "중간",
    },
    {
      process: "압연공정",
      factors: ["전력사용", "연료소비", "냉각수", "폐유"],
      impact: "중간",
    },
    {
      process: "열처리공정",
      factors: ["가스소비", "전력사용", "냉각수", "폐열"],
      impact: "중간",
    },
    {
      process: "도금공정",
      factors: ["금속소비", "화학약품", "폐수", "폐가스"],
      impact: "높음",
    },
  ],
  
  // LCA 방법론 정보
  lcaMethods: [
    {
      name: "EF 3.1",
      description: "European Commission의 Environmental Footprint 방법론",
      categories: ["기후변화", "산성화", "부영양화", "인체독성"],
      version: "3.1",
    },
    {
      name: "ReCiPe 2016",
      description: "Netherlands의 ReCiPe 방법론",
      categories: ["기후변화", "오존층고갈", "산성화", "부영양화"],
      version: "2016",
    },
    {
      name: "CML 2002",
      description: "Leiden University의 CML 방법론",
      categories: ["기후변화", "오존층고갈", "산성화", "부영양화"],
      version: "2002",
    },
  ],
  
  // 데이터 품질 정보
  dataQuality: {
    primary: {
      description: "제철소에서 직접 수집한 생산 데이터",
      reliability: "높음",
      completeness: "완전",
      temporalCorrelation: "최신",
      geographicalCorrelation: "일치",
      technologicalCorrelation: "일치",
    },
    secondary: {
      description: "문헌 및 데이터베이스에서 수집한 데이터",
      reliability: "보통",
      completeness: "부분적",
      temporalCorrelation: "보통",
      geographicalCorrelation: "보통",
      technologicalCorrelation: "보통",
    },
  },
}
