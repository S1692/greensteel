'use client';

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import ProcessManager from '@/components/cbam/ProcessManager';
import CommonShell from '@/components/common/CommonShell';

// ============================================================================
// 🚀 CBAM 페이지 - 탄소국경조정메커니즘 관리
// ============================================================================

export default function CBAMPage() {
  const [activeTab, setActiveTab] = useState<
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
      const response = await fetch('/cbam/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm)
      });
      
      if (response.ok) {
        const result = await response.json();
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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '제품 생성에 실패했습니다.');
      }

    } catch (error) {
      console.error('제품 생성 실패:', error);
      setToast({
        message: `제품 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

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
                    원료/상품 유형
                  </label>
                  <input
                    type='text'
                    value={calculationData.materialType}
                    onChange={(e) => setCalculationData(prev => ({ ...prev, materialType: e.target.value }))}
                    placeholder='예: 철강, 시멘트, 알루미늄'
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    수량 (톤)
                  </label>
                  <input
                    type='number'
                    value={calculationData.quantity}
                    onChange={(e) => setCalculationData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder='0'
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    탄소 집약도 (tCO2/t)
                  </label>
                  <input
                    type='number'
                    value={calculationData.carbonIntensity}
                    onChange={(e) => setCalculationData(prev => ({ ...prev, carbonIntensity: e.target.value }))}
                    placeholder='0'
                    step='0.01'
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    운송 거리 (km)
                  </label>
                  <input
                    type='number'
                    value={calculationData.transportDistance}
                    onChange={(e) => setCalculationData(prev => ({ ...prev, transportDistance: e.target.value }))}
                    placeholder='0'
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    운송 수단
                  </label>
                  <select
                    value={calculationData.transportMode}
                    onChange={(e) => setCalculationData(prev => ({ ...prev, transportMode: e.target.value as any }))}
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
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
                    onChange={(e) => setCalculationData(prev => ({ ...prev, euEtsPrice: e.target.value }))}
                    placeholder='85.50'
                    step='0.01'
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                  />
                </div>
              </div>

              <button
                onClick={calculateCBAM}
                className='w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors'
              >
                CBAM 계산하기
              </button>
            </div>

            {/* 결과 표시 */}
            <div className='space-y-4'>
              <h4 className='text-lg font-semibold text-white mb-4'>계산 결과</h4>
              
              {calculationResult ? (
                <div className='space-y-4'>
                  <div className='p-4 bg-white/5 rounded-lg'>
                    <h5 className='font-semibold text-white mb-2'>총 탄소 배출량</h5>
                    <p className='text-2xl font-bold text-primary'>
                      {calculationResult.totalEmissions.toFixed(2)} tCO2
                    </p>
                  </div>
                  
                  <div className='p-4 bg-white/5 rounded-lg'>
                    <h5 className='font-semibold text-white mb-2'>CBAM 부과금</h5>
                    <p className='text-2xl font-bold text-primary'>
                      €{calculationResult.cbamCharge.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className='p-4 bg-white/5 rounded-lg'>
                    <h5 className='font-semibold text-white mb-2'>세부 내역</h5>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-white/60'>생산 과정:</span>
                        <span className='text-white'>{calculationResult.breakdown.production.toFixed(2)} tCO2</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-white/60'>운송 과정:</span>
                        <span className='text-white'>{calculationResult.breakdown.transport.toFixed(2)} tCO2</span>
                      </div>
                      <div className='flex justify-between border-t border-white/20 pt-2'>
                        <span className='text-white/80 font-medium'>총계:</span>
                        <span className='text-white font-medium'>{calculationResult.breakdown.total.toFixed(2)} tCO2</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='p-8 text-center text-white/40'>
                  <p>입력 정보를 입력하고 계산하기를 클릭하세요</p>
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
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  제품명
                </label>
                <input
                  type='text'
                  value={productForm.name}
                  onChange={(e) => handleProductInputChange('name', e.target.value)}
                  placeholder='제품명을 입력하세요'
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  CN 코드
                </label>
                <input
                  type='text'
                  value={productForm.cn_code}
                  onChange={(e) => handleProductInputChange('cn_code', e.target.value)}
                  placeholder='CN 코드를 입력하세요'
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  기간 시작일
                </label>
                <input
                  type='date'
                  value={productForm.period_start}
                  onChange={(e) => handleProductInputChange('period_start', e.target.value)}
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  기간 종료일
                </label>
                <input
                  type='date'
                  value={productForm.period_end}
                  onChange={(e) => handleProductInputChange('period_end', e.target.value)}
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  생산량 (톤)
                </label>
                <input
                  type='number'
                  value={productForm.production_qty}
                  onChange={(e) => handleProductInputChange('production_qty', parseFloat(e.target.value) || 0)}
                  placeholder='0'
                  step='0.01'
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  판매량 (톤)
                </label>
                <input
                  type='number'
                  value={productForm.sales_qty}
                  onChange={(e) => handleProductInputChange('sales_qty', parseFloat(e.target.value) || 0)}
                  placeholder='0'
                  step='0.01'
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  수출량 (톤)
                </label>
                <input
                  type='number'
                  value={productForm.export_qty}
                  onChange={(e) => handleProductInputChange('export_qty', parseFloat(e.target.value) || 0)}
                  placeholder='0'
                  step='0.01'
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  재고량 (톤)
                </label>
                <input
                  type='number'
                  value={productForm.inventory_qty}
                  onChange={(e) => handleProductInputChange('inventory_qty', parseFloat(e.target.value) || 0)}
                  placeholder='0'
                  step='0.01'
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  불량률 (%)
                </label>
                <input
                  type='number'
                  value={productForm.defect_rate}
                  onChange={(e) => handleProductInputChange('defect_rate', parseFloat(e.target.value) || 0)}
                  placeholder='0'
                  step='0.01'
                  min='0'
                  max='100'
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={loading}
                className='px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? '생성 중...' : '제품 생성'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 보고서</h3>
        <p className='stitch-caption text-white/60'>
          CBAM 관련 보고서를 생성하고 관리합니다.
        </p>
        <div className='mt-4 p-4 bg-white/5 rounded-lg'>
          <p className='text-white/60'>보고서 기능은 준비 중입니다.</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className='space-y-6'>
      <div className='stitch-card p-6'>
        <h3 className='stitch-h1 text-lg font-semibold mb-4'>CBAM 설정</h3>
        <p className='stitch-caption text-white/60'>
          CBAM 관련 설정을 관리합니다.
        </p>
        <div className='mt-4 p-4 bg-white/5 rounded-lg'>
          <p className='text-white/60'>설정 기능은 준비 중입니다.</p>
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
          <p className='stitch-caption text-white/60'>
            탄소국경조정메커니즘(CBAM)을 통합적으로 관리합니다.
          </p>
        </div>

        {/* 메인 탭 네비게이션 */}
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
            프로세스
          </button>
          <button
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
        {activeTab === 'calculation' && renderCalculation()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* 토스트 알림 */}
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : toast.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-blue-500 text-white'
        }`}>
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className='ml-2 hover:opacity-80'
          >
            ✕
          </button>
        </div>
      )}
    </CommonShell>
  );
}
