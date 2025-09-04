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
      description: '회원가입 시 입력한 기업 정보를 관리합니다',
      icon: Building2,
      href: '/settings/company',
      features: [
        '기업 기본 정보 관리',
        '사업장 정보 수정',
        '연락처 정보 업데이트',
        '주소 정보 변경'
      ],
      color: 'bg-blue-500',
      buttonText: '기업 정보 관리'
    }
  ];

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-2 lg:gap-3'>
          <h1 className='text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900'>설정</h1>
          <p className='text-gray-600 text-xs lg:text-sm'>
            회원가입 시 입력한 기업 정보를 관리합니다.
          </p>
        </div>

        {/* 설정 카테고리 그리드 */}
        <div className='grid grid-cols-1 gap-6 lg:gap-8 max-w-2xl'>
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
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <Settings className='w-5 h-5 mr-2 text-gray-600' />
            기업 정보 관리 안내
          </h3>
          <div>
            <h4 className='font-medium text-gray-900 mb-2'>기업 정보 수정</h4>
            <p className='text-sm text-gray-600'>
              회원가입 시 입력한 기업 정보를 언제든지 수정할 수 있습니다. 
              사업장명, 업종, 대표자명, 연락처, 주소 등의 정보를 업데이트하여 
              최신 정보를 유지하세요.
            </p>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default SettingsPage;
