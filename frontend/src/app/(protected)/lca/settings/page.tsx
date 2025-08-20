'use client';

import React from 'react';
import { ProjectLayout } from '@/components/lca/templates/ProjectLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Database, Globe, Calculator, FileText } from 'lucide-react';

export default function LCASettingsPage() {
  return (
    <ProjectLayout
      title='LCA 설정'
      description='LCA 관련 설정 및 구성'
      isMainPage={true}
    >
      <div className='space-y-6'>
        {/* 일반 설정 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h2 text-xl font-semibold mb-4 flex items-center gap-2'>
            <Globe className='h-5 w-5' />
            일반 설정
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='stitch-label mb-2 block'>기본 언어</label>
              <select className='stitch-input'>
                <option value='ko'>한국어</option>
                <option value='en'>English</option>
                <option value='ja'>日本語</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>시간대</label>
              <select className='stitch-input'>
                <option value='Asia/Seoul'>Asia/Seoul (UTC+9)</option>
                <option value='UTC'>UTC</option>
                <option value='America/New_York'>America/New_York</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>통화 단위</label>
              <select className='stitch-input'>
                <option value='KRW'>KRW (원)</option>
                <option value='USD'>USD ($)</option>
                <option value='EUR'>EUR (€)</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>무게 단위</label>
              <select className='stitch-input'>
                <option value='kg'>kg</option>
                <option value='ton'>ton</option>
                <option value='lb'>lb</option>
              </select>
            </div>
          </div>
        </div>

        {/* LCA 데이터베이스 설정 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h2 text-xl font-semibold mb-4 flex items-center gap-2'>
            <Database className='h-5 w-5' />
            LCA 데이터베이스 설정
          </h2>
          <div className='space-y-4'>
            <div>
              <label className='stitch-label mb-2 block'>
                기본 LCI 데이터베이스
              </label>
              <select className='stitch-input'>
                <option value='ecoinvent'>Ecoinvent</option>
                <option value='gabi'>GaBi</option>
                <option value='openlca'>OpenLCA</option>
                <option value='custom'>사용자 정의</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>LCIA 방법론</label>
              <select className='stitch-input'>
                <option value='ipcc'>IPCC GWP 100a</option>
                <option value='recipe'>ReCiPe 2016</option>
                <option value='cml'>CML-IA</option>
                <option value='trad'>TRACI</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>
                데이터 품질 요구사항
              </label>
              <select className='stitch-input'>
                <option value='high'>높음 (연구용)</option>
                <option value='medium'>보통 (일반용)</option>
                <option value='low'>낮음 (예비용)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 계산 설정 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h2 text-xl font-semibold mb-4 flex items-center gap-2'>
            <Calculator className='h-5 w-5' />
            계산 설정
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='stitch-label mb-2 block'>기본 할당 방법</label>
              <select className='stitch-input'>
                <option value='mass'>질량 기반</option>
                <option value='economic'>경제적 가치 기반</option>
                <option value='energy'>에너지 기반</option>
                <option value='substitution'>대체 방법</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>불확실성 분석</label>
              <select className='stitch-input'>
                <option value='monte_carlo'>Monte Carlo 시뮬레이션</option>
                <option value='sensitivity'>민감도 분석</option>
                <option value='none'>사용하지 않음</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>시나리오 분석</label>
              <select className='stitch-input'>
                <option value='enabled'>활성화</option>
                <option value='disabled'>비활성화</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>자동 저장 간격</label>
              <select className='stitch-input'>
                <option value='1'>1분</option>
                <option value='5'>5분</option>
                <option value='15'>15분</option>
                <option value='30'>30분</option>
              </select>
            </div>
          </div>
        </div>

        {/* 보고서 설정 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h2 text-xl font-semibold mb-4 flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            보고서 설정
          </h2>
          <div className='space-y-4'>
            <div>
              <label className='stitch-label mb-2 block'>
                기본 보고서 템플릿
              </label>
              <select className='stitch-input'>
                <option value='iso14040'>ISO 14040/14044 표준</option>
                <option value='simplified'>간소화된 보고서</option>
                <option value='detailed'>상세 보고서</option>
                <option value='custom'>사용자 정의</option>
              </select>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>출력 형식</label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' defaultChecked className='rounded' />
                  <span>PDF</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' defaultChecked className='rounded' />
                  <span>Word</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' className='rounded' />
                  <span>Excel</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' className='rounded' />
                  <span>HTML</span>
                </label>
              </div>
            </div>
            <div>
              <label className='stitch-label mb-2 block'>회사 로고</label>
              <Input type='file' accept='image/*' />
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className='flex justify-end'>
          <Button className='stitch-button-primary flex items-center gap-2'>
            <Save className='h-4 w-4' />
            설정 저장
          </Button>
        </div>
      </div>
    </ProjectLayout>
  );
}
