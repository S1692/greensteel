export const LCA_ENDPOINTS = {
  base: "/api/v1/lca/base",            // 실적정보
  actual: "/api/v1/lca/actual",        // 투입물
  output: "/api/v1/lca/output",        // 산출물
  transport: "/api/v1/lca/transport",  // 운송정보
  process: "/api/v1/lca/process",      // 공정정보
  manage: (seg: "mat"|"util"|"waste"|"source") =>
    `/api/v1/lca/manage?segment=${seg}`, // 데이터관리 세그먼트
} as const;

export type LcaTabKey = keyof Omit<typeof LCA_ENDPOINTS, 'manage'>;
export type ManageSegment = "mat" | "util" | "waste" | "source";
