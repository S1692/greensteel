'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface CompanyInfo {
  id: number;
  company_name: string;
  address?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  coordinates?: string;
  email?: string;
  phone?: string;
  representative_name?: string;
}

interface EmissionData {
  id: number;
  type: 'material' | 'fuel';
  name: string;
  engname: string;
  amount: number;
  factor: number;
  emission: number;
  process_name: string;
  product_name: string;
  created_at: string;
}

interface ProcessData {
  process_name: string;
  product_name: string;
  materials: EmissionData[];
  fuels: EmissionData[];
  total_emission: number;
}

interface ProductData {
  product_name: string;
  cn_code?: string;
  processes: ProcessData[];
  total_emission: number;
}

const GasEmissionReport: React.FC = () => {
  // 언어 설정
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  
  // 기간 설정
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // 데이터
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [emissionData, setEmissionData] = useState<EmissionData[]>([]);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 현재 날짜 설정
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // 회사 정보 로드
  const loadCompanyInfo = useCallback(async () => {
    try {
      const response = await axiosClient.get(apiEndpoints.companies.list);
      if (response.data && response.data.length > 0) {
        setCompanyInfo(response.data[0]); // 첫 번째 회사 정보 사용
        console.log('✅ 회사 정보 로드 완료:', response.data[0]);
      }
    } catch (error) {
      console.error('❌ 회사 정보 로드 실패:', error);
    }
  }, []);

  // 배출량 데이터 로드
  const loadEmissionData = useCallback(() => {
    try {
      const storedData = localStorage.getItem('cbam_emission_calculations');
      if (storedData) {
        const calculations = JSON.parse(storedData);
        
        // 기간 필터링
        const filteredData = calculations.filter((item: any) => {
          if (!startDate || !endDate) return true;
          const itemDate = new Date(item.created_at);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return itemDate >= start && itemDate <= end;
        });
        
        setEmissionData(filteredData);
        console.log('✅ 배출량 데이터 로드 완료:', filteredData.length, '개');
        
        // 제품별 데이터 구성
        const productMap = new Map<string, ProductData>();
        
        filteredData.forEach((item: any) => {
          const productName = item.product_name || 'Unknown Product';
          
          if (!productMap.has(productName)) {
            productMap.set(productName, {
              product_name: productName,
              cn_code: item.cn_code,
              processes: [],
              total_emission: 0
            });
          }
          
          const product = productMap.get(productName)!;
          const processName = item.process_name || 'Unknown Process';
          
          let process = product.processes.find(p => p.process_name === processName);
          if (!process) {
            process = {
              process_name: processName,
              product_name: productName,
              materials: [],
              fuels: [],
              total_emission: 0
            };
            product.processes.push(process);
          }
          
          const emissionItem: EmissionData = {
            id: item.id,
            type: item.type,
            name: item.mat_name || item.fuel_name || item.name,
            engname: item.mat_engname || item.fuel_engname || '',
            amount: item.amount || 0,
            factor: item.emission_factor || item.factor || 0,
            emission: item.emission || 0,
            process_name: processName,
            product_name: productName,
            created_at: item.created_at
          };
          
          if (item.type === 'material') {
            process.materials.push(emissionItem);
          } else {
            process.fuels.push(emissionItem);
          }
          
          process.total_emission += emissionItem.emission;
          product.total_emission += emissionItem.emission;
        });
        
        setProductData(Array.from(productMap.values()));
        console.log('✅ 제품별 데이터 구성 완료:', Array.from(productMap.values()));
      }
    } catch (error) {
      console.error('❌ 배출량 데이터 로드 실패:', error);
    }
  }, [startDate, endDate]);

  // 데이터 로드
  useEffect(() => {
    loadCompanyInfo();
  }, [loadCompanyInfo]);

  useEffect(() => {
    if (startDate && endDate) {
      loadEmissionData();
    }
  }, [loadEmissionData]);

  // 언어별 텍스트
  const texts = {
    ko: {
      title: '가스 배출 보고서',
      issuer: '발행자',
      issueDate: '발행일자',
      reportingPeriod: '보고 기간',
      start: '시작',
      end: '종료',
      aboutInstallation: '1. 시설 정보',
      installationName: '시설명',
      address: '주소',
      postCode: '우편번호',
      city: '도시',
      country: '국가',
      unlocode: 'UNLOCODE',
      coordinates: '주요 배출원 좌표 (위도, 경도)',
      productInfo: '2. 제품 정보',
      product: '제품',
      cnCode: 'CN 코드/제품명',
      productionProcess: '생산 공정',
      route: '경로',
      ingredient1: '원료 1',
      ingredient2: '원료 2',
      fuel1: '연료 1',
      fuel2: '연료 2',
      emission: '배출량',
      acquiredGoods: '취득 상품?',
      contact: '3. 연락처',
      email: '이메일',
      phone: '연락처',
      officialStamp: '공식 회사 인장',
      totalEmission: '총 배출량',
      noData: '선택된 기간에 데이터가 없습니다.'
    },
    en: {
      title: 'Gas Emission Report',
      issuer: 'Issuer',
      issueDate: 'Issue Date',
      reportingPeriod: 'Reporting Period',
      start: 'Start',
      end: 'End',
      aboutInstallation: '1. About the installation',
      installationName: 'Name of the installation',
      address: 'Address',
      postCode: 'Post code',
      city: 'City',
      country: 'Country',
      unlocode: 'UNLOCODE',
      coordinates: 'Coordinates of the main emission source (latitude, longitude)',
      productInfo: '2. Product information',
      product: 'Product',
      cnCode: 'CN Code/Product name',
      productionProcess: 'Production Process',
      route: 'Route',
      ingredient1: 'ingredient 1',
      ingredient2: 'ingredient 2',
      fuel1: 'fuel 1',
      fuel2: 'fuel 2',
      emission: 'Emission',
      acquiredGoods: 'Acquired goods?',
      contact: '3. Contact',
      email: 'EMAIL',
      phone: 'CONTACT',
      officialStamp: 'Official Company Stamp',
      totalEmission: 'Total Emission',
      noData: 'No data available for the selected period.'
    }
  };

  const t = texts[language];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* 언어 전환 버튼 */}
      <div className="flex justify-end mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLanguage('ko')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              language === 'ko' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            한국어
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              language === 'en' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* 보고서 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.title}</h1>
        
        {/* 발행자 및 발행일자 */}
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t.issuer}:</span>
              <div className="bg-gray-100 px-3 py-1 rounded text-sm min-w-[100px]">
                {companyInfo?.representative_name || 'N/A'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t.issueDate}:</span>
              <div className="bg-gray-100 px-3 py-1 rounded text-sm min-w-[100px]">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 보고 기간 설정 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.reportingPeriod}</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t.start}:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t.end}:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* 1. 시설 정보 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.aboutInstallation}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[120px]">{t.installationName}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.company_name || 'N/A'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[120px]">{t.address}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.address || 'N/A'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[120px]">{t.postCode}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.postal_code || 'N/A'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[120px]">{t.city}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.city || 'N/A'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[120px]">{t.country}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.country || 'N/A'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[120px]">{t.unlocode}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.unlocode || 'N/A'}
            </div>
          </div>
          <div className="flex items-center gap-2 col-span-full">
            <span className="text-sm font-medium min-w-[200px]">{t.coordinates}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.coordinates || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 제품 정보 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.productInfo}</h2>
        
        {productData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t.noData}
          </div>
        ) : (
          productData.map((product, productIndex) => (
            <div key={productIndex} className="mb-6 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">{t.product}:</span>
                <div className="bg-gray-100 px-3 py-2 rounded flex-1">
                  {product.cn_code ? `${product.cn_code} / ` : ''}{product.product_name}
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium">{t.productionProcess}:</span>
              </div>
              
              {product.processes.map((process, processIndex) => (
                <div key={processIndex} className="mb-4 border border-gray-100 rounded p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">{t.route}:</span>
                    <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {processIndex + 1}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 원료 1 */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t.ingredient1}</div>
                      <div className="flex gap-2">
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs flex-1">
                          {process.materials[0]?.name || 'N/A'}
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs w-20 text-center">
                          {process.materials[0]?.emission?.toFixed(2) || '0.00'}
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs w-16 text-center">
                          {process.materials[0] ? 'Y' : 'N'}
                        </div>
                      </div>
                    </div>
                    
                    {/* 원료 2 */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t.ingredient2}</div>
                      <div className="flex gap-2">
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs flex-1">
                          {process.materials[1]?.name || 'N/A'}
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs w-20 text-center">
                          {process.materials[1]?.emission?.toFixed(2) || '0.00'}
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs w-16 text-center">
                          {process.materials[1] ? 'Y' : 'N'}
                        </div>
                      </div>
                    </div>
                    
                    {/* 연료 1 */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t.fuel1}</div>
                      <div className="flex gap-2">
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs flex-1">
                          {process.fuels[0]?.name || 'N/A'}
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs w-20 text-center">
                          {process.fuels[0]?.emission?.toFixed(2) || '0.00'}
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs w-16 text-center">
                          {process.fuels[0] ? 'Y' : 'N'}
                        </div>
                      </div>
                    </div>
                    
                    {/* 연료 2 */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{t.fuel2}</div>
                      <div className="flex gap-2">
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs flex-1">
                          {process.fuels[1]?.name || 'N/A'}
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs w-20 text-center">
                          {process.fuels[1]?.emission?.toFixed(2) || '0.00'}
                        </div>
                        <div className="bg-gray-100 px-2 py-1 rounded text-xs w-16 text-center">
                          {process.fuels[1] ? 'Y' : 'N'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-right">
                    <span className="text-sm font-medium">{t.totalEmission}: </span>
                    <span className="text-sm font-bold">
                      {process.total_emission.toFixed(2)} tCO2e
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-right border-t pt-2">
                <span className="text-sm font-medium">{t.totalEmission}: </span>
                <span className="text-lg font-bold text-blue-600">
                  {product.total_emission.toFixed(2)} tCO2e
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. 연락처 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.contact}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[80px]">{t.email}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.email || 'N/A'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[80px]">{t.phone}:</span>
            <div className="bg-gray-100 px-3 py-2 rounded flex-1">
              {companyInfo?.phone || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* 공식 회사 인장 */}
      <div className="flex justify-end">
        <div className="text-center">
          <div className="border-2 border-dashed border-gray-300 w-32 h-20 flex items-center justify-center mb-2">
            <span className="text-xs text-gray-500">{t.officialStamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasEmissionReport;