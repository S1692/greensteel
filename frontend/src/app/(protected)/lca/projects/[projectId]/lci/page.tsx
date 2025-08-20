'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import { lcaRoute } from '@/lib/nav';

interface LciItem {
  id: string;
  process: string;
  flow: string;
  direction: 'in' | 'out';
  qty: number;
  unit: string;
}

const ProjectLCIPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [lciItems, setLciItems] = useState<LciItem[]>([
    {
      id: '1',
      process: '제철공정',
      flow: '철광석',
      direction: 'in',
      qty: 1500,
      unit: 'kg',
    },
    {
      id: '2',
      process: '제철공정',
      flow: '전력',
      direction: 'in',
      qty: 800,
      unit: 'kWh',
    },
    {
      id: '3',
      process: '제철공정',
      flow: '철강',
      direction: 'out',
      qty: 1000,
      unit: 'kg',
    },
  ]);

  const addLciItem = () => {
    const newItem: LciItem = {
      id: Date.now().toString(),
      process: '',
      flow: '',
      direction: 'in',
      qty: 0,
      unit: 'kg',
    };
    setLciItems([...lciItems, newItem]);
  };

  const removeLciItem = (id: string) => {
    setLciItems(lciItems.filter(item => item.id !== id));
  };

  const updateLciItem = (id: string, field: keyof LciItem, value: any) => {
    setLciItems(
      lciItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const saveLci = async (projectId: string, lciItems: LciItem[]) => {
    // TODO: Implement saveLci server action
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('Saving LCI:', { projectId, lciItems });
    }
    alert('LCI 데이터가 저장되었습니다.');
  };

  const checkDataSufficiency = () => {
    alert('데이터 충분성 검사 예정');
  };

  const verifyMassBalance = () => {
    alert('질량 균형 검증 예정');
  };

  const handleFileUpload = () => {
    alert('Excel 파일 업로드 예정');
  };

  const showMappingPreview = () => {
    alert('매핑 결과 미리보기 예정');
  };

  // 통계 계산
  const totalItems = lciItems.length;
  const inputItems = lciItems.filter(item => item.direction === 'in').length;
  const outputItems = lciItems.filter(item => item.direction === 'out').length;

  return (
    <div className='min-h-screen'>
      <div className='px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>
            생명주기 인벤토리 (LCI)
          </h1>
          <p className='text-muted-foreground'>프로젝트 ID: {projectId}</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Main Content */}
          <div className='flex-1'>
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold'>입출력 데이터</h2>
                <Button
                  onClick={addLciItem}
                  className='flex items-center gap-2'
                >
                  <Plus className='h-4 w-4' />
                  항목 추가
                </Button>
              </div>

              <div className='space-y-4'>
                {lciItems.map(item => (
                  <div
                    key={item.id}
                    className='grid grid-cols-6 gap-3 items-center p-4 bg-muted/50 rounded-lg border border-border/30'
                  >
                    <div>
                      <label className='text-xs text-muted-foreground mb-1 block'>
                        공정
                      </label>
                      <Input
                        value={item.process}
                        onChange={e =>
                          updateLciItem(item.id, 'process', e.target.value)
                        }
                        placeholder='공정명'
                      />
                    </div>

                    <div>
                      <label className='text-xs text-muted-foreground mb-1 block'>
                        물질/에너지
                      </label>
                      <Input
                        value={item.flow}
                        onChange={e =>
                          updateLciItem(item.id, 'flow', e.target.value)
                        }
                        placeholder='물질/에너지명'
                      />
                    </div>

                    <div>
                      <label className='text-xs text-muted-foreground mb-1 block'>
                        방향
                      </label>
                      <select
                        value={item.direction}
                        onChange={e =>
                          updateLciItem(item.id, 'direction', e.target.value)
                        }
                        className='w-full px-3 py-2 border border-input rounded-md bg-background'
                      >
                        <option value='in'>입력</option>
                        <option value='out'>출력</option>
                      </select>
                    </div>

                    <div>
                      <label className='text-xs text-muted-foreground mb-1 block'>
                        수량
                      </label>
                      <Input
                        type='number'
                        value={item.qty}
                        onChange={e =>
                          updateLciItem(
                            item.id,
                            'qty',
                            parseFloat(e.target.value)
                          )
                        }
                        placeholder='0'
                      />
                    </div>

                    <div>
                      <label className='text-xs text-muted-foreground mb-1 block'>
                        단위
                      </label>
                      <Input
                        value={item.unit}
                        onChange={e =>
                          updateLciItem(item.id, 'unit', e.target.value)
                        }
                        placeholder='kg, kWh 등'
                      />
                    </div>

                    <div className='flex justify-center'>
                      <Button
                        variant='ghost'
                        onClick={() => removeLciItem(item.id)}
                        className='text-destructive hover:text-destructive hover:bg-destructive/10'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3 mt-6'>
                <Button variant='outline' onClick={checkDataSufficiency}>
                  데이터 충분성 검사
                </Button>
                <Button variant='outline' onClick={verifyMassBalance}>
                  질량 균형 검증
                </Button>
              </div>

              {/* Bottom CTAs */}
              <div className='flex gap-3 mt-6'>
                <Button onClick={() => saveLci(projectId, lciItems)}>
                  저장
                </Button>
                <Button
                  onClick={() => router.push(lcaRoute(projectId, 'lcia'))}
                >
                  LCIA로 이동
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='w-full lg:w-80 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6'>
            {/* Data Status */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>데이터 현황</h3>

              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>총 항목</span>
                  <span className='font-semibold text-lg'>{totalItems}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Input 개수</span>
                  <span className='font-semibold text-blue-600'>
                    {inputItems}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Output 개수</span>
                  <span className='font-semibold text-green-600'>
                    {outputItems}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Upload */}
            <div className='bg-card border border-border/30 rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-medium mb-4'>데이터 업로드</h3>

              <div className='space-y-3'>
                <Button
                  onClick={handleFileUpload}
                  variant='outline'
                  className='w-full flex items-center gap-2'
                >
                  <Upload className='h-4 w-4' />
                  Excel 파일 업로드
                </Button>

                <Button
                  onClick={showMappingPreview}
                  variant='outline'
                  className='w-full flex items-center gap-2'
                >
                  <FileSpreadsheet className='h-4 w-4' />
                  매핑 결과 미리보기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectLCIPage;
