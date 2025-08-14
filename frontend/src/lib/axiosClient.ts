import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { env } from './env';

// Gateway 외 요청 차단을 위한 인터셉터
const isGatewayRequest = (url: string): boolean => {
  try {
    const requestUrl = new URL(url);
    const gatewayUrl = new URL(env.NEXT_PUBLIC_GATEWAY_URL);
    return requestUrl.hostname === gatewayUrl.hostname;
  } catch {
    return false;
  }
};

// CSRF 토큰 가져오기
const getCSRFToken = (): string | null => {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta?.getAttribute('content') || null;
  }
  return null;
};

// 재시도 로직
const retryRequest = async (
  axiosInstance: AxiosInstance,
  config: AxiosRequestConfig,
  retries: number = 3
): Promise<AxiosResponse> => {
  try {
    return await axiosInstance(config);
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    if (
      retries > 0 &&
      (axiosError.response?.status >= 500 || !axiosError.response)
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      return retryRequest(axiosInstance, config, retries - 1);
    }
    throw error;
  }
};

// axios 인스턴스 생성
const axiosClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_GATEWAY_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
  config => {
    // Gateway 외 요청 차단
    if (config.url && !isGatewayRequest(config.baseURL + config.url)) {
      throw new Error(
        'Direct service access is not allowed. Use Gateway only.'
      );
    }

    // CSRF 토큰 추가
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // 인증 토큰 추가
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
  response => response,
  async error => {
    // 5xx 오류나 네트워크 오류 시 재시도
    if (error.response?.status >= 500 || !error.response) {
      const config = error.config;
      if (config && !config._retry) {
        config._retry = true;
        return retryRequest(axiosClient, config);
      }
    }

    // 401 오류 시 토큰 제거
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// API 엔드포인트 헬퍼
export const apiEndpoints = {
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    logout: '/v1/auth/logout',
    refresh: '/v1/auth/refresh',
  },
  lca: {
    projects: '/v1/lca/projects',
    calculations: '/v1/lca/calculations',
    templates: '/v1/lca/templates',
  },
  cbam: {
    reports: '/v1/cbam/reports',
    calculations: '/v1/cbam/calculations',
    templates: '/v1/cbam/templates',
  },
  upload: {
    data: '/v1/upload/data',
    validate: '/v1/upload/validate',
  },
  dashboard: {
    overview: '/v1/dashboard/overview',
    stats: '/v1/dashboard/stats',
  },
  settings: {
    profile: '/v1/settings/profile',
    organization: '/v1/settings/organization',
    users: '/v1/settings/users',
    apiKeys: '/v1/settings/api-keys',
  },
} as const;

export default axiosClient;
