'use client';

import React from 'react';
import CommonShell from '@/components/common/CommonShell';
import { Button } from '@/components/atomic/atoms';
import Link from 'next/link';
import { 
  Building2, 
  User, 
  Settings,
  Shield,
  Users,
  Bell,
  Palette
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const settingsCategories = [
    {
      title: '기업 설정',
      description: '기업 정보 및 사용자 권한을 관리합니다',
      icon: Building2,
      href: '/settings/company',
      features: [
        '기업 기본 정보 관리',
        '사용자 권한 부여 및 승인',
        '부서 및 역할 관리',
        '기업 계정 상태 관리'
      ],
      color: 'bg-blue-500',
      buttonText: '기업 설정 관리'
    },
    {
      title: '유저 설정',
      description: '개인 정보 및 환경설정을 관리합니다',
      icon: User,
      href: '/settings/user',
      features: [
        '개인 프로필 관리',
        '알림 설정',
        '보안 설정',
        '테마 및 언어 설정'
      ],
      color: 'bg-green-500',
      buttonText: '유저 설정 관리'
    }
  ];

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-2 lg:gap-3'>
          <h1 className='text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900'>설정</h1>
          <p className='text-gray-600 text-xs lg:text-sm'>
            시스템 설정을 관리합니다. 기업 설정과 유저 설정을 선택하세요.
          </p>
        </div>

        {/* 설정 카테고리 그리드 */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
          {settingsCategories.map((category, index) => (
            <div key={index} className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow'>
              <div className='flex items-center mb-4'>
                <div className={`p-3 rounded-lg ${category.color} text-white mr-4`}>
                  <category.icon className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900'>{category.title}</h3>
                  <p className='text-gray-600 text-sm'>{category.description}</p>
                </div>
              </div>

              <div className='mb-6'>
                <h4 className='text-sm font-medium text-gray-700 mb-3'>주요 기능:</h4>
                <ul className='space-y-2'>
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className='flex items-center text-sm text-gray-600'>
                      <div className='w-2 h-2 bg-gray-300 rounded-full mr-3'></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={category.href}>
                <Button className='w-full' size="lg">
                  {category.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* 추가 정보 섹션 */}
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Settings className='w-5 h-5 mr-2 text-gray-600' />
            설정 관련 안내
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>기업 설정</h4>
              <p className='text-sm text-gray-600'>
                기업 관리자는 기업 정보를 수정하고, 사용자에게 권한을 부여할 수 있습니다. 
                새로운 사용자 추가, 역할 변경, 권한 승인 등의 작업을 수행할 수 있습니다.
              </p>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>유저 설정</h4>
              <p className='text-sm text-gray-600'>
                개인 사용자는 자신의 프로필 정보를 수정하고, 알림 설정, 보안 설정, 
                테마 및 언어 등의 환경설정을 관리할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default SettingsPage;
