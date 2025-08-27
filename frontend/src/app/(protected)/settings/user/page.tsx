'use client';

import { useState } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Button } from '@/components/atomic/atoms';
import { Input } from '@/components/atomic/atoms';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Database,
  Save,
  X,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  department: string;
  employeeId: string;
  joinDate: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  systemUpdates: boolean;
  cbamAlerts: boolean;
  lcaUpdates: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginHistory: boolean;
  deviceManagement: boolean;
}

interface PreferenceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

const UserSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '홍길동',
    email: 'hong@greensteel.com',
    company: 'GreenSteel Corp.',
    role: '환경관리자',
    phone: '010-1234-5678',
    department: '환경안전팀',
    employeeId: 'EMP001',
    joinDate: '2024-01-15'
  });

  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    systemUpdates: true,
    cbamAlerts: true,
    lcaUpdates: true
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginHistory: true,
    deviceManagement: false
  });

  const [preferences, setPreferences] = useState<PreferenceSettings>({
    theme: 'light',
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: '1,234.56'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'profile', label: '프로필', icon: User },
    { id: 'notifications', label: '알림', icon: Bell },
    { id: 'security', label: '보안', icon: Shield },
    { id: 'preferences', label: '환경설정', icon: Palette }
  ] as const;

  // 프로필 편집 처리
  const handleProfileSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleProfileCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleProfileEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  // 알림 설정 처리
  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  // 보안 설정 처리
  const handleSecurityChange = (field: keyof SecuritySettings, value: boolean | number) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  };

  // 환경설정 처리
  const handlePreferenceChange = (field: keyof PreferenceSettings, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value as any }));
  };

  // 비밀번호 변경 처리
  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    // 비밀번호 변경 로직 구현
    alert('비밀번호가 성공적으로 변경되었습니다.');
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">사용자 프로필</h3>
        {!isEditing ? (
          <div className="flex space-x-2">
            <Button onClick={handleProfileEdit} variant="outline" size="sm">
              편집
            </Button>
            <Button onClick={() => setShowPasswordModal(true)} variant="outline" size="sm">
              <Key className="w-4 h-4 mr-2" />
              비밀번호 변경
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleProfileSave} size="sm">
              저장
            </Button>
            <Button onClick={handleProfileCancel} variant="outline" size="sm">
              취소
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">이름</label>
          {isEditing ? (
            <Input
              value={tempProfile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="이름을 입력하세요"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {profile.name}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">이메일</label>
          {isEditing ? (
            <Input
              value={tempProfile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="이메일을 입력하세요"
              type="email"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {profile.email}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">회사</label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {profile.company}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">직책</label>
          {isEditing ? (
            <Input
              value={tempProfile.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="직책을 입력하세요"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {profile.role}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">전화번호</label>
          {isEditing ? (
            <Input
              value={tempProfile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="전화번호를 입력하세요"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border">
              {profile.phone}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">부서</label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {profile.department}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">사원번호</label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {profile.employeeId}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">입사일</label>
          <div className="p-3 bg-gray-50 rounded-md border">
            {profile.joinDate}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">알림 설정</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">이메일 알림</h4>
              <p className="text-sm text-gray-600">중요한 업데이트를 이메일로 받습니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">푸시 알림</h4>
              <p className="text-sm text-gray-600">브라우저에서 실시간 알림을 받습니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.pushNotifications}
              onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">주간 보고서</h4>
              <p className="text-sm text-gray-600">주간 데이터 요약을 이메일로 받습니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.weeklyReports}
              onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">시스템 업데이트</h4>
              <p className="text-sm text-gray-600">새로운 기능과 업데이트 소식을 받습니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.systemUpdates}
              onChange={(e) => handleNotificationChange('systemUpdates', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">CBAM 알림</h4>
              <p className="text-sm text-gray-600">CBAM 관련 중요 알림을 받습니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.cbamAlerts}
              onChange={(e) => handleNotificationChange('cbamAlerts', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">LCA 업데이트</h4>
              <p className="text-sm text-gray-600">LCA 프로젝트 상태 변경 알림을 받습니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.lcaUpdates}
              onChange={(e) => handleNotificationChange('lcaUpdates', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">보안 설정</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">2단계 인증</h4>
              <p className="text-sm text-gray-600">추가 보안을 위해 2단계 인증을 활성화합니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security.twoFactorAuth}
              onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">세션 타임아웃</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">자동 로그아웃 시간을 설정합니다</p>
          <select
            value={security.sessionTimeout}
            onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={15}>15분</option>
            <option value={30}>30분</option>
            <option value={60}>1시간</option>
            <option value={120}>2시간</option>
            <option value={480}>8시간</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">비밀번호 만료</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">비밀번호 변경 주기를 설정합니다</p>
          <select
            value={security.passwordExpiry}
            onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={30}>30일</option>
            <option value={60}>60일</option>
            <option value={90}>90일</option>
            <option value={180}>180일</option>
            <option value={365}>1년</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">로그인 기록</h4>
              <p className="text-sm text-gray-600">로그인 활동을 기록하고 모니터링합니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security.loginHistory}
              onChange={(e) => handleSecurityChange('loginHistory', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">디바이스 관리</h4>
              <p className="text-sm text-gray-600">로그인된 디바이스를 관리합니다</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={security.deviceManagement}
              onChange={(e) => handleSecurityChange('deviceManagement', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">환경설정</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">테마 설정</h4>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={preferences.theme === 'light'}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">라이트 모드</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={preferences.theme === 'dark'}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">다크 모드</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value="auto"
                checked={preferences.theme === 'auto'}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">자동</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">언어 설정</h4>
          <select 
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">시간대 설정</h4>
          <select 
            value={preferences.timezone}
            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
            <option value="UTC">UTC (UTC+0)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">날짜 형식</h4>
          <select 
            value={preferences.dateFormat}
            onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY년 MM월 DD일">YYYY년 MM월 DD일</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">숫자 형식</h4>
          <select 
            value={preferences.numberFormat}
            onChange={(e) => handlePreferenceChange('numberFormat', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1,234.56">1,234.56 (미국식)</option>
            <option value="1.234,56">1.234,56 (유럽식)</option>
            <option value="1 234.56">1 234.56 (공백 구분)</option>
            <option value="1234.56">1234.56 (구분자 없음)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'preferences':
        return renderPreferencesTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-2 lg:gap-3'>
          <h1 className='text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900'>유저 설정</h1>
          <p className='text-gray-600 text-xs lg:text-sm'>
            개인 정보 및 환경설정을 관리합니다.
          </p>
        </div>

        {/* 설정 탭 네비게이션 */}
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className='flex-1 min-h-0'>
          {renderTabContent()}
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">비밀번호 변경</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                variant="outline"
              >
                취소
              </Button>
              <Button onClick={handlePasswordChange}>
                변경
              </Button>
            </div>
          </div>
        </div>
      )}
    </CommonShell>
  );
};

export default UserSettingsPage;
