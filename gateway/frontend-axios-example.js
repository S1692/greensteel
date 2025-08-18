// 프론트엔드에서 사용할 Axios 설정 예시
// 이 파일은 참고용이며, 실제로는 frontend/src/lib/axiosClient.ts를 사용합니다

import axios from "axios";

// Gateway URL 설정 (Railway 배포 후 실제 도메인으로 변경)
const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "https://your-gateway.railway.app";

// Axios 인스턴스 생성
const axiosClient = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
  (config) => {
    // 인증 토큰 추가
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 오류 시 토큰 제거
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

// API 엔드포인트
export const apiEndpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  cbam: {
    reports: "/cbam/reports",
    calculations: "/cbam/calculations",
  },
  datagather: {
    upload: "/datagather/upload",
    validate: "/datagather/validate",
  },
  lci: {
    projects: "/lci/projects",
    calculations: "/lci/calculations",
  },
};

// 사용 예시
export const authAPI = {
  // 회원가입
  register: async (userData) => {
    const response = await axiosClient.post(
      apiEndpoints.auth.register,
      userData,
    );
    return response.data;
  },

  // 로그인
  login: async (credentials) => {
    const response = await axiosClient.post(
      apiEndpoints.auth.login,
      credentials,
    );
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    const response = await axiosClient.post(apiEndpoints.auth.logout);
    return response.data;
  },
};

export default axiosClient;

// 환경변수 설정 예시 (.env.local)
/*
NEXT_PUBLIC_GATEWAY_URL=https://your-gateway.railway.app
*/

// 주의사항:
// 1. localhost, 127.0.0.1, http://*3000 등은 절대 사용하지 마세요
// 2. 프로덕션에서는 Railway의 퍼블릭 도메인만 사용하세요
// 3. Gateway를 통해서만 마이크로서비스에 접근하세요
