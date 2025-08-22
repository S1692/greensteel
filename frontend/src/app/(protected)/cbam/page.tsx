'use client';

import React, { useState } from 'react';
import CommonShell from '@/components/common/CommonShell';
import ProcessManager from '@/components/cbam/ProcessManager';
import { ReactFlowProvider } from '@xyflow/react';

// ============================================================================
// 🎯 CBAM 관리 페이지
// ============================================================================

export default function CBAMPage() {
  const [activeTab, setActiveTab] = useState<
<<<<<<< HEAD
    'overview' | 'flow' | 'calculation' | 'reports' | 'settings'
  >('overview');

  // 계산 탭 하위 탭 상태
  const [calculationSubTab, setCalculationSubTab] = useState<'calculator' | 'products'>('calculator');

  // CBAM 계산 관련 상태
  const [calculationData, setCalculationData] = useState({
    materialType: '',
    quantity: '',
    carbonIntensity: '',
    transportDistance: '',
    transportMode: 'sea',
    countryOfOrigin: '',
    euEtsPrice: '85.50'
  });

  const [calculationResult, setCalculationResult] = useState<{
    totalEmissions: number;
    cbamCharge: number;
    breakdown: {
      production: number;
      transport: number;
      total: number;
    };
  } | null>(null);

  // 제품 관리 관련 상태
  const [productForm, setProductForm] = useState({
    name: '',
    cn_code: '',
    period_start: '',
    period_end: '',
    production_qty: 0,
    sales_qty: 0,
    export_qty: 0,
    inventory_qty: 0,
    defect_rate: 0
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // CBAM 계산 함수
  const calculateCBAM = () => {
    const quantity = parseFloat(calculationData.quantity) || 0;
    const carbonIntensity = parseFloat(calculationData.carbonIntensity) || 0;
    const transportDistance = parseFloat(calculationData.transportDistance) || 0;
    const euEtsPrice = parseFloat(calculationData.euEtsPrice) || 85.50;

    // 생산 과정 탄소 배출량
    const productionEmissions = quantity * carbonIntensity;

    // 운송 과정 탄소 배출량 (간단한 계산)
    let transportEmissions = 0;
    switch (calculationData.transportMode) {
      case 'sea':
        transportEmissions = quantity * 0.02 * (transportDistance / 1000); // 해운: 0.02 tCO2/t-km
        break;
      case 'rail':
        transportEmissions = quantity * 0.03 * (transportDistance / 1000); // 철도: 0.03 tCO2/t-km
        break;
      case 'road':
        transportEmissions = quantity * 0.08 * (transportDistance / 1000); // 도로: 0.08 tCO2/t-km
        break;
      case 'air':
        transportEmissions = quantity * 0.15 * (transportDistance / 1000); // 항공: 0.15 tCO2/t-km
        break;
    }

    const totalEmissions = productionEmissions + transportEmissions;
    const cbamCharge = totalEmissions * euEtsPrice;

    setCalculationResult({
      totalEmissions,
      cbamCharge,
      breakdown: {
        production: productionEmissions,
        transport: transportEmissions,
        total: totalEmissions
      }
    });
  };

  // 제품 입력 변경 핸들러
  const handleProductInputChange = (field: string, value: string | number) => {
    setProductForm((prev: typeof productForm) => ({
      ...prev,
      [field]: value
    }));
  };

  // 제품 제출 핸들러
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setToast({
        message: '제품이 성공적으로 생성되었습니다!',
        type: 'success'
      });

      // 폼 초기화
      setProductForm({
        name: '',
        cn_code: '',
        period_start: '',
        period_end: '',
        production_qty: 0,
        sales_qty: 0,
        export_qty: 0,
        inventory_qty: 0,
        defect_rate: 0
      });

    } catch (error) {
      console.error('제품 생성 실패:', error);
      setToast({
        message: '제품 생성에 실패했습니다.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

=======
    'overview' | 'flow' | 'reports' | 'settings'
  >('overview');

>>>>>>> origin/main
  const renderOverview = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 개요</h3>
        <p className='stitch-caption text-white/60'>
          탄소국경조정메커니즘(CBAM)은 EU가 수입되는 특정 상품의 탄소 배출량에
          대해 탄소 가격을 부과하는 제도입니다.
        </p>
        <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='p-4 bg-white/5 rounded-lg'>
            <h4 className='font-semibold text-white mb-2'>적용 대상</h4>
            <p className='text-white/60 text-sm'>
              철강, 시멘트, 알루미늄, 비료, 전기, 수소 등
            </p>
          </div>
          <div className='p-4 bg-white/5 rounded-lg'>
            <h4 className='font-semibold text-white mb-2'>탄소 가격</h4>
            <p className='text-white/60 text-sm'>
              EU ETS 평균 가격 기준으로 계산
            </p>
          </div>
          <div className='p-4 bg-white/5 rounded-lg'>
            <h4 className='font-semibold text-white mb-2'>시행 일정</h4>
            <p className='text-white/60 text-sm'>2023년 10월부터 단계적 시행</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFlow = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>
          CBAM 프로세스 관리
        </h3>
        <p className='stitch-caption text-white/60'>
          CBAM 관련 프로세스 플로우를 생성하고 관리합니다.
        </p>
        <div className='mt-6'>
          <ReactFlowProvider>
            <ProcessManager />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );

<<<<<<< HEAD
  const renderCalculation = () => (
    <div className='space-y-6'>
      {/* 하위 탭 네비게이션 */}
      <div className='flex space-x-1 p-1 bg-white/5 rounded-lg'>
        <button
          onClick={() => setCalculationSubTab('calculator')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            calculationSubTab === 'calculator'
              ? 'bg-primary text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          CBAM 계산기
        </button>
        <button
          onClick={() => setCalculationSubTab('products')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            calculationSubTab === 'products'
              ? 'bg-primary text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          제품 관리
        </button>
      </div>

      {/* 하위 탭 콘텐츠 */}
      {calculationSubTab === 'calculator' && (
        <div className='stitch-card p-6'>
          <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 계산기</h3>
          <p className='stitch-caption text-white/60 mb-6'>
            상품의 탄소 배출량과 CBAM 부과금을 계산합니다.
          </p>
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* 입력 폼 */}
            <div className='space-y-4'>
              <h4 className='text-lg font-semibold text-white mb-4'>입력 정보</h4>
              
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    원자재 유형
                  </label>
                  <select
                    value={calculationData.materialType}
                    onChange={(e) => setCalculationData({
                      ...calculationData,
                      materialType: e.target.value
                    })}
                    className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary'
                  >
                    <option value=''>원자재 선택</option>
                    <option value='steel'>철강</option>
                    <option value='cement'>시멘트</option>
                    <option value='aluminum'>알루미늄</option>
                    <option value='fertilizer'>비료</option>
                    <option value='electricity'>전기</option>
                    <option value='hydrogen'>수소</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    수량 (톤)
                  </label>
                  <input
                    type='number'
                    value={calculationData.quantity}
                    onChange={(e) => setCalculationData({
                      ...calculationData,
                      quantity: e.target.value
                    })}
                    placeholder='0.00'
                    className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    탄소 집약도 (tCO2/t)
                  </label>
                  <input
                    type='number'
                    value={calculationData.carbonIntensity}
                    onChange={(e) => setCalculationData({
                      ...calculationData,
                      carbonIntensity: e.target.value
                    })}
                    placeholder='0.00'
                    className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    운송 거리 (km)
                  </label>
                  <input
                    type='number'
                    value={calculationData.transportDistance}
                    onChange={(e) => setCalculationData({
                      ...calculationData,
                      transportDistance: e.target.value
                    })}
                    placeholder='0'
                    className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    운송 수단
                  </label>
                  <select
                    value={calculationData.transportMode}
                    onChange={(e) => setCalculationData({
                      ...calculationData,
                      transportMode: e.target.value
                    })}
                    className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary'
                  >
                    <option value='sea'>해운</option>
                    <option value='rail'>철도</option>
                    <option value='road'>도로</option>
                    <option value='air'>항공</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    EU ETS 가격 (€/tCO2)
                  </label>
                  <input
                    type='number'
                    value={calculationData.euEtsPrice}
                    onChange={(e) => setCalculationData({
                      ...calculationData,
                      euEtsPrice: e.target.value
                    })}
                    placeholder='85.50'
                    className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                  />
                </div>

                <button
                  onClick={calculateCBAM}
                  className='w-full p-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/80 transition-colors'
                >
                  CBAM 계산하기
                </button>
              </div>
            </div>

            {/* 계산 결과 */}
            <div className='space-y-4'>
              <h4 className='text-lg font-semibold text-white mb-4'>계산 결과</h4>
              
              {calculationResult ? (
                <div className='space-y-4'>
                  <div className='p-4 bg-green-500/20 border border-green-500/30 rounded-lg'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-400'>
                        €{calculationResult.cbamCharge.toFixed(2)}
                      </div>
                      <div className='text-sm text-green-300'>총 CBAM 부과금</div>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <div className='flex justify-between items-center'>
                        <span className='text-white/80'>생산 과정 배출량:</span>
                        <span className='text-white font-medium'>
                          {calculationResult.breakdown.production.toFixed(2)} tCO2
                        </span>
                      </div>
                    </div>
                    
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <div className='flex justify-between items-center'>
                        <span className='text-white/80'>운송 과정 배출량:</span>
                        <span className='text-white font-medium'>
                          {calculationResult.breakdown.transport.toFixed(2)} tCO2
                        </span>
                      </div>
                    </div>
                    
                    <div className='p-3 bg-primary/20 border border-primary/30 rounded-lg'>
                      <div className='flex justify-between items-center'>
                        <span className='text-white font-medium'>총 탄소 배출량:</span>
                        <span className='text-white font-bold'>
                          {calculationResult.breakdown.total.toFixed(2)} tCO2
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg'>
                    <div className='text-sm text-blue-300'>
                      <strong>참고:</strong> 이 계산은 예시용이며, 실제 CBAM 신고 시에는 
                      공인된 방법론과 데이터를 사용해야 합니다.
                    </div>
                  </div>
                </div>
              ) : (
                <div className='p-8 bg-white/5 rounded-lg border-2 border-dashed border-white/20'>
                  <div className='text-center text-white/40'>
                    <div className='text-4xl mb-2'>🧮</div>
                    <div className='text-sm'>입력 정보를 입력하고</div>
                    <div className='text-sm'>계산하기 버튼을 클릭하세요</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {calculationSubTab === 'products' && (
        <div className='stitch-card p-6'>
          <h3 className='stitch-h1 text-lg font-semibold mb-4'>📦 제품 관리</h3>
          <p className='stitch-caption text-white/60 mb-6'>
            CBAM 신고를 위한 제품 정보를 생성하고 관리합니다.
          </p>

          <form onSubmit={handleProductSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* 제품명 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  제품명 *
                </label>
                <input
                  type='text'
                  placeholder='예: 철강 제품'
                  value={productForm.name}
                  onChange={(e) => handleProductInputChange('name', e.target.value)}
                  required
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              {/* CN 코드 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  CN 코드
                </label>
                <input
                  type='text'
                  placeholder='예: 7208'
                  value={productForm.cn_code}
                  onChange={(e) => handleProductInputChange('cn_code', e.target.value)}
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              {/* 시작일 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  시작일 *
                </label>
                <input
                  type='date'
                  value={productForm.period_start}
                  onChange={(e) => handleProductInputChange('period_start', e.target.value)}
                  required
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              {/* 종료일 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  종료일 *
                </label>
                <input
                  type='date'
                  value={productForm.period_end}
                  onChange={(e) => handleProductInputChange('period_end', e.target.value)}
                  required
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              {/* 생산량 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  생산량 (톤)
                </label>
                <input
                  type='number'
                  placeholder='0'
                  value={productForm.production_qty}
                  onChange={(e) => handleProductInputChange('production_qty', parseFloat(e.target.value) || 0)}
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              {/* 외부판매량 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  외부판매량 (톤)
                </label>
                <input
                  type='number'
                  placeholder='0'
                  value={productForm.sales_qty}
                  onChange={(e) => handleProductInputChange('sales_qty', parseFloat(e.target.value) || 0)}
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              {/* 수출량 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  수출량 (톤)
                </label>
                <input
                  type='number'
                  placeholder='0'
                  value={productForm.export_qty}
                  onChange={(e) => handleProductInputChange('export_qty', parseFloat(e.target.value) || 0)}
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              {/* 재고량 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  재고량 (톤)
                </label>
                <input
                  type='number'
                  placeholder='0'
                  value={productForm.inventory_qty}
                  onChange={(e) => handleProductInputChange('inventory_qty', parseFloat(e.target.value) || 0)}
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              {/* 불량률 */}
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  불량률 (%)
                </label>
                <input
                  type='number'
                  placeholder='0'
                  step='0.01'
                  value={productForm.defect_rate}
                  onChange={(e) => handleProductInputChange('defect_rate', parseFloat(e.target.value) || 0)}
                  className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={loading}
                className='px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? '생성 중...' : '제품 생성'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

=======
>>>>>>> origin/main
  const renderReports = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 보고서</h3>
        <p className='stitch-caption text-white/60'>
          탄소국경조정메커니즘 관련 보고서를 생성하고 관리합니다.
        </p>
        <div className='mt-4 p-4 bg-white/5 rounded-lg'>
          <p className='text-white/40 text-sm'>
            보고서 기능은 개발 중입니다...
          </p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 설정</h3>
        <p className='stitch-caption text-white/60'>
          CBAM 관련 설정을 구성합니다.
        </p>
        <div className='mt-4 p-4 bg-white/5 rounded-lg'>
          <p className='text-white/40 text-sm'>설정 기능은 개발 중입니다...</p>
        </div>
      </div>
    </div>
  );

  return (
    <CommonShell>
      <div className='space-y-6'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-3'>
          <h1 className='stitch-h1 text-3xl font-bold'>CBAM 관리</h1>
          <p className='stitch-caption'>
            탄소국경조정메커니즘(CBAM) 프로세스 및 계산 관리
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className='flex space-x-1 p-1 bg-white/5 rounded-lg'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'flow'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            프로세스 관리
          </button>
          <button
<<<<<<< HEAD
            onClick={() => setActiveTab('calculation')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calculation'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            계산
          </button>
          <button
=======
>>>>>>> origin/main
            onClick={() => setActiveTab('reports')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            보고서
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            설정
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'flow' && renderFlow()}
<<<<<<< HEAD
        {activeTab === 'calculation' && renderCalculation()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Toast 알림 */}
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-600' :
          toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`}>
          <div className='flex items-center justify-between'>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className='ml-2 text-white hover:text-gray-200'
            >
              ✕
            </button>
          </div>
        </div>
      )}
=======
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </div>
>>>>>>> origin/main
    </CommonShell>
  );
}
