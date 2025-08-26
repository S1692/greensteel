'use client';

import React, { useState, useEffect } from 'react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';
import { env } from '@/lib/env';
import { Wifi, Server, Activity, Globe, Settings, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface GatewayStatus {
  status: string;
  gateway: string;
  timestamp: string;
}

interface ServiceStatus {
  [key: string]: {
    status: string;
    url: string;
    response_time: number;
  };
}

interface RoutingInfo {
  gateway_name: string;
  architecture: string;
  domain_routing: Record<string, unknown>;
  supported_methods: string[];
  timeout_settings: Record<string, unknown>;
  ddd_features: Record<string, unknown>;
}

interface ArchitectureInfo {
  gateway: string;
  architecture: string;
  version: string;
  description: string;
  domains: Record<string, unknown>;
  features: Record<string, unknown>;
  layers: Record<string, unknown>;
}

const GatewayStatus: React.FC = () => {
  const [gatewayHealth, setGatewayHealth] = useState<GatewayStatus | null>(
    null
  );
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(
    null
  );
  const [routingInfo, setRoutingInfo] = useState<RoutingInfo | null>(null);
  const [architectureInfo, setArchitectureInfo] =
    useState<ArchitectureInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGatewayConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const healthResponse = await axiosClient.get(apiEndpoints.gateway.health);
      setGatewayHealth(healthResponse.data);

      const statusResponse = await axiosClient.get(apiEndpoints.gateway.status);
      setServiceStatus(statusResponse.data);

      const routingResponse = await axiosClient.get(
        apiEndpoints.gateway.routing
      );
      setRoutingInfo(routingResponse.data);

      const architectureResponse = await axiosClient.get(
        apiEndpoints.gateway.architecture
      );
      setArchitectureInfo(architectureResponse.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Gateway 연결 실패';
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error('Gateway 연결 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testGatewayConnection();
  }, []);

  return (
    <div className='bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-8 shadow-lg'>
      {/* 헤더 섹션 */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center space-x-4'>
          <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
            <Server className='w-6 h-6 text-white' />
          </div>
          <div>
            <h2 className='text-3xl font-bold text-gray-900'>기능 설명용 챗봇 도입 예정</h2>
            <p className='text-gray-600 text-lg'>Gateway 연결 상태 및 서비스 모니터링</p>
          </div>
        </div>
        <button
          onClick={testGatewayConnection}
          disabled={loading}
          className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2 text-lg font-medium'
        >
          {loading ? (
            <>
              <Activity className='w-5 h-5 animate-spin' />
              <span>테스트 중...</span>
            </>
          ) : (
            <>
              <Wifi className='w-5 h-5' />
              <span>연결 테스트</span>
            </>
          )}
        </button>
      </div>

      {/* 연결 정보 섹션 */}
      <div className='mb-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm'>
        <div className='flex items-center space-x-3 mb-4'>
          <Globe className='w-6 h-6 text-blue-600' />
          <h3 className='text-xl font-semibold text-gray-900'>연결 정보</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <p className='text-sm text-gray-600 mb-1'>
              <strong>Gateway URL:</strong>
            </p>
            <p className='text-lg font-mono text-blue-800 break-all'>
              {env.NEXT_PUBLIC_GATEWAY_URL}
            </p>
          </div>
          <div className='p-4 bg-green-50 rounded-lg'>
            <p className='text-sm text-gray-600 mb-1'>
              <strong>환경:</strong>
            </p>
            <p className='text-lg font-semibold text-green-800'>
              {env.NEXT_PUBLIC_ENV}
            </p>
          </div>
        </div>
      </div>

      {/* 오류 표시 */}
      {error && (
        <div className='mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-xl'>
          <div className='flex items-center space-x-3 mb-4'>
            <AlertCircle className='w-6 h-6 text-red-600' />
            <h3 className='text-xl font-semibold text-red-800'>연결 오류</h3>
          </div>
          <p className='text-red-700 text-lg'>{error}</p>
        </div>
      )}

      {/* Gateway 상태 */}
      {gatewayHealth && (
        <div className='mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl'>
          <div className='flex items-center space-x-3 mb-6'>
            <CheckCircle className='w-6 h-6 text-green-600' />
            <h3 className='text-xl font-semibold text-green-800'>
              Gateway 상태
            </h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center p-4 bg-white rounded-lg'>
              <div className='text-2xl font-bold text-green-600 mb-2'>상태</div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  gatewayHealth.status === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {gatewayHealth.status}
              </span>
            </div>
            <div className='text-center p-4 bg-white rounded-lg'>
              <div className='text-2xl font-bold text-green-600 mb-2'>이름</div>
              <div className='text-gray-700 font-medium'>
                {gatewayHealth.gateway}
              </div>
            </div>
            <div className='text-center p-4 bg-white rounded-lg'>
              <div className='text-2xl font-bold text-green-600 mb-2'>시간</div>
              <div className='text-gray-700 font-medium'>
                {new Date(gatewayHealth.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 서비스 상태 */}
      {serviceStatus && (
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-6'>
            <Activity className='w-6 h-6 text-purple-600' />
            <h3 className='text-xl font-semibold text-gray-900'>서비스 상태</h3>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {Object.entries(serviceStatus).map(([serviceName, service]) => (
              <div key={serviceName} className='p-6 bg-white border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200'>
                <div className='flex items-center justify-between mb-4'>
                  <span className='text-lg font-semibold capitalize text-gray-800'>{serviceName}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      service.status === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600'>
                    <strong>URL:</strong> <span className='font-mono'>{service.url}</span>
                  </p>
                  <p className='text-sm text-gray-600'>
                    <strong>응답시간:</strong> <span className='font-semibold text-blue-600'>{service.response_time}ms</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 라우팅 정보 */}
      {routingInfo && (
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-6'>
            <Settings className='w-6 h-6 text-indigo-600' />
            <h3 className='text-xl font-semibold text-gray-900'>라우팅 정보</h3>
          </div>
          <div className='bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm'>
            <pre className='text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap'>
              {JSON.stringify(routingInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 아키텍처 정보 */}
      {architectureInfo && (
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-6'>
            <Server className='w-6 h-6 text-cyan-600' />
            <h3 className='text-xl font-semibold text-gray-900'>아키텍처 정보</h3>
          </div>
          <div className='bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm'>
            <pre className='text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap'>
              {JSON.stringify(architectureInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 사용법 */}
      <div className='p-6 bg-blue-50 border-2 border-blue-200 rounded-xl'>
        <div className='flex items-center space-x-3 mb-6'>
          <Clock className='w-6 h-6 text-blue-600' />
          <h3 className='text-xl font-semibold text-blue-800'>사용법</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <ul className='text-blue-700 space-y-3'>
            <li className='flex items-start space-x-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
              <span>Gateway 서비스가 실행 중인지 확인하세요 (포트 8080)</span>
            </li>
            <li className='flex items-start space-x-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
              <span>환경 변수 NEXT_PUBLIC_GATEWAY_URL이 올바르게 설정되었는지 확인하세요</span>
            </li>
          </ul>
          <ul className='text-blue-700 space-y-3'>
            <li className='flex items-start space-x-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
              <span>&ldquo;연결 테스트&rdquo; 버튼을 클릭하여 Gateway 연결을 확인하세요</span>
            </li>
            <li className='flex items-start space-x-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
              <span>오류가 발생하면 Gateway 서비스 로그를 확인하세요</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GatewayStatus;
