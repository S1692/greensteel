'use client';

import React, { useState } from 'react';
import { ProjectLayout } from '@/components/lca/templates/ProjectLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Upload,
  Download,
  FileText,
  Database,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function LCAImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('lci');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    // 실제 가져오기 로직 구현
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsImporting(false);
    alert('데이터 가져오기가 완료되었습니다!');
  };

  const downloadTemplate = (type: string) => {
    // 템플릿 다운로드 로직
    alert(`${type} 템플릿을 다운로드합니다.`);
  };

  return (
    <ProjectLayout
      title='데이터 가져오기'
      description='외부 데이터 가져오기'
      isMainPage={true}
    >
      <div className='space-y-6'>
        {/* 가져오기 옵션 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h2 text-xl font-semibold mb-4 flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            데이터 가져오기
          </h2>

          <div className='space-y-4'>
            <div>
              <label className='stitch-label mb-2 block'>가져오기 유형</label>
              <select
                value={importType}
                onChange={e => setImportType(e.target.value)}
                className='stitch-input'
              >
                <option value='lci'>LCI 데이터 (Life Cycle Inventory)</option>
                <option value='lcia'>
                  LCIA 데이터 (Life Cycle Impact Assessment)
                </option>
                <option value='process'>프로세스 데이터</option>
                <option value='product'>제품 데이터</option>
                <option value='material'>재료 데이터</option>
              </select>
            </div>

            <div>
              <label className='stitch-label mb-2 block'>파일 선택</label>
              <div className='border-2 border-dashed border-white/20 rounded-lg p-6 text-center'>
                <input
                  type='file'
                  onChange={handleFileSelect}
                  accept='.xlsx,.xls,.csv,.json,.xml'
                  className='hidden'
                  id='file-upload'
                />
                <label htmlFor='file-upload' className='cursor-pointer'>
                  <Upload className='h-12 w-12 text-white/40 mx-auto mb-4' />
                  <div className='text-white/60 mb-2'>
                    {selectedFile ? selectedFile.name : '클릭하여 파일 선택'}
                  </div>
                  <div className='text-sm text-white/40'>
                    Excel, CSV, JSON, XML 형식 지원
                  </div>
                </label>
              </div>
            </div>

            {selectedFile && (
              <div className='flex items-center gap-2 text-green-400'>
                <CheckCircle className='h-4 w-4' />
                <span>파일이 선택되었습니다: {selectedFile.name}</span>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className='stitch-button-primary w-full'
            >
              {isImporting ? '가져오는 중...' : '데이터 가져오기'}
            </Button>
          </div>
        </div>

        {/* 템플릿 다운로드 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h2 text-xl font-semibold mb-4 flex items-center gap-2'>
            <Download className='h-5 w-5' />
            템플릿 다운로드
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Button
              variant='outline'
              onClick={() => downloadTemplate('LCI')}
              className='h-24 flex flex-col items-center justify-center gap-2'
            >
              <Database className='h-8 w-8' />
              <span>LCI 데이터 템플릿</span>
            </Button>

            <Button
              variant='outline'
              onClick={() => downloadTemplate('LCIA')}
              className='h-24 flex flex-col items-center justify-center gap-2'
            >
              <FileText className='h-8 w-8' />
              <span>LCIA 데이터 템플릿</span>
            </Button>

            <Button
              variant='outline'
              onClick={() => downloadTemplate('Process')}
              className='h-24 flex flex-col items-center justify-center gap-2'
            >
              <Database className='h-8 w-8' />
              <span>프로세스 템플릿</span>
            </Button>

            <Button
              variant='outline'
              onClick={() => downloadTemplate('Product')}
              className='h-24 flex flex-col items-center justify-center gap-2'
            >
              <FileText className='h-8 w-8' />
              <span>제품 데이터 템플릿</span>
            </Button>

            <Button
              variant='outline'
              onClick={() => downloadTemplate('Material')}
              className='h-24 flex flex-col items-center justify-center gap-2'
            >
              <Database className='h-8 w-8' />
              <span>재료 데이터 템플릿</span>
            </Button>

            <Button
              variant='outline'
              onClick={() => downloadTemplate('Complete')}
              className='h-24 flex flex-col items-center justify-center gap-2'
            >
              <FileText className='h-8 w-8' />
              <span>완전한 LCA 템플릿</span>
            </Button>
          </div>
        </div>

        {/* 가져오기 가이드 */}
        <div className='stitch-card p-6'>
          <h2 className='stitch-h2 text-xl font-semibold mb-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            가져오기 가이드
          </h2>

          <div className='space-y-4 text-sm text-white/60'>
            <div>
              <h3 className='font-semibold text-white mb-2'>
                LCI 데이터 가져오기
              </h3>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>Excel 파일의 첫 번째 행은 헤더로 사용됩니다</li>
                <li>필수 컬럼: Process Name, Input/Output, Amount, Unit</li>
                <li>데이터 형식은 ISO 14040/14044 표준을 따릅니다</li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold text-white mb-2'>
                LCIA 데이터 가져오기
              </h3>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>영향 카테고리별로 데이터를 구성하세요</li>
                <li>단위는 각 방법론의 표준 단위를 사용하세요</li>
                <li>불확실성 정보가 있다면 포함하세요</li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold text-white mb-2'>
                프로세스 데이터 가져오기
              </h3>
              <ul className='list-disc list-inside space-y-1 ml-4'>
                <li>프로세스 간의 연결 관계를 명시하세요</li>
                <li>입출력 데이터와 함께 가져오세요</li>
                <li>지리적 및 시간적 범위를 명시하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}
