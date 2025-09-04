'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, Globe, Languages } from 'lucide-react';

// ============================================================================
// 🎯 Gas Emission Report 페이지 - 독립적인 완전한 구현
// ============================================================================

// 하드코딩된 데이터 (이미지에서 확인된 데이터)
const HARDCODED_DATA = {
  // 설치 정보
  installation: {
    korean: "삼정",
    english: "Samjong"
  },
  economicActivity: {
    korean: "철강",
    english: "steel industry"
  },
  representative: {
    korean: "김중동",
    english: "kimjongdong"
  },
  
  // 연락처 정보
  contact: {
    email: "KPMG@adf.com",
    telephone: "010-1234-1234",
    street: {
      korean: "테헤란로",
      english: "Teheran-ro"
    },
    number: {
      korean: "152",
      english: "152"
    },
    postcode: "06236",
    city: "서울 강남구"
  },
  
  // 위치 정보
  location: {
    city: {
      korean: "서울",
      english: "Seoul"
    },
    country: {
      korean: "대한민국",
      english: "Korea"
    },
    unlocode: "KR",
    coordinates: {
      latitude: 37.50002424,
      longitude: 127.03650862
    }
  }
};

// 제품 정보 타입 정의 (DB에서 가져올 데이터)
interface Product {
  id: string;
  cnCode: string;
  productName: string;
  routes: Route[];
}

interface Route {
  id: string;
  name: string;
  ingredients: Ingredient[];
  fuels: Fuel[];
}

interface Ingredient {
  id: string;
  name: string;
  emission: number;
  isAggregatedGoods: boolean;
}

interface Fuel {
  id: string;
  name: string;
  emission: number;
}

// Gas Emission Report 페이지 컴포넌트
export default function GasEmissionReportPage() {
  const [language, setLanguage] = useState<'korean' | 'english'>('korean');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    // 헤더 정보
    companyName: '',
    issueDate: '',
    
    // 생산 기간
    startPeriod: '',
    endPeriod: '',
    
    // 시설 정보
    installationName: '',
    address: {
      workplaceName: '',
      country: '',
      city: '',
      postcode: '',
      workplace: '',
      currencyCode: '',
      coordinates: ''
    },
    
    // 제품 정보
    productGroup: '',
    
    // 배출계수
    emissionFactor: '',
    
    // 연락처
    email: '',
    contact: ''
  });

  // 제품 데이터 로딩 (실제로는 API에서 가져올 데이터)
  useEffect(() => {
    // 시뮬레이션된 API 호출
    const loadProducts = async () => {
      setLoading(true);
      
      // 실제 환경에서는 API에서 데이터를 가져옴
      // const response = await fetch('/api/products');
      // const data = await response.json();
      
      // 임시 하드코딩된 제품 데이터 (DB에서 가져올 구조)
      const mockProducts: Product[] = [
        {
          id: '1',
          cnCode: '7208',
          productName: '고강도 강판',
          routes: [
            {
              id: 'route1',
              name: 'Route 1',
              ingredients: [
                { id: 'ing1', name: '원료1', emission: 0, isAggregatedGoods: false },
                { id: 'ing2', name: '원료2', emission: 0, isAggregatedGoods: false }
              ],
              fuels: [
                { id: 'fuel1', name: '연료1', emission: 0 },
                { id: 'fuel2', name: '연료2', emission: 0 }
              ]
            },
            {
              id: 'route2',
              name: 'Route 2',
              ingredients: [
                { id: 'ing1', name: '원료1', emission: 0, isAggregatedGoods: false },
                { id: 'ing2', name: '원료2', emission: 0, isAggregatedGoods: false }
              ],
              fuels: [
                { id: 'fuel1', name: '연료1', emission: 0 },
                { id: 'fuel2', name: '연료2', emission: 0 }
              ]
            }
          ]
        }
      ];
      
      setTimeout(() => {
        setProducts(mockProducts);
        setLoading(false);
      }, 1000);
    };

    loadProducts();
  }, []);

  // 언어 전환 핸들러
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'korean' ? 'english' : 'korean');
  };

  // 보고서 다운로드 함수
  const handleDownloadReport = (type: 'pdf' | 'excel') => {
    console.log(`${type} 보고서 다운로드 시작`);
    // 실제 구현에서는 서버에서 보고서를 생성하고 다운로드
    alert(`${type.toUpperCase()} 보고서 다운로드가 시작됩니다.`);
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // 다국어 텍스트
  const texts = {
    korean: {
      title: 'CBAM 템플릿',
      companyName: '발행처: 회사명',
      issueDate: '발행일자: 발행 일자',
      productionPeriod: '생산 기간',
      startPeriod: '시작 기간',
      endPeriod: '종료 기간',
      facilityInfo: '시설군 정보',
      workplaceName: '사업장 명',
      address: '주소',
      country: '국가/코드',
      city: '도시',
      postcode: '우편번호',
      workplace: '사업장',
      currencyCode: 'UN 통화 코드',
      coordinates: '좌표(위 경도)',
      productInfo: '제품 생산 info',
      productGroup: '품목군',
      cnCode: 'CN코드/제품명',
      productionProcess: '생산 공정',
      process: '공정',
      productionVolume: '생산량',
      ingredient: '원료',
      fuel: '연료',
      emission: '배출량',
      precursorMaterial: '전구 물질 여부',
      precursorInfo: '전구체 info',
      precursorMaterialName: '전구물질 명',
      movementRoute: '이동 루트 (국가 or 생산 공정)',
      consumptionProcess: '소모 공정',
      emissionFactor: '배출계수',
      cbamDefaultValue: 'CBAM 기본값*',
      contact: 'Contact',
      email: 'Email',
      representativeNumber: '대표 번호',
      disclaimer: '* 기업 자세 계산값이 존재할 경우 에너지, 원료별 계수값을 사랑하고 해당 증빙자료 산출',
      companySeal: '회사 직인 (인)',
      downloadPdf: 'PDF 다운로드',
      downloadExcel: 'Excel 다운로드'
    },
    english: {
      title: 'CBAM Template',
      companyName: 'Issuer: Company Name',
      issueDate: 'Issue Date: Issue Date',
      productionPeriod: 'Reporting period',
      startPeriod: 'start',
      endPeriod: 'End',
      facilityInfo: 'About the installation',
      workplaceName: 'Name of the installation',
      address: 'Address',
      country: 'Country',
      city: 'City',
      postcode: 'Post code',
      workplace: 'Workplace',
      currencyCode: 'UNLOCODE:',
      coordinates: 'Coordinates of the main emssion source (latitude, longitude)',
      productInfo: 'Product information',
      productGroup: 'Product',
      cnCode: 'CN Code/ Product name',
      productionProcess: 'Production Process',
      process: 'Route',
      productionVolume: 'Production Volume',
      ingredient: 'ingredient',
      fuel: 'fuel',
      emission: 'Emission',
      precursorMaterial: 'Aggregated goods?',
      precursorInfo: 'Precursor Info',
      precursorMaterialName: 'Precursor Material Name',
      movementRoute: 'Movement Route (Country or Production Process)',
      consumptionProcess: 'Consumption Process',
      emissionFactor: 'Emission Factor',
      cbamDefaultValue: 'CBAM Default Value*',
      contact: 'Contact',
      email: 'EMAIL',
      representativeNumber: 'CONTACT',
      disclaimer: '* If detailed calculation values exist for the company, use energy and raw material coefficients and calculate the corresponding supporting data',
      companySeal: 'Official Company Stamp',
      downloadPdf: 'Download PDF',
      downloadExcel: 'Download Excel'
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={toggleLanguage}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Languages className="h-4 w-4" />
                <span>{language === 'korean' ? 'English' : '한국어'}</span>
              </button>
              <button
                onClick={() => handleDownloadReport('pdf')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{t.downloadPdf}</span>
              </button>
              <button
                onClick={() => handleDownloadReport('excel')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{t.downloadExcel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          
          {/* 보고서 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <div className="flex justify-end space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>{t.companyName}</span>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleFormChange('companyName', e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span>{t.issueDate}</span>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleFormChange('issueDate', e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* 1. 생산 기간 & 시설군 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t.productionPeriod} & {t.facilityInfo}
            </h2>
            
            {/* 생산 기간 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">{t.productionPeriod}</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={formData.startPeriod}
                  onChange={(e) => handleFormChange('startPeriod', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <span>~</span>
                <input
                  type="date"
                  value={formData.endPeriod}
                  onChange={(e) => handleFormChange('endPeriod', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* 시설군 정보 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">1. {t.facilityInfo}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.workplaceName}
                  </label>
                  <input
                    type="text"
                    value={formData.installationName}
                    onChange={(e) => handleFormChange('installationName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.address}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={t.workplaceName}
                      value={formData.address.workplaceName}
                      onChange={(e) => handleFormChange('address.workplaceName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={t.country}
                        value={formData.address.country}
                        onChange={(e) => handleFormChange('address.country', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        placeholder={t.city}
                        value={formData.address.city}
                        onChange={(e) => handleFormChange('address.city', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder={t.postcode}
                        value={formData.address.postcode}
                        onChange={(e) => handleFormChange('address.postcode', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        placeholder={t.workplace}
                        value={formData.address.workplace}
                        onChange={(e) => handleFormChange('address.workplace', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        placeholder={t.currencyCode}
                        value={formData.address.currencyCode}
                        onChange={(e) => handleFormChange('address.currencyCode', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={t.coordinates}
                      value={formData.address.coordinates}
                      onChange={(e) => handleFormChange('address.coordinates', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 제품 생산 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. {t.productInfo}
            </h2>
            
            {/* 품목군 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.productGroup}
              </label>
              <input
                type="text"
                placeholder={t.cnCode}
                value={formData.productGroup}
                onChange={(e) => handleFormChange('productGroup', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            {/* 생산 공정 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">{t.productionProcess}</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">제품 정보를 불러오는 중...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-300 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3">
                        {product.cnCode} - {product.productName}
                      </h4>
                      
                      {product.routes.map((route, routeIndex) => (
                        <div key={route.id} className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">
                            {route.name} / {t.productionVolume}
                          </h5>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                                    {t.ingredient}/{t.fuel}
                                  </th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                                    {t.emission}
                                  </th>
                                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                                    {t.precursorMaterial}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {route.ingredients.map((ingredient) => (
                                  <tr key={ingredient.id}>
                                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                                      {ingredient.name}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                      <input
                                        type="number"
                                        value={ingredient.emission}
                                        onChange={(e) => {
                                          // 실제 구현에서는 제품 데이터 업데이트 로직 필요
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                      <input
                                        type="checkbox"
                                        checked={ingredient.isAggregatedGoods}
                                        onChange={(e) => {
                                          // 실제 구현에서는 제품 데이터 업데이트 로직 필요
                                        }}
                                        className="w-4 h-4"
                                      />
                                    </td>
                                  </tr>
                                ))}
                                {route.fuels.map((fuel) => (
                                  <tr key={fuel.id}>
                                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                                      {fuel.name}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                      <input
                                        type="number"
                                        value={fuel.emission}
                                        onChange={(e) => {
                                          // 실제 구현에서는 제품 데이터 업데이트 로직 필요
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                      <span className="text-gray-400">-</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. 전구체 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. {t.precursorInfo}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  {t.precursorMaterialName} 1
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t.movementRoute}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder={t.consumptionProcess}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder={t.consumptionProcess}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  {t.precursorMaterialName} 2
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t.movementRoute}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder={t.consumptionProcess}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder={t.consumptionProcess}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. 배출계수 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              4. {t.emissionFactor}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.cbamDefaultValue}
              </label>
              <input
                type="number"
                value={formData.emissionFactor}
                onChange={(e) => handleFormChange('emissionFactor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* 5. 연락처 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              5. {t.contact}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.representativeNumber}
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => handleFormChange('contact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex justify-between items-end">
            <div className="text-xs text-gray-500 max-w-md">
              {t.disclaimer}
            </div>
            <div className="text-center">
              <div className="border border-gray-300 w-32 h-20 mb-2"></div>
              <p className="text-sm text-gray-600">{t.companySeal}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
