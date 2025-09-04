'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, Building2, User, MapPin, Phone, Mail, Globe } from 'lucide-react';

// ============================================================================
// 🎯 CBAM 보고서 페이지 - 독립적인 완전한 구현
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

// 제품 정보 타입 정의
interface Product {
  id: string;
  name: string;
  category: string;
  carbonFootprint: number;
  unit: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'pending';
}

// CBAM 보고서 페이지 컴포넌트
export default function CBAMReportPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 제품 데이터 로딩 (실제로는 API에서 가져올 데이터)
  useEffect(() => {
    // 시뮬레이션된 API 호출
    const loadProducts = async () => {
      setLoading(true);
      
      // 실제 환경에서는 API에서 데이터를 가져옴
      // const response = await fetch('/api/products');
      // const data = await response.json();
      
      // 임시 하드코딩된 제품 데이터
      const mockProducts: Product[] = [
        {
          id: '1',
          name: '고강도 강판',
          category: '철강제품',
          carbonFootprint: 2.45,
          unit: 'tCO2e/t',
          lastUpdated: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          name: '열연강판',
          category: '철강제품',
          carbonFootprint: 1.89,
          unit: 'tCO2e/t',
          lastUpdated: '2024-01-14',
          status: 'active'
        },
        {
          id: '3',
          name: '냉연강판',
          category: '철강제품',
          carbonFootprint: 2.12,
          unit: 'tCO2e/t',
          lastUpdated: '2024-01-13',
          status: 'active'
        },
        {
          id: '4',
          name: '강관',
          category: '철강제품',
          carbonFootprint: 2.78,
          unit: 'tCO2e/t',
          lastUpdated: '2024-01-12',
          status: 'pending'
        }
      ];
      
      setTimeout(() => {
        setProducts(mockProducts);
        setLoading(false);
      }, 1000);
    };

    loadProducts();
  }, []);

  // 보고서 다운로드 함수
  const handleDownloadReport = (type: 'pdf' | 'excel') => {
    console.log(`${type} 보고서 다운로드 시작`);
    // 실제 구현에서는 서버에서 보고서를 생성하고 다운로드
    alert(`${type.toUpperCase()} 보고서 다운로드가 시작됩니다.`);
  };

  // 제품 선택 핸들러
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-ecotrace-background">
      {/* 헤더 */}
      <div className="bg-ecotrace-surface border-b border-ecotrace-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-ecotrace-primary mr-3" />
              <h1 className="text-2xl font-bold text-ecotrace-text">CBAM 보고서</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDownloadReport('pdf')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>PDF 다운로드</span>
              </button>
              <button
                onClick={() => handleDownloadReport('excel')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Excel 다운로드</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 왼쪽: 설치 정보 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 설치 기본 정보 */}
            <div className="bg-ecotrace-surface rounded-lg p-6 border border-ecotrace-border">
              <div className="flex items-center mb-4">
                <Building2 className="h-5 w-5 text-ecotrace-primary mr-2" />
                <h2 className="text-lg font-semibold text-ecotrace-text">설치 정보</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    설치명 (한국어)
                  </label>
                  <p className="text-ecotrace-text font-medium">{HARDCODED_DATA.installation.korean}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    설치명 (영어)
                  </label>
                  <p className="text-ecotrace-text font-medium">{HARDCODED_DATA.installation.english}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    경제활동 (한국어)
                  </label>
                  <p className="text-ecotrace-text font-medium">{HARDCODED_DATA.economicActivity.korean}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    경제활동 (영어)
                  </label>
                  <p className="text-ecotrace-text font-medium">{HARDCODED_DATA.economicActivity.english}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    대표자 (한국어)
                  </label>
                  <p className="text-ecotrace-text font-medium">{HARDCODED_DATA.representative.korean}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    대표자 (영어)
                  </label>
                  <p className="text-ecotrace-text font-medium">{HARDCODED_DATA.representative.english}</p>
                </div>
              </div>
            </div>

            {/* 연락처 정보 */}
            <div className="bg-ecotrace-surface rounded-lg p-6 border border-ecotrace-border">
              <div className="flex items-center mb-4">
                <Phone className="h-5 w-5 text-ecotrace-primary mr-2" />
                <h2 className="text-lg font-semibold text-ecotrace-text">연락처 정보</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    이메일
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-ecotrace-textSecondary mr-2" />
                    <p className="text-ecotrace-text">{HARDCODED_DATA.contact.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    전화번호
                  </label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-ecotrace-textSecondary mr-2" />
                    <p className="text-ecotrace-text">{HARDCODED_DATA.contact.telephone}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    주소
                  </label>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-ecotrace-textSecondary mr-2" />
                      <p className="text-ecotrace-text">
                        {HARDCODED_DATA.contact.street.korean} {HARDCODED_DATA.contact.number.korean}
                      </p>
                    </div>
                    <p className="text-ecotrace-text ml-6">
                      {HARDCODED_DATA.contact.street.english} {HARDCODED_DATA.contact.number.english}
                    </p>
                    <p className="text-ecotrace-text ml-6">
                      {HARDCODED_DATA.contact.postcode} {HARDCODED_DATA.contact.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 위치 정보 */}
            <div className="bg-ecotrace-surface rounded-lg p-6 border border-ecotrace-border">
              <div className="flex items-center mb-4">
                <Globe className="h-5 w-5 text-ecotrace-primary mr-2" />
                <h2 className="text-lg font-semibold text-ecotrace-text">위치 정보</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    도시
                  </label>
                  <p className="text-ecotrace-text">
                    {HARDCODED_DATA.location.city.korean} ({HARDCODED_DATA.location.city.english})
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    국가
                  </label>
                  <p className="text-ecotrace-text">
                    {HARDCODED_DATA.location.country.korean} ({HARDCODED_DATA.location.country.english})
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    UN/LOCODE
                  </label>
                  <p className="text-ecotrace-text font-mono">{HARDCODED_DATA.location.unlocode}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                    좌표
                  </label>
                  <div className="space-y-1">
                    <p className="text-ecotrace-text font-mono text-sm">
                      위도: {HARDCODED_DATA.location.coordinates.latitude}
                    </p>
                    <p className="text-ecotrace-text font-mono text-sm">
                      경도: {HARDCODED_DATA.location.coordinates.longitude}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 제품 정보 */}
          <div className="lg:col-span-2">
            <div className="bg-ecotrace-surface rounded-lg p-6 border border-ecotrace-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-ecotrace-text">제품 정보</h2>
                <div className="text-sm text-ecotrace-textSecondary">
                  총 {products.length}개 제품
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ecotrace-primary"></div>
                  <span className="ml-3 text-ecotrace-textSecondary">제품 정보를 불러오는 중...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-ecotrace-primary bg-ecotrace-primary/10'
                          : 'border-ecotrace-border hover:border-ecotrace-primary/50'
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-ecotrace-text">
                              {product.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : product.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status === 'active' ? '활성' : 
                               product.status === 'pending' ? '대기' : '비활성'}
                            </span>
                          </div>
                          <p className="text-ecotrace-textSecondary mt-1">
                            카테고리: {product.category}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-ecotrace-textSecondary">탄소발자국:</span>
                              <span className="text-sm font-medium text-ecotrace-text">
                                {product.carbonFootprint} {product.unit}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-ecotrace-textSecondary">최종 업데이트:</span>
                              <span className="text-sm text-ecotrace-text">
                                {product.lastUpdated}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 선택된 제품 상세 정보 */}
              {selectedProduct && (
                <div className="mt-6 p-4 bg-ecotrace-secondary/20 rounded-lg border border-ecotrace-border">
                  <h3 className="text-lg font-semibold text-ecotrace-text mb-4">
                    {selectedProduct.name} 상세 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                        제품 ID
                      </label>
                      <p className="text-ecotrace-text font-mono">{selectedProduct.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                        카테고리
                      </label>
                      <p className="text-ecotrace-text">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                        탄소발자국
                      </label>
                      <p className="text-ecotrace-text font-medium">
                        {selectedProduct.carbonFootprint} {selectedProduct.unit}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                        상태
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedProduct.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : selectedProduct.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedProduct.status === 'active' ? '활성' : 
                         selectedProduct.status === 'pending' ? '대기' : '비활성'}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-ecotrace-textSecondary mb-1">
                        최종 업데이트
                      </label>
                      <p className="text-ecotrace-text">{selectedProduct.lastUpdated}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
