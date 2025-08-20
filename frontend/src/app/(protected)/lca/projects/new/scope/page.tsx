'use client';

import React, { useState } from 'react';
import CommonShell from '@/components/CommonShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewProjectScopePage() {
  const router = useRouter();
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    goal: '',
    functionalUnit: '',
    systemBoundary: '',
    assumptions: '',
    limitations: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAndContinue = () => {
    // 프로젝트 데이터 저장 후 다음 단계로 이동
    const projectId = `proj-${Date.now()}`;
    // 실제로는 API 호출로 저장
    // console.log('프로젝트 저장:', projectData);

    // LCI 페이지로 이동
    router.push(`/lca/projects/${projectId}/lci`);
  };

  const handleBack = () => {
    router.push('/lca');
  };

  return (
    <CommonShell>
      <div className='space-y-6'>
        {/* 헤더 */}
        <div className='flex items-center gap-4'>
          <Button variant='outline' onClick={handleBack}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            뒤로
          </Button>
          <div>
            <h1 className='stitch-h1 text-3xl font-bold'>
              새 프로젝트 스코프 정의
            </h1>
            <p className='stitch-caption'>
              LCA 프로젝트의 목적과 범위를 정의하세요
            </p>
          </div>
        </div>

        {/* 프로젝트 기본 정보 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4'>
            프로젝트 기본 정보
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='stitch-caption mb-2 block'>프로젝트명 *</label>
              <Input
                value={projectData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder='프로젝트명을 입력하세요'
                className='w-full'
              />
            </div>
            <div>
              <label className='stitch-caption mb-2 block'>기능 단위</label>
              <Input
                value={projectData.functionalUnit}
                onChange={e =>
                  handleInputChange('functionalUnit', e.target.value)
                }
                placeholder='예: 1톤의 제품'
                className='w-full'
              />
            </div>
          </div>
          <div className='mt-4'>
            <label className='stitch-caption mb-2 block'>프로젝트 설명</label>
            <textarea
              value={projectData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder='프로젝트에 대한 상세한 설명을 입력하세요'
              className='w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 resize-none'
              rows={3}
            />
          </div>
        </div>

        {/* 프로젝트 목표 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4'>
            프로젝트 목표
          </h2>
          <div>
            <label className='stitch-caption mb-2 block'>LCA 분석 목표</label>
            <textarea
              value={projectData.goal}
              onChange={e => handleInputChange('goal', e.target.value)}
              placeholder='이 LCA 분석을 통해 달성하고자 하는 목표를 명확히 기술하세요'
              className='w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 resize-none'
              rows={4}
            />
          </div>
        </div>

        {/* 시스템 경계 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4'>시스템 경계</h2>
          <div>
            <label className='stitch-caption mb-2 block'>
              분석 범위 및 경계
            </label>
            <textarea
              value={projectData.systemBoundary}
              onChange={e =>
                handleInputChange('systemBoundary', e.target.value)
              }
              placeholder='분석에 포함할 공정과 제외할 공정을 명확히 정의하세요'
              className='w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 resize-none'
              rows={4}
            />
          </div>
        </div>

        {/* 가정 및 제한사항 */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='stitch-card p-6'>
            <h2 className='stitch-h1 text-xl font-semibold mb-4'>가정사항</h2>
            <div>
              <label className='stitch-caption mb-2 block'>분석 가정</label>
              <textarea
                value={projectData.assumptions}
                onChange={e => handleInputChange('assumptions', e.target.value)}
                placeholder='분석 과정에서 사용된 가정사항들을 기록하세요'
                className='w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 resize-none'
                rows={4}
              />
            </div>
          </div>

          <div className='stitch-card p-6'>
            <h2 className='stitch-h1 text-xl font-semibold mb-4'>제한사항</h2>
            <div>
              <label className='stitch-caption mb-2 block'>분석 제한</label>
              <textarea
                value={projectData.limitations}
                onChange={e => handleInputChange('limitations', e.target.value)}
                placeholder='분석의 한계나 제약사항을 기록하세요'
                className='w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 resize-none'
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className='flex justify-end gap-4'>
          <Button variant='outline' onClick={handleBack}>
            취소
          </Button>
          <Button onClick={handleSaveAndContinue}>
            <Save className='h-4 w-4 mr-2' />
            저장하고 계속하기
          </Button>
        </div>
      </div>
    </CommonShell>
  );
}
