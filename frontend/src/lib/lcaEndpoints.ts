export const LCA_ENDPOINTS = {
  base: "/api/v1/lca/base",            // 기준데이터
  actual: "/api/v1/lca/actual",        // 실적데이터
  transport: "/api/v1/lca/transport",  // 운송데이터
  process: "/api/v1/lca/process",      // 공정데이터
  manage: (seg: "mat"|"util"|"waste"|"source") =>
    `/api/v1/lca/manage?segment=${seg}`, // 데이터관리 세그먼트
} as const;

export type LcaTabKey = keyof Omit<typeof LCA_ENDPOINTS, 'manage'>;
export type ManageSegment = "mat" | "util" | "waste" | "source";
