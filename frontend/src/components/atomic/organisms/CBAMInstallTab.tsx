import React, { useState } from 'react';
import { Plus, Factory, Package, Edit, Trash2, X, Calendar, Search } from 'lucide-react';
import axiosClient, { apiEndpoints } from '@/lib/axiosClient';

interface CBAMInstallTabProps {
  installs: any[];
  onShowInstallModal: () => void;
  onRefresh?: () => void;
}

export const CBAMInstallTab: React.FC<CBAMInstallTabProps> = ({
  installs,
  onShowInstallModal,
  onRefresh
}) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedInstall, setSelectedInstall] = useState<any>(null);
  const [showAddProcess, setShowAddProcess] = useState<number | null>(null);
  const [showHSCodeModal, setShowHSCodeModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showHSCNCodeModal, setShowHSCNCodeModal] = useState(false);

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

  // 제품 관리 모달 열기
  const handleProductManagement = (install: any) => {
    setSelectedInstall(install);
    setShowProductModal(true);
  };

  // 제품 추가 모달 열기
  const handleAddProduct = () => {
    setShowAddProductModal(true);
  };

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
    // TODO: API 호출하여 공정 추가
    console.log('공정 추가:', productId);
    setShowAddProcess(null);
  };

  // 공정 추가 섹션 토글
  const toggleAddProcessSection = () => {
    setShowAddProcess(showAddProcess ? null : 1); // 임시로 1을 사용
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
                        onClick={toggleAddProcessSection}
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
                </div>
              ))}
            </div>
          </div>

          {/* 공정 추가 섹션 */}
          {showAddProcess && (
            <div className="mt-6 bg-ecotrace-secondary/10 rounded-lg p-6 border border-ecotrace-border">
              <div className="flex items-center space-x-2 mb-4">
                <Plus className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-ecotrace-text">+ 공정 추가</h3>
              </div>
              
              {/* 경고 메시지 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="text-yellow-600 mt-0.5">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">사용 가능한 공정이 없습니다.</p>
                    <p className="text-sm text-yellow-700 mt-1">이미 모든 공정이 연결되어 있습니다.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ecotrace-text mb-2">
                    사업장 선택 *
                  </label>
                  <select 
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                  >
                    <option value="">사업장을 선택하세요</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ecotrace-text mb-2">
                    공정명 *
                  </label>
                  <select 
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                  >
                    <option value="">사용 가능한 공정이 없습니다</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    해당 제품의 공정 정보가 더미 데이터에 등록되어 있지 않습니다.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    disabled
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ 공정 추가</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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
                  제품명 *
                </label>
                <input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  placeholder="기간을 먼저 설정해주세요"
                  disabled={!newProduct.startDate || !newProduct.endDate}
                  className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text placeholder-ecotrace-textSecondary focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                {(!newProduct.startDate || !newProduct.endDate) && (
                  <p className="text-yellow-500 text-sm mt-1">(기간을 먼저 설정해주세요)</p>
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
