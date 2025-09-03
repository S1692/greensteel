import React, { useState } from 'react';
import { Plus, Factory, Package, Edit, Trash2, X, Calendar, Search } from 'lucide-react';

interface CBAMInstallTabProps {
  installs: any[];
  onShowInstallModal: () => void;
}

export const CBAMInstallTab: React.FC<CBAMInstallTabProps> = ({
  installs,
  onShowInstallModal
}) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedInstall, setSelectedInstall] = useState<any>(null);
  const [showAddProcess, setShowAddProcess] = useState<number | null>(null);

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
      
      // 목록 새로고침 (실제로는 API에서 다시 가져와야 함)
      // TODO: installs 목록 새로고침
      
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
                    <h4 className="text-lg font-semibold text-ecotrace-text">{install.install_name}</h4>
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
                        onClick={() => setShowAddProcess(product.id)}
                        className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        공정 추가
                      </button>
                      <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                        수정
                    </button>
                      <button className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors">
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
                      <span className="font-medium">공정 수:</span> {product.processCount}개
                    </div>
                    <div>
                      <span className="font-medium">카테고리:</span> {product.category}
                    </div>
                  </div>

                  {/* 공정 추가 폼 */}
                  {showAddProcess === product.id && (
                    <div className="mt-4 pt-4 border-t border-ecotrace-border">
                      <div className="flex items-center space-x-2 mb-3">
                        <Plus className="h-4 w-4 text-purple-500" />
                        <h5 className="font-medium text-ecotrace-text">공정 추가</h5>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-800">
                          사용 가능한 공정: 3개
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          아래 드롭다운에서 해당 제품에 적합한 공정을 선택해주세요.
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-ecotrace-text mb-2">
                          공정명 *
                        </label>
                        <select className="w-full px-3 py-2 bg-ecotrace-secondary/20 border border-ecotrace-border rounded-lg text-ecotrace-text focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="">공정을 선택하세요</option>
                          <option value="제철공정">제철공정</option>
                          <option value="압연공정">압연공정</option>
                          <option value="열처리공정">열처리공정</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={() => handleAddProcess(product.id)}
                        className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>공정 추가</span>
                    </button>
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
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
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
    </div>
  );
};
