'use client';

import React, { useState, useEffect } from 'react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface InstallationInfo {
  id: number;
  name: string;
  address?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  coordinates?: string;
  currency_code?: string;
}

interface ProcessInfo {
  id: number;
  process_name: string;
  start_period?: string;
  end_period?: string;
  materials: any[];
  fuels: any[];
  emission_amount?: number;
  aggregated_emission?: number;
}

interface ProductInfo {
  id: number;
  product_name: string;
  product_category: string;
  cn_code?: string;
  goods_name?: string;
  aggrgoods_name?: string;
  product_amount: number;
  prostart_period: string;
  proend_period: string;
  processes: ProcessInfo[];
}

interface GasEmissionReport {
  company_name: string;
  issue_date: string;
  start_period: string;
  end_period: string;
  installation: InstallationInfo;
  products: ProductInfo[];
  precursors: any[];
  emission_factor: {
    cbam_default_value?: number;
  };
  contact: {
    email?: string;
    phone?: string;
  };
}

interface Installation {
  id: number;
  name: string;
  address?: string;
  country?: string;
  city?: string;
  company_name?: string;
  product_count: number;
}

const GasEmissionReport: React.FC = () => {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedInstallId, setSelectedInstallId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [report, setReport] = useState<GasEmissionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사업장 목록 조회
  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        const response = await axiosClient.get(apiEndpoints.cbam.report.installations);
        setInstallations(response.data);
        console.log('✅ 사업장 목록 조회 성공:', response.data);
      } catch (error) {
        console.error('❌ 사업장 목록 조회 실패:', error);
        setError('사업장 목록을 불러올 수 없습니다.');
      }
    };

    fetchInstallations();
  }, []);

  // 보고서 조회
  const fetchReport = async () => {
    if (!selectedInstallId || !startDate || !endDate) {
      setError('사업장, 시작일, 종료일을 모두 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosClient.get(
        `${apiEndpoints.cbam.report.gasEmission(selectedInstallId)}?start_date=${startDate}&end_date=${endDate}`
      );
      setReport(response.data);
      console.log('✅ 가스 배출 보고서 조회 성공:', response.data);
    } catch (error) {
      console.error('❌ 가스 배출 보고서 조회 실패:', error);
      setError('보고서를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 기본값 설정
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">가스 배출 보고서</h1>
        <p className="text-gray-600">사업장별 가스 배출량 보고서를 조회할 수 있습니다.</p>
      </div>

      {/* 보고서 조회 폼 */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사업장 선택
            </label>
            <select
              value={selectedInstallId || ''}
              onChange={(e) => setSelectedInstallId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">사업장을 선택하세요</option>
              {installations.map((install) => (
                <option key={install.id} value={install.id}>
                  {install.name} ({install.product_count}개 제품)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작 기간
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료 기간
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '조회 중...' : '보고서 조회'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* 보고서 내용 */}
      {report && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gas Emission Report</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">발행처:</span> {report.company_name}
              </div>
              <div>
                <span className="font-medium">발행일자:</span> {new Date(report.issue_date).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          {/* 생산 기간 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">생산 기간</h3>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={new Date(report.start_period).toLocaleDateString('ko-KR')}
                readOnly
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <span className="text-gray-500">-</span>
              <input
                type="text"
                value={new Date(report.end_period).toLocaleDateString('ko-KR')}
                readOnly
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* 1. 시설군 정보 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. 시설군 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사업장 명</label>
                <input
                  type="text"
                  value={report.installation.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                <input
                  type="text"
                  value={report.installation.address || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">국가/코드</label>
                <input
                  type="text"
                  value={report.installation.country || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">도시</label>
                <input
                  type="text"
                  value={report.installation.city || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                <input
                  type="text"
                  value={report.installation.postal_code || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UN 통화 코드</label>
                <input
                  type="text"
                  value={report.installation.currency_code || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">좌표(위 경도)</label>
              <input
                type="text"
                value={report.installation.coordinates || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* 2. 제품 생산 info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 제품 생산 info</h3>
            {report.products.map((product, productIndex) => (
              <div key={product.id} className="mb-6 border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">품목군</label>
                  <input
                    type="text"
                    value={`${product.cn_code || ''} / ${product.product_name}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">생산 공정</h4>
                  {product.processes.map((process, processIndex) => (
                    <div key={process.id} className="mb-4 border border-gray-100 rounded p-3">
                      <div className="mb-2">
                        <span className="font-medium">공정{processIndex + 1} / 생산량</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* 원료 1 */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">원료1</label>
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="배출량"
                              value={process.materials[0]?.em_factor || ''}
                              readOnly
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                            />
                            <input
                              type="text"
                              placeholder="전구 물질 여부"
                              value={process.materials[0]?.item_name || ''}
                              readOnly
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                            />
                          </div>
                        </div>

                        {/* 원료 2 */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">원료2</label>
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="배출량"
                              value={process.materials[1]?.em_factor || ''}
                              readOnly
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                            />
                            <input
                              type="text"
                              placeholder="전구 물질 여부"
                              value={process.materials[1]?.item_name || ''}
                              readOnly
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                            />
                          </div>
                        </div>

                        {/* 연료 1 */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">연료</label>
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="배출량"
                              value={process.fuels[0]?.fuel_emfactor || ''}
                              readOnly
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                            />
                          </div>
                        </div>

                        {/* 연료 2 */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">연료</label>
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="배출량"
                              value={process.fuels[1]?.fuel_emfactor || ''}
                              readOnly
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 3. 전구체 info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">3. 전구체 info</h3>
            {report.precursors.map((precursor, index) => (
              <div key={precursor.id} className="mb-4">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전구물질 명 {index + 1}
                  </label>
                  <input
                    type="text"
                    value={precursor.precursor_name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이동 루트 (국가 or 생산 공정 소모 공정)
                  </label>
                  <input
                    type="text"
                    value={precursor.movement_route || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {precursor.consumption_processes.map((process: string, processIndex: number) => (
                    <div key={processIndex}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        소모 공정
                      </label>
                      <input
                        type="text"
                        value={process}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 4. 배출계수 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">4. 배출계수</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CBAM 기본값*</label>
              <input
                type="text"
                value={report.emission_factor.cbam_default_value || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* 5. Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={report.contact.email || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">대표 번호</label>
                <input
                  type="text"
                  value={report.contact.phone || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="text-right">
            <div className="text-sm text-gray-600">회사 직인 (인)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GasEmissionReport;
