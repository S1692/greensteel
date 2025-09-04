import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { env } from './env';

// 요청 중복 방지를 위한 pending requests 관리
const pendingRequests = new Map<string, AbortController>();

// 요청 키 생성 함수
const generateRequestKey = (config: AxiosRequestConfig): string => {
  const { method, url, data, params } = config;
  return `${method?.toUpperCase() || 'GET'}:${url}:${JSON.stringify(data || {})}:${JSON.stringify(params || {})}`;
};

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
      ((axiosError.response?.status && axiosError.response.status >= 500) ||
        !axiosError.response)
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
    // 요청 키 생성
    const requestKey = generateRequestKey(config);

    // 이미 진행 중인 동일한 요청이 있으면 취소
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey);
      if (controller) {
        controller.abort();
      }
    }

    // 새로운 AbortController 생성
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);

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
  response => {
    // 요청 완료 시 pending requests에서 제거
    const requestKey = generateRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  async error => {
    // 요청 완료 시 pending requests에서 제거
    if (error.config) {
      const requestKey = generateRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

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
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

// API 엔드포인트 헬퍼 (Gateway를 통한 라우팅)
export const apiEndpoints = {
  // Gateway 엔드포인트
  gateway: {
    health: '/health',
    status: '/status',
    routing: '/routing',
    architecture: '/architecture',
  },
  // Auth Service (Gateway를 통해)
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
  // Countries API (Gateway를 통해)
  countries: {
    search: '/api/v1/countries/search',
    all: '/api/v1/countries',
    byCode: '/api/v1/countries/code',
    byUnlocode: '/api/v1/countries/unlocode',
  },
  // Calculation Service (Gateway를 통해)
  calculation: {
    process: '/api/calculation/process',
    fuel: '/api/calculation/fuel',
    material: '/api/calculation/material',
    electricity: '/api/calculation/electricity',
    precursors: '/api/calculation/precursors',
    precursorsBatch: '/api/calculation/precursors/batch',
    cbam: '/api/calculation/cbam',
    stats: '/api/calculation/stats',
    history: '/api/calculation/history',
    precursor: '/api/calculation/precursor',
  },
  // Data Upload (Gateway를 통해)
  upload: {
    data: '/api/datagather/upload',
    validate: '/api/datagather/validate',
  },
  // Dashboard (Gateway를 통해)
  dashboard: {
    overview: '/api/dashboard/overview',
    stats: '/api/dashboard/stats',
  },
  // Companies API (Gateway를 통해)
  companies: {
    list: '/api/v1/companies',
    create: '/api/v1/companies',
    update: '/api/v1/companies',
    delete: '/api/v1/companies',
  },
  // Settings (Gateway를 통해)
  settings: {
    profile: '/api/settings/profile',
    organization: '/api/settings/organization',
    users: '/api/settings/users',
    apiKeys: '/api/settings/api-keys',
  },
  // DataGather Service (Gateway를 통해)
  datagather: {
    aiProcess: '/api/datagather/ai-process',
    feedback: '/api/datagather/feedback',
    inputData: '/api/datagather/input-data',
    outputData: '/api/datagather/output-data',
    processData: '/api/datagather/process-data',
    aiProcessStream: '/api/datagather/ai-process-stream',
  },
  // Chatbot Service (Gateway를 통해)
  chatbot: {
    chat: '/chatbot/chat',
    health: '/chatbot/health',
  },
  // LCA Service (Gateway를 통해)
  lca: {
    health: '/lca/health',
    projects: '/api/lci/projects',
    calculations: '/api/lci/calculations',
    templates: '/api/lci/templates',
  },
  // CBAM Service API Endpoints
  cbam: {
    // Install (사업장) API (Gateway를 거쳐 CBAM 서비스로 연결)
    install: {
      create: '/api/v1/cbam/install/',  // Gateway를 거쳐 CBAM 서비스의 /api/v1/cbam/install/로 연결
      list: '/api/v1/cbam/install/',
      get: (id: number) => `/api/v1/cbam/install/${id}`,
      update: (id: number) => `/api/v1/cbam/install/${id}`,
      delete: (id: number) => `/api/v1/cbam/install/${id}`,
      names: '/api/v1/cbam/install/names'  // CBAM 서비스 스키마와 일치
    },
    
    // Product (제품) API (Gateway를 거쳐 CBAM 서비스로 연결)
    product: {
      create: '/api/v1/cbam/product/',  // Gateway를 거쳐 CBAM 서비스의 /api/v1/cbam/product/로 연결
      list: '/api/v1/cbam/product/',
      get: (id: number) => `/api/v1/cbam/product/${id}`,
      update: (id: number) => `/api/v1/cbam/product/${id}`,
      delete: (id: number) => `/api/v1/cbam/product/${id}`,
      byInstall: (install_id: number) => `/api/v1/cbam/product/install/${install_id}`,
      names: '/api/v1/cbam/product/names'  // CBAM 서비스 스키마와 일치
    },
    
    // Process (공정) API (Gateway를 거쳐 CBAM 서비스로 연결)
    process: {
      create: '/api/v1/cbam/process/',  // Gateway를 거쳐 CBAM 서비스의 /api/v1/cbam/process/로 연결
      list: '/api/v1/cbam/process/',
      get: (id: number) => `/api/v1/cbam/process/${id}`,
      update: (id: number) => `/api/v1/cbam/process/${id}`,
      delete: (id: number) => `/api/v1/cbam/process/${id}`,
      names: '/api/v1/cbam/process/names'  // CBAM 서비스 스키마와 일치
    },
    
    // Edge (노드 연결) API
    edge: {
      create: '/api/v1/cbam/edge',
      list: '/api/v1/cbam/edge',
      get: (id: number) => `/api/v1/cbam/edge/${id}`,
      update: (id: number) => `/api/v1/cbam/edge/${id}`,
      delete: (id: number) => `/api/v1/cbam/edge/${id}`,
      saveFlow: '/api/v1/cbam/edge/save-flow',
    },
    
    // Mapping (노드 위치) API
    mapping: {
      create: '/api/v1/cbam/mapping/mapping',
      list: '/api/v1/cbam/mapping/mapping',
      get: (id: number) => `/api/v1/cbam/mapping/mapping/${id}`,
      update: (id: number) => `/api/v1/cbam/mapping/mapping/${id}`,
      delete: (id: number) => `/api/v1/cbam/mapping/mapping/${id}`,
      lookup: (hs_code: string) => `/api/v1/cbam/mapping/cncode/lookup/${hs_code}`,
      search: {
        hs: (hs_code: string) => `/api/v1/cbam/mapping/mapping/search/hs/${hs_code}`,
        cn: (cn_code: string) => `/api/v1/cbam/mapping/mapping/search/cn/${cn_code}`,
        goods: (goods_name: string) => `/api/v1/cbam/mapping/mapping/search/goods/${goods_name}`,
      },
      stats: '/api/v1/cbam/mapping/mapping/stats',
      batch: '/api/v1/cbam/mapping/mapping/batch',
    },
    
    // Matdir (원자재 투입) API
    matdir: {
      create: '/api/v1/cbam/matdir/create',
      list: '/api/v1/cbam/matdir/list',
      get: (id: number) => `/api/v1/cbam/matdir/${id}`,
      update: (id: number) => `/api/v1/cbam/matdir/${id}`,
      delete: (id: number) => `/api/v1/cbam/matdir/${id}`,
      byProcess: (process_id: number) => `/api/v1/cbam/matdir/process/${process_id}`,
      calculate: '/api/v1/cbam/matdir/calculate',
      totalByProcess: (process_id: number) => `/api/v1/cbam/matdir/process/${process_id}/total`
    },
    
    // Fueldir (연료 투입) API
    fueldir: {
      create: '/api/v1/cbam/fueldir/create',
      list: '/api/v1/cbam/fueldir/list',
      get: (id: number) => `/api/v1/cbam/fueldir/${id}`,
      update: (id: number) => `/api/v1/cbam/fueldir/${id}`,
      delete: (id: number) => `/api/v1/cbam/fueldir/${id}`,
      byProcess: (process_id: number) => `/api/v1/cbam/fueldir/process/${process_id}`,
      calculate: '/api/v1/cbam/fueldir/calculate',
      totalByProcess: (process_id: number) => `/api/v1/cbam/fueldir/process/${process_id}/total`
    },
    
    // Fuel Master API
    fuelMaster: {
      list: '/api/v1/cbam/fueldir/fuel-master',
      search: (fuel_name: string) => `/api/v1/cbam/fueldir/fuel-master/search/${fuel_name}`,
      getFactor: (fuel_name: string) => `/api/v1/cbam/fueldir/fuel-master/factor/${fuel_name}`,
      autoFactor: '/api/v1/cbam/fueldir/auto-factor'
    },
    
    // Product-Process 관계 API
    productProcess: {
      create: '/api/v1/cbam/productprocess',
      list: '/api/v1/cbam/productprocess',
      get: (id: number) => `/api/v1/cbam/productprocess/${id}`,
      update: (id: number) => `/api/v1/cbam/productprocess/${id}`,
      delete: (id: number) => `/api/v1/cbam/productprocess/${id}`,
      byProduct: (product_id: number) => `/api/v1/cbam/productprocess/by-product/${product_id}`,
      byProcess: (process_id: number) => `/api/v1/cbam/productprocess/by-process/${process_id}`,
      stats: '/api/v1/cbam/productprocess/stats'
    },

    // Report (보고서) API
    report: {
      gasEmission: (install_id: number) => `/api/v1/cbam/report/gas-emission/${install_id}`,
      stats: (install_id: number) => `/api/v1/cbam/report/stats/${install_id}`,
      installations: '/api/v1/cbam/report/installations'
    },
    
    // Calculation (계산) API
    calculation: {
      create: '/api/v1/cbam/calculation',
      list: '/api/v1/cbam/calculation',
      get: (id: number) => `/api/v1/cbam/calculation/${id}`,
      update: (id: number) => `/api/v1/cbam/calculation/${id}`,
      delete: (id: number) => `/api/v1/cbam/calculation/${id}`,
      run: (id: number) => `/api/v1/cbam/calculation/${id}/run`,
      export: (id: number) => `/api/v1/cbam/calculation/${id}/export`,
      // Process 배출량 계산 API (직접귀속배출량)
      process: {
        calculate: '/api/v1/cbam/calculation/emission/process/calculate',
        attrdir: (process_id: number) => `/api/v1/cbam/calculation/emission/process/${process_id}/attrdir`,
        attrdirAll: '/api/v1/cbam/calculation/emission/process/attrdir/all'
      },
      // Product 배출량 계산 API
      product: {
        calculate: '/api/v1/cbam/calculation/emission/product/calculate'
      }
    },
    
    // Dummy Data API
    dummy: {
      list: '/api/v1/cbam/dummy',
      get: (id: number) => `/api/v1/cbam/dummy/${id}`,
      health: '/api/v1/cbam/dummy/health',
      stats: '/api/v1/cbam/dummy/stats/count',
      processNames: '/api/v1/cbam/dummy/process-names',
      processNamesByPeriod: '/api/v1/cbam/dummy/process-names-by-period',
      productNames: '/api/v1/cbam/dummy/product-names',
      productNamesByPeriod: '/api/v1/cbam/dummy/product-names-by-period',
      products: {
        list: '/api/v1/cbam/dummy/products',
        processes: (productName: string) => `/api/v1/cbam/dummy/products/${encodeURIComponent(productName)}/processes`
      }
    }
  },
  // Material Master API
  materialMaster: {
    list: '/api/v1/cbam/matdir/material-master',
    search: (mat_name: string) => `/api/v1/cbam/matdir/material-master/search/${mat_name}`,
    getFactor: (mat_name: string) => `/api/v1/cbam/matdir/material-master/factor/${mat_name}`,
    autoFactor: '/api/v1/cbam/matdir/material-master/auto-factor'
  },
} as const;

// 인증 관련 유틸리티 함수들
export const authUtils = {
  // 로그인 상태 확인
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // 사용자 ID 가져오기
  getUserId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_id') || localStorage.getItem('user_email');
  },

  // 사용자 이메일 가져오기
  getUserEmail: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_email');
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    try {
      // 서버에 로그아웃 요청
      await axiosClient.post(apiEndpoints.auth.logout);
    } catch (error) {
      // 로그아웃 요청 실패 시에도 로컬 스토리지는 정리
    } finally {
      // 로컬 스토리지 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        window.location.href = '/';
      }
    }
  },

  // 토큰 갱신
  refreshToken: async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await axiosClient.post(apiEndpoints.auth.refresh, {
        refresh_token: refreshToken,
      });

      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        return true;
      }
      return false;
    } catch (error) {
      // 토큰 갱신 실패 시 로그아웃
      authUtils.logout();
      return false;
    }
  },
};

export default axiosClient;
