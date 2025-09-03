import React, { useState, useEffect } from 'react';
import { Plus, Factory, Package, Edit, Trash2, X, Calendar, Search } from 'lucide-react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface CBAMInstallTabProps {
  installs: any[];
  onShowInstallModal: () => void;
  onRefresh?: () => void;
  inputData?: any[];
}

export const CBAMInstallTab: React.FC<CBAMInstallTabProps> = ({
  installs,
  onShowInstallModal,
  onRefresh,
  inputData: propInputData = []
}) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedInstall, setSelectedInstall] = useState<any>(null);
  const [showAddProcess, setShowAddProcess] = useState<number | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string>('');
  const [showHSCodeModal, setShowHSCodeModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showHSCNCodeModal, setShowHSCNCodeModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<any[]>([]);

  // 더미 제품 데이터 (실제로는 API에서 가져올 것)
  const [products, setProducts] = useState([
    {
      id: 1,
      name: '블룸',
      startDate: '2025-08-01',
      endDate: '2025-08-30',
      quantity: 0,
      processCount: 0,
      category: '복합제품'
    }
  ]);

  // 사업장 생성 폼 상태
  const [newInstall, setNewInstall] = useState({
    name: '',
    reporting_year: 2025
  });

  // 제품 추가 폼 상태
  const [newProduct, setNewProduct] = useState({
    startDate: '',
    endDate: '',
    productName: '',
    category: '',
    cnCode: ''
  });

  // 사업장 생성 처리
  const handleCreateInstall = async () => {
    try {
      console.log('🚀 사업장 생성 요청 시작:', newInstall);
      
      const response = await axiosClient.post(apiEndpoints.cbam.install.create, newInstall);
      
      console.log('✅ 사업장 생성 성공:', response.data);
      
      // 폼 초기화
      setNewInstall({ name: '', reporting_year: 2025 });
      
      // 목록 새로고침
      if (onRefresh) {
        console.log('🔄 사업장 목록 새로고침 중...');
        onRefresh();
      }
      
    } catch (error: any) {
      console.error('❌ 사업장 생성 실패:', error);
      console.error('❌ 에러 상세:', {
        message: error?.message || 'Unknown error',
        status: error?.response?.status,
        data: error?.response?.data
      });
    }
  };

  // 로컬 스토리지에서 input 데이터 가져오기
  const getInputDataFromStorage = () => {
    try {
      const storedData = localStorage.getItem('cbam_input_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('로컬 스토리지 원본 데이터:', parsedData);
        console.log('데이터 타입:', typeof parsedData);
        console.log('배열 여부:', Array.isArray(parsedData));
        
        // 데이터가 배열인지 확인
        if (Array.isArray(parsedData)) {
          console.log('로컬 스토리지에서 Input 데이터 로드:', parsedData.length, '개 항목');
          console.log('로컬스토리지 데이터 샘플:', parsedData.slice(0, 3)); // 처음 3개 항목만 로그
          return parsedData;
        } else if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
          // API 응답 형태인 경우 (data 필드 안에 배열이 있는 경우)
          console.log('API 응답 형태 데이터에서 배열 추출:', parsedData.data.length, '개 항목');
          console.log('로컬스토리지 데이터 샘플:', parsedData.data.slice(0, 3));
          return parsedData.data;
        } else {
          console.warn('로컬스토리지 데이터가 배열이 아닙니다:', parsedData);
          return [];
        }
      }
    } catch (error) {
      console.error('로컬 스토리지 데이터 로드 실패:', error);
    }
    return propInputData || [];
  };

  const inputData = getInputDataFromStorage();

  // 생산품명 필터링 (로컬 스토리지 데이터 기준)
  const filterProductsByDateRange = (startDate: string, endDate: string) => {
    // 실시간으로 로컬 스토리지에서 데이터 가져오기
    const currentInputData = getInputDataFromStorage();
    
    if (!currentInputData.length) {
      console.log('Input 데이터가 없습니다.');
      return [];
    }
    
    console.log('필터링 시작:', { startDate, endDate, inputDataCount: currentInputData.length });
    
    const filtered = currentInputData.filter((item: any, index: number) => {
      // 로컬스토리지 데이터 구조에 맞춰 투입일과 종료일 필드 사용
      const 투입일 = item.투입일;
      const 종료일 = item.종료일;
      
      // 첫 번째 항목의 전체 구조 로그
      if (index === 0) {
        console.log('첫 번째 데이터 항목 구조:', item);
        console.log('사용 가능한 필드들:', Object.keys(item));
      }
      
      // 날짜가 없는 경우 제외
      if (!투입일 || !종료일) {
        if (index < 3) { // 처음 3개 항목만 로그
          console.log(`항목 ${index}: 날짜 누락`, { 투입일, 종료일, 생산품명: item.생산품명 });
        }
        return false;
      }
      
      // 날짜 문자열을 Date 객체로 변환
      const 투입일Date = new Date(투입일);
      const 종료일Date = new Date(종료일);
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);
      
      // 유효한 날짜인지 확인
      if (isNaN(투입일Date.getTime()) || isNaN(종료일Date.getTime())) {
        if (index < 3) {
          console.log(`항목 ${index}: 유효하지 않은 날짜`, { 투입일, 종료일, 투입일Date, 종료일Date });
        }
        return false;
      }
      
      // 투입일이 기간 시작일보다 늦거나 같고, 종료일이 기간 종료일보다 빠르거나 같은 것만 필터링
      const isWithinRange = 투입일Date >= filterStart && 종료일Date <= filterEnd;
      
      if (index < 5) { // 처음 5개 항목만 상세 로그
        console.log(`필터링 체크 ${index}:`, {
          생산품명: item.생산품명,
          투입일: 투입일,
          종료일: 종료일,
          투입일Date: 투입일Date.toISOString(),
          종료일Date: 종료일Date.toISOString(),
          filterStart: filterStart.toISOString(),
          filterEnd: filterEnd.toISOString(),
          조건1: `${투입일Date.toISOString()} > ${filterStart.toISOString()} = ${투입일Date > filterStart}`,
          조건2: `${종료일Date.toISOString()} < ${filterEnd.toISOString()} = ${종료일Date < filterEnd}`,
          isWithinRange
        });
      }
      
      return isWithinRange;
    });
    
    console.log('필터링 결과:', { filteredCount: filtered.length, filtered });
    
    // 생산품명으로 그룹화하여 중복 제거 (생산품명만 중복 없이)
    const uniqueProducts = filtered.reduce((acc: any[], item: any) => {
      const productName = item.생산품명;
      if (productName && productName.trim() !== '' && !acc.find(p => p.name === productName)) {
        acc.push({
          id: acc.length + 1,
          name: productName,
          inputData: item
        });
      }
      return acc;
    }, []);
    
    console.log('유니크 생산품명 결과:', { 
      uniqueCount: uniqueProducts.length, 
      uniqueProducts: uniqueProducts.map((p: any) => p.name) 
    });
    
    setFilteredProducts(uniqueProducts);
    return uniqueProducts;
  };

  // 생산품명에 따른 공정 필터링
  const filterProcessesByProduct = (productName: string) => {
    const currentInputData = getInputDataFromStorage();
    if (!currentInputData.length) return [];
    
    const productProcesses = currentInputData
      .filter((item: any) => item.생산품명 === productName)
      .map((item: any) => item.공정)
      .filter((process: string) => process && process.trim() !== '');
    
    // 중복 제거
    const uniqueProcesses = [...new Set(productProcesses)];
    
    setFilteredProcesses(uniqueProcesses);
    return uniqueProcesses;
  };

  // 제품 관리 모달 열기
  const handleProductManagement = (install: any) => {
    setSelectedInstall(install);
    setShowProductModal(true);
  };

  // 제품 추가 모달 열기
  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

  // 날짜 변경 시 생산품명 필터링
  useEffect(() => {
    const currentInputData = getInputDataFromStorage();
    if (newProduct.startDate && newProduct.endDate && currentInputData.length > 0) {
      filterProductsByDateRange(newProduct.startDate, newProduct.endDate);
    }
  }, [newProduct.startDate, newProduct.endDate, filterProductsByDateRange]);

  // 제품 추가 처리
  const handleCreateProduct = () => {
    if (!newProduct.startDate || !newProduct.endDate || !newProduct.productName) {
      alert('필수 필드를 모두 입력해주세요.');
      return;
    }

    // 새 제품 생성
    const newProductItem = {
      id: products.length + 1,
      name: newProduct.productName,
      startDate: newProduct.startDate,
      endDate: newProduct.endDate,
      quantity: 0,
      processCount: 0,
      category: newProduct.category || '미분류'
    };

    setProducts([...products, newProductItem]);
    setNewProduct({ startDate: '', endDate: '', productName: '', category: '', cnCode: '' });
    setShowAddProductModal(false);
  };

  // 공정 추가 처리
  const handleAddProcess = (productId: number) => {
    if (selectedProcess) {
      // TODO: API 호출하여 공정 추가
      console.log('공정 추가:', { productId, process: selectedProcess });
      setShowAddProcess(null);
      setSelectedProcess('');
      // 성공 메시지 표시
      alert(`${selectedProcess} 공정이 성공적으로 추가되었습니다.`);
    }
  };

  // 공정 추가 섹션 토글
  const toggleAddProcessSection = (productId: number) => {
    const isOpening = showAddProcess !== productId;
    setShowAddProcess(isOpening ? productId : null);
    setSelectedProcess(''); // 공정 선택 초기화
    
    // 공정 추가 섹션을 열 때 해당 제품의 공정을 미리 필터링
    if (isOpening && inputData.length > 0) {
      const product = products.find(p => p.id === productId);
      if (product) {
        filterProcessesByProduct(product.name);
      }
    }
  };

  // 제품 수정 핸들러
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  };

  // 제품 삭제 핸들러
  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      setProducts(products.filter(p => p.id !== productId));
      console.log('제품 삭제:', productId);
    }
  };

  // 제품 수정 저장
  const handleSaveEditProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...p, ...editingProduct } : p
      ));
      setShowEditProductModal(false);
      setEditingProduct(null);
      console.log('제품 수정 완료:', editingProduct);
    }
  };

  // 공정 수정 핸들러
  const handleEditProcess = (processName: string) => {
    console.log('공정 수정:', processName);
    // TODO: 공정 수정 모달 구현
  };

  // 공정 삭제 핸들러
  const handleDeleteProcess = (processName: string) => {
    if (window.confirm(`정말로 "${processName}" 공정을 삭제하시겠습니까?`)) {
      console.log('공정 삭제:', processName);
      // TODO: 공정 삭제 로직 구현
    }
  };

  return (
    <div className="space-y-6">
      {/* 사업장 생성 섹션 */}
      <div className="bg-ecotrace-surface rounded-lg p-6 border border-ecotrace-border">
        <div className="flex items-center space-x-2 mb-4">
          <Factory className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-ecotrace-text">사업장 생성</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-ecotrace-text mb-2">
              사업장명 *
            </label>
            <input
              type="text"
              value={newInstall.name}
              onChange={(e) => setNewInstall({ ...newInstall, name: e.target.value })}
              placeholder="예: 포항제철소"
              className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text placeholder-ecotrace-textSecondary focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-ecotrace-text mb-2">
              보고기간 *
            </label>
            <input
              type="number"
              value={newInstall.reporting_year}
              onChange={(e) => setNewInstall({ ...newInstall, reporting_year: parseInt(e.target.value) || 2025 })}
              placeholder="2025"
              className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text placeholder-ecotrace-textSecondary focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleCreateInstall}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Factory className="h-4 w-4" />
          <span>사업장 생성</span>
        </button>
      </div>

      {/* 등록된 사업장 목록 */}
      <div className="bg-ecotrace-surface rounded-lg p-6 border border-ecotrace-border">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-ecotrace-text">
            등록된 사업장 목록 ({installs.length}개)
          </h3>
        </div>
        
        <div className="space-y-4">
          {installs.map((install) => (
            <div key={install.id} className="bg-ecotrace-secondary/20 rounded-lg p-4 border border-ecotrace-border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-ecotrace-text">{install.name}</h4>
                    <span className="text-xs bg-ecotrace-secondary/50 text-ecotrace-textSecondary px-2 py-1 rounded">
                      ID: {install.id}
                    </span>
                  </div>
                  <p className="text-sm text-ecotrace-textSecondary">
                    보고기간: {install.reporting_year}년
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleProductManagement(install)}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    제품 관리
                  </button>
                  <button className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600 transition-colors">
                    수정
                  </button>
                  <button className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 제품 관리 모달 */}
      {showProductModal && selectedInstall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ecotrace-surface rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-ecotrace-text">제품 관리</h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-ecotrace-textSecondary hover:text-ecotrace-text"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-ecotrace-text">
                등록된 제품 목록 ({products.length}개)
              </h3>
        <button
                onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
                <span>제품 추가</span>
        </button>
      </div>

            {/* 제품 목록 */}
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-ecotrace-secondary/20 rounded-lg p-4 border border-ecotrace-border">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold text-ecotrace-text">{product.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleAddProcessSection(product.id)}
                        className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        공정 추가
                      </button>
                                            <button 
                        onClick={() => handleEditProduct(product)}
                        className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        삭제
                    </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-ecotrace-textSecondary">
                    <div>
                      <span className="font-medium">기간:</span> {product.startDate} ~ {product.endDate}
                    </div>
                    <div>
                      <span className="font-medium">수량:</span> {product.quantity}
                    </div>
                    <div>
                      <span className="font-medium">공정 수:</span> 3개
                    </div>
                    <div>
                      <span className="font-medium">카테고리:</span> {product.category}
                    </div>
                  </div>

                  {/* 등록된 공정 목록 */}
                  <div className="mt-4 pt-4 border-t border-ecotrace-border">
                    <h5 className="font-medium text-ecotrace-text mb-3">■ 등록된 공정:</h5>
                    <div className="space-y-2">
                      {['제강', '제선', '주조'].map((process, index) => (
                        <div key={index} className="flex items-center justify-between bg-ecotrace-secondary/10 rounded-lg p-3">
                          <span className="text-ecotrace-text">{process}</span>
                          <div className="flex space-x-2">
                                                        <button 
                              onClick={() => handleEditProcess(process)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>수정</span>
                    </button>
                            <button 
                              onClick={() => handleDeleteProcess(process)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>삭제</span>
                    </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 각 제품별 공정 추가 섹션 */}
                  {showAddProcess === product.id && (
                    <div className="mt-4 pt-4 border-t border-ecotrace-border">
                      <div className="flex items-center space-x-2 mb-4">
                        <Plus className="h-5 w-5 text-purple-500" />
                        <h3 className="text-lg font-semibold text-ecotrace-text">+ 공정 추가</h3>
                      </div>
                      
                      {/* 사용 가능한 공정 정보 */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          사용 가능한 공정: 3개
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          아래 드롭다운에서 해당 제품에 적합한 공정을 선택해주세요.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-ecotrace-text mb-2">
                            사업장 선택 *
                          </label>
                          <select 
                            className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">사업장을 선택하세요</option>
                            <option value="포항제철소">포항제철소</option>
                            <option value="광양제철소">광양제철소</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-ecotrace-text mb-2">
                            공정명 * (생산품명에 따른 필터링)
                          </label>
                          <select 
                            value={selectedProcess}
                            onChange={(e) => {
                              setSelectedProcess(e.target.value);
                              // 공정 선택 시 해당 제품의 공정 목록 업데이트
                              if (e.target.value && product.name) {
                                filterProcessesByProduct(product.name);
                              }
                            }}
                            className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">
                              {product.name 
                                ? "공정을 선택하세요" 
                                : "제품을 먼저 선택해주세요"}
                            </option>
                            {product.name && filteredProcesses.map((process, index) => (
                              <option key={index} value={process}>
                                {process}
                              </option>
                            ))}
                          </select>
                          {product.name && (
                            <p className="text-blue-500 text-sm mt-1">
                              &quot;{product.name}&quot; 제품의 공정: {filteredProcesses.length}개
                            </p>
                          )}
                        </div>
                        
                        <div className="flex justify-center">
                          <button 
                            onClick={() => handleAddProcess(product.id)}
                            disabled={!selectedProcess}
                            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                              selectedProcess 
                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                            <span>+ 공정 추가</span>
                    </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 제품 추가 모달 */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ecotrace-surface rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-ecotrace-text">제품 관리</h2>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-ecotrace-textSecondary hover:text-ecotrace-text"
              >
                <X className="h-6 w-6" />
                    </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ecotrace-text mb-2">
                    기간 시작일 *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newProduct.startDate}
                      onChange={(e) => setNewProduct({ ...newProduct, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-ecotrace-textSecondary" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-text mb-2">
                    기간 종료일 *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newProduct.endDate}
                      onChange={(e) => setNewProduct({ ...newProduct, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-ecotrace-textSecondary" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ecotrace-text mb-2">
                  생산품명 * (Input 데이터에서 필터링)
                </label>
                <select
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  disabled={!newProduct.startDate || !newProduct.endDate || filteredProducts.length === 0}
                  className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    {!newProduct.startDate || !newProduct.endDate 
                      ? "기간을 먼저 설정해주세요" 
                      : filteredProducts.length === 0 
                        ? "해당 기간에 생산품명이 없습니다" 
                        : "생산품명을 선택하세요"}
                  </option>
                  {filteredProducts.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {(!newProduct.startDate || !newProduct.endDate) && (
                  <p className="text-yellow-500 text-sm mt-1">기간을 먼저 설정해주세요</p>
                )}
                {newProduct.startDate && newProduct.endDate && filteredProducts.length === 0 && (
                  <div className="text-red-500 text-sm mt-1">
                    <p>해당 기간에 생산품명이 없습니다</p>
                    <p className="text-xs mt-1">조건: 투입일이 {newProduct.startDate} 이후이고, 종료일이 {newProduct.endDate} 이전인 데이터</p>
                  </div>
                )}
                {filteredProducts.length > 0 && (
                  <div className="text-green-500 text-sm mt-1">
                    <p>{filteredProducts.length}개의 생산품명이 있습니다</p>
                    <p className="text-xs mt-1">조건: 투입일이 {newProduct.startDate} 이후이고, 종료일이 {newProduct.endDate} 이전인 데이터</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ecotrace-text mb-2">
                  제품 카테고리
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option value="철강">철강</option>
                  <option value="시멘트">시멘트</option>
                  <option value="알루미늄">알루미늄</option>
                  <option value="전기">전기</option>
                  <option value="수소">수소</option>
                  <option value="복합제품">복합제품</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ecotrace-text mb-2">
                  CN 코드
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newProduct.cnCode}
                    onChange={(e) => setNewProduct({ ...newProduct, cnCode: e.target.value })}
                    placeholder="HS CODE 검색 후 자동 입력"
                    className="flex-1 px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text placeholder-ecotrace-textSecondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => setShowHSCNCodeModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Search className="h-4 w-4" />
                    <span>HS CODE 검색</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleCreateProduct}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Package className="h-4 w-4" />
                <span>제품 생성</span>
              </button>
        </div>
      </div>
        </div>
      )}

      {/* HS CODE 검색 모달 */}
      {showHSCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">HS CODE 검색</h2>
              <button 
                onClick={() => setShowHSCodeModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색어
                </label>
                <input
                  type="text"
                  placeholder="제품명 또는 HS CODE를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowHSCodeModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // TODO: HS CODE 검색 로직 구현
                    console.log('HS CODE 검색 실행');
                    setShowHSCodeModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  검색
                </button>
              </div>

              {/* 검색 결과 영역 */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">검색 결과</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-500 text-center">검색어를 입력하고 검색 버튼을 클릭하세요.</p>
                </div>
              </div>
        </div>
      </div>
        </div>
      )}

      {/* 제품 수정 모달 */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ecotrace-surface rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-ecotrace-text">제품 수정</h2>
              <button
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-ecotrace-textSecondary hover:text-ecotrace-text"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ecotrace-text mb-2">
                    기간 시작일 *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={editingProduct.startDate}
                      onChange={(e) => setEditingProduct({ ...editingProduct, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-ecotrace-textSecondary" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-text mb-2">
                    기간 종료일 *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={editingProduct.endDate}
                      onChange={(e) => setEditingProduct({ ...editingProduct, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-ecotrace-textSecondary" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ecotrace-text mb-2">
                  제품명 *
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="제품명을 입력하세요"
                  className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text placeholder-ecotrace-textSecondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ecotrace-text mb-2">
                  수량 *
                </label>
                <input
                  type="number"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="수량을 입력하세요"
                  className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text placeholder-ecotrace-textSecondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ecotrace-text mb-2">
                  카테고리 *
                </label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option value="복합제품">복합제품</option>
                  <option value="단일제품">단일제품</option>
                  <option value="원료">원료</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ecotrace-text mb-2">
                  HS CN 코드
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editingProduct.cnCode}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cnCode: e.target.value })}
                    placeholder="HS CODE 검색 후 자동 입력"
                    className="flex-1 px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text placeholder-ecotrace-textSecondary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => setShowHSCNCodeModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Search className="h-4 w-4" />
                    <span>HS CODE 검색</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 text-ecotrace-textSecondary bg-ecotrace-secondary/20 rounded-lg hover:bg-ecotrace-secondary/30 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveEditProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HS CN 코드 검색 모달 */}
      {showHSCNCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">HS CN 코드 검색</h2>
              <button 
                onClick={() => setShowHSCNCodeModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색어
                </label>
                <input
                  type="text"
                  placeholder="제품명 또는 HS CN 코드를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowHSCNCodeModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    // TODO: HS CN 코드 검색 로직 구현
                    console.log('HS CN 코드 검색 실행');
                    setShowHSCNCodeModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  검색
                </button>
              </div>

              {/* 검색 결과 영역 */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">검색 결과</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* 샘플 검색 결과 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">7208.10.00 - 철강재 (Hot-rolled)</p>
                        <p className="text-sm text-gray-600">열간압연된 철강재</p>
                      </div>
                      <button 
                        onClick={() => {
                          // 선택된 코드를 입력 필드에 자동 입력
                          if (editingProduct) {
                            setEditingProduct({ ...editingProduct, cnCode: '7208.10.00' });
                          } else {
                            setNewProduct({ ...newProduct, cnCode: '7208.10.00' });
                          }
                          setShowHSCNCodeModal(false);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        선택
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">7208.90.00 - 기타 철강재</p>
                        <p className="text-sm text-gray-600">기타 형태의 철강재</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (editingProduct) {
                            setEditingProduct({ ...editingProduct, cnCode: '7208.90.00' });
                          } else {
                            setNewProduct({ ...newProduct, cnCode: '7208.90.00' });
                          }
                          setShowHSCNCodeModal(false);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        선택
                      </button>
                    </div>
                  </div>
                </div>
              </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
