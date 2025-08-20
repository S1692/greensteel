'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProjectLayout } from '@/components/lca/templates/ProjectLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const ProjectScopePage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <ProjectLayout
      title='프로젝트 스코프'
      description='LCA 분석의 목적과 범위를 정의하세요'
    >
      <div className='space-y-6'>
        <div className='stitch-card p-6'>
          <h2 className='stitch-h1 text-xl font-semibold mb-4'>
            분석 범위 설정
          </h2>
          <p className='stitch-caption mb-6'>
            LCA 분석의 목적과 범위를 정의하세요
          </p>

          <div className='space-y-4'>
            <div>
              <label className='stitch-label mb-2 block'>생명주기 범위</label>
              <select className='stitch-input'>
                <option value='gate-to-gate'>Gate-to-Gate</option>
                <option value='cradle-to-gate'>Cradle-to-Gate</option>
                <option value='cradle-to-grave'>Cradle-to-Grave</option>
              </select>
            </div>

            <div>
              <label className='stitch-label mb-2 block'>제품명</label>
              <Input placeholder='제품명을 입력하세요' />
            </div>

            <div>
              <label className='stitch-label mb-2 block'>주요 기능</label>
              <Input placeholder='제품의 주요 기능을 설명하세요' />
            </div>

            <div>
              <label className='stitch-label mb-2 block'>기능 단위</label>
              <Input placeholder='예: 1톤, 1개, 1㎡' />
            </div>

            <div>
              <label className='stitch-label mb-2 block'>시스템 경계</label>
              <textarea
                className='stitch-input min-h-[100px]'
                placeholder='포함할 공정과 제외할 공정을 명시하세요'
              />
            </div>

            <div>
              <label className='stitch-label mb-2 block'>
                가정 및 제한사항
              </label>
              <textarea
                className='stitch-input min-h-[100px]'
                placeholder='분석에서 적용할 가정과 제한사항을 기술하세요'
              />
            </div>
          </div>

          <div className='flex gap-3 mt-6'>
            <Button>저장</Button>
            <Button variant='outline'>다음 단계로</Button>
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
};

export default ProjectScopePage;
