'use client';

import { useState, useEffect } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Button } from '@/components/atomic/atoms';
import { Input } from '@/components/atomic/atoms';
import { 
  Building2, 
  Users, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Plus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

interface CompanyInfo {
  id: string;
  name: string;
  businessNumber: string;
  address: string;
  phone: string;
  email: string;
  industry: string;
  size: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface UserPermission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  department: string;
  permissions: string[];
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

const CompanySettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'permissions'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserPermission | null>(null);

  // 기업 정보 상태
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    id: 'COMP001',
    name: 'GreenSteel Corporation',
    businessNumber: '123-45-67890',
    address: '서울특별시 강남구 테헤란로 123, 45층',
    phone: '02-1234-5678',
    email: 'contact@greensteel.com',
    industry: '철강 및 금속 제조업',
    size: '대기업 (1000명 이상)',
    createdAt: '2024-01-15',
    status: 'active'
  });

  const [tempCompanyInfo, setTempCompanyInfo] = useState<CompanyInfo>(companyInfo);

  // 사용자 권한 상태
  const [users, setUsers] = useState<UserPermission[]>([
    {
      id: 'USER001',
      userId: 'U001',
      userName: '김철수',
      userEmail: 'kim@greensteel.com',
      role: '환경관리자',
      department: '환경안전팀',
      permissions: ['lca_read', 'lca_write', 'cbam_read'],
      status: 'approved',
      requestedAt: '2024-01-10',
      approvedAt: '2024-01-12',
      approvedBy: '관리자'
    },
    {
      id: 'USER002',
      userId: 'U002',
      userName: '이영희',
      userEmail: 'lee@greensteel.com',
      role: '데이터 분석가',
      department: '데이터팀',
      permissions: ['lca_read', 'data_upload'],
      status: 'pending',
      requestedAt: '2024-01-20'
    },
    {
      id: 'USER003',
      userId: 'U003',
      userName: '박민수',
      userEmail: 'park@greensteel.com',
      role: 'CBAM 담당자',
      department: '해외사업팀',
      permissions: ['cbam_read', 'cbam_write', 'reports'],
      status: 'approved',
      requestedAt: '2024-01-08',
      approvedAt: '2024-01-09',
      approvedBy: '관리자'
    }
  ]);

  // 새 사용자 추가 상태
  const [newUser, setNewUser] = useState({
    userName: '',
    userEmail: '',
    role: '',
    department: '',
    permissions: [] as string[]
  });

  const availablePermissions = [
    { key: 'lca_read', label: 'LCA 읽기' },
    { key: 'lca_write', label: 'LCA 쓰기' },
    { key: 'cbam_read', label: 'CBAM 읽기' },
    { key: 'cbam_write', label: 'CBAM 쓰기' },
    { key: 'data_upload', label: '데이터 업로드' },
    { key: 'reports', label: '보고서 생성' },
    { key: 'admin', label: '관리자 권한' }
  ];

  const availableRoles = [
    '환경관리자',
    '데이터 분석가',
    'CBAM 담당자',
    '일반 사용자',
    '관리자'
  ];

  const availableDepartments = [
    '환경안전팀',
    '데이터팀',
    '해외사업팀',
    '생산팀',
    '품질관리팀'
  ];

  // 기업 정보 편집 처리
  const handleCompanyInfoSave = () => {
    setCompanyInfo(tempCompanyInfo);
    setIsEditing(false);
  };

  const handleCompanyInfoCancel = () => {
    setTempCompanyInfo(companyInfo);
    setIsEditing(false);
  };

  const handleCompanyInfoEdit = () => {
    setTempCompanyInfo(companyInfo);
    setIsEditing(true);
  };

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setTempCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  // 사용자 권한 관리
  const handleAddUser = () => {
    if (!newUser.userName || !newUser.userEmail || !newUser.role) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    const user: UserPermission = {
      id: `USER${Date.now()}`,
      userId: `U${Date.now()}`,
      userName: newUser.userName,
      userEmail: newUser.userEmail,
      role: newUser.role,
      department: newUser.department,
      permissions: newUser.permissions,
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, user]);
    setNewUser({
      userName: '',
      userEmail: '',
      role: '',
      department: '',
      permissions: []
    });
    setShowAddUserModal(false);
  };

  const handleApproveUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: 'approved' as const, approvedAt: new Date().toISOString().split('T')[0], approvedBy: '현재 사용자' }
        : user
    ));
  };

  const handleRejectUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: 'rejected' as const }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleEditUser = (user: UserPermission) => {
    setEditingUser(user);
    setNewUser({
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      department: user.department,
      permissions: user.permissions
    });
    setShowAddUserModal(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(prev => prev.map(user => 
      user.id === editingUser.id 
        ? { 
            ...user, 
            userName: newUser.userName,
            userEmail: newUser.userEmail,
            role: newUser.role,
            department: newUser.department,
            permissions: newUser.permissions
          }
        : user
    ));

    setEditingUser(null);
    setNewUser({
      userName: '',
      userEmail: '',
      role: '',
      department: '',
      permissions: []
    });
    setShowAddUserModal(false);
  };

  const handlePermissionToggle = (permission: string) => {
    setNewUser(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCompanyInfoTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">기업 정보</h3>
        {!isEditing ? (
          <Button onClick={handleCompanyInfoEdit} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            편집
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleCompanyInfoSave} size="sm">
              저장
            </Button>
            <Button onClick={handleCompanyInfoCancel} variant="outline" size="sm">
              취소
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">기업명</label>
          {isEditing ? (
            <Input
              value={tempCompanyInfo.name}
              onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
              placeholder="기업명을 입력하세요"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {companyInfo.name}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">사업자등록번호</label>
          {isEditing ? (
            <Input
              value={tempCompanyInfo.businessNumber}
              onChange={(e) => handleCompanyInfoChange('businessNumber', e.target.value)}
              placeholder="사업자등록번호를 입력하세요"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {companyInfo.businessNumber}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">주소</label>
          {isEditing ? (
            <Input
              value={tempCompanyInfo.address}
              onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
              placeholder="주소를 입력하세요"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {companyInfo.address}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">전화번호</label>
          {isEditing ? (
            <Input
              value={tempCompanyInfo.phone}
              onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
              placeholder="전화번호를 입력하세요"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {companyInfo.phone}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">이메일</label>
          {isEditing ? (
            <Input
              value={tempCompanyInfo.email}
              onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
              placeholder="이메일을 입력하세요"
              type="email"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {companyInfo.email}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">업종</label>
          {isEditing ? (
            <Input
              value={tempCompanyInfo.industry}
              onChange={(e) => handleCompanyInfoChange('industry', e.target.value)}
              placeholder="업종을 입력하세요"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {companyInfo.industry}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">기업 규모</label>
          {isEditing ? (
            <select
              value={tempCompanyInfo.size}
              onChange={(e) => handleCompanyInfoChange('size', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="소기업 (10명 미만)">소기업 (10명 미만)</option>
              <option value="중소기업 (10-50명)">중소기업 (10-50명)</option>
              <option value="중견기업 (50-300명)">중견기업 (50-300명)</option>
              <option value="대기업 (300-1000명)">대기업 (300-1000명)</option>
              <option value="대기업 (1000명 이상)">대기업 (1000명 이상)</option>
            </select>
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {companyInfo.size}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">가입일</label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {companyInfo.createdAt}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">상태</label>
          <div className="p-3 bg-gray-50 rounded-md border">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              companyInfo.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {companyInfo.status === 'active' ? '활성' : '비활성'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">사용자 권한 관리</h3>
        <Button onClick={() => setShowAddUserModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          사용자 추가
        </Button>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="사용자명, 이메일, 역할, 부서로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 사용자 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                    <div className="text-sm text-gray-500">{user.userEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map((permission) => (
                      <span key={permission} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {availablePermissions.find(p => p.key === permission)?.label || permission}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : user.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'approved' ? '승인됨' : user.status === 'pending' ? '대기중' : '거부됨'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.requestedAt}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {user.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApproveUser(user.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          onClick={() => handleRejectUser(user.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          거부
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => handleEditUser(user)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      편집
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-2 lg:gap-3'>
          <h1 className='text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900'>기업 설정</h1>
          <p className='text-gray-600 text-xs lg:text-sm'>
            기업 정보 및 사용자 권한을 관리합니다.
          </p>
        </div>

        {/* 설정 탭 네비게이션 */}
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8'>
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              기업 정보
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              권한 관리
            </button>
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className='flex-1 min-h-0'>
          {activeTab === 'info' && renderCompanyInfoTab()}
          {activeTab === 'permissions' && renderPermissionsTab()}
        </div>
      </div>

      {/* 사용자 추가/편집 모달 */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingUser ? '사용자 편집' : '사용자 추가'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <Input
                  value={newUser.userName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, userName: e.target.value }))}
                  placeholder="사용자 이름"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <Input
                  value={newUser.userEmail}
                  onChange={(e) => setNewUser(prev => ({ ...prev, userEmail: e.target.value }))}
                  placeholder="사용자 이메일"
                  type="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">역할을 선택하세요</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">부서</label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">부서를 선택하세요</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">권한</label>
                <div className="space-y-2">
                  {availablePermissions.map(permission => (
                    <label key={permission.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newUser.permissions.includes(permission.key)}
                        onChange={() => handlePermissionToggle(permission.key)}
                        className="mr-2"
                      />
                      {permission.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                  setNewUser({
                    userName: '',
                    userEmail: '',
                    role: '',
                    department: '',
                    permissions: []
                  });
                }}
                variant="outline"
              >
                취소
              </Button>
              <Button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
              >
                {editingUser ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </CommonShell>
  );
};

export default CompanySettingsPage;
