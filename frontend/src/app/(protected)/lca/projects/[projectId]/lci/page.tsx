'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import CommonShell from '@/components/CommonShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

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

  return (
    <CommonShell>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3'>
          <h1 className='stitch-h1 text-3xl font-bold'>
            생명주기 인벤토리 (LCI)
          </h1>
          <p className='stitch-caption'>프로젝트 ID: {projectId}</p>
        </div>

        <div className='stitch-card p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='stitch-h1 text-xl font-semibold'>입출력 데이터</h2>
            <Button onClick={addLciItem} className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              항목 추가
            </Button>
          </div>

          <div className='space-y-4'>
            {lciItems.map(item => (
              <div
                key={item.id}
                className='grid grid-cols-6 gap-3 items-center p-4 bg-white/5 rounded-lg border border-white/10'
              >
                <div>
                  <label className='stitch-label text-xs mb-1 block'>
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
                  <label className='stitch-label text-xs mb-1 block'>
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
                  <label className='stitch-label text-xs mb-1 block'>
                    방향
                  </label>
                  <select
                    value={item.direction}
                    onChange={e =>
                      updateLciItem(item.id, 'direction', e.target.value)
                    }
                    className='stitch-input'
                  >
                    <option value='in'>입력</option>
                    <option value='out'>출력</option>
                  </select>
                </div>

                <div>
                  <label className='stitch-label text-xs mb-1 block'>
                    수량
                  </label>
                  <Input
                    type='number'
                    value={item.qty}
                    onChange={e =>
                      updateLciItem(item.id, 'qty', parseFloat(e.target.value))
                    }
                    placeholder='0'
                  />
                </div>

                <div>
                  <label className='stitch-label text-xs mb-1 block'>
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
                    className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className='flex gap-3 mt-6'>
            <Button>저장</Button>
            <Button variant='outline'>다음 단계로</Button>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default ProjectLCIPage;
