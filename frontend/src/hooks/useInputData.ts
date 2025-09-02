import { useState, useEffect } from 'react';
import axiosClient from '@/lib/axiosClient';

interface InputData {
  id: number;
  로트번호: string;
  생산품명: string;
  생산수량: number;
  투입일: string;
  종료일: string;
  공정: string;
  투입물명: string;
  수량: number;
  단위: string;
  source_file: string;
  주문처명: string;
  오더번호: string;
  created_at: string;
  updated_at: string;
}

interface InputDataResponse {
  success: boolean;
  message: string;
  data: InputData[];
  count: number;
}

// 임시 더미 데이터 (투입물명이 빈 값일 때 사용)
const getDummyInputMaterial = (process: string, product: string): string => {
  const materialMap: { [key: string]: string } = {
    '코크스 생산': '코크스 공정에 적합한 원료 선택',
    '소결': '소결 공정에 적합한 원료 선택 필!',
    '제선': '제철 공정에 적합한 산화제 선택',
    '제강': '제강 공정에 적합한 합금 원료',
    '압연': '압연 공정에 적합한 소재',
    '포장': '포장 공정에 적합한 자재',
    '기타': '일반 공정. 원료: 철, 수량: 100'
  };
  
  return materialMap[process] || `일반 공정. 원료: ${product} 원료, 수량: 100`;
};

export const useInputData = () => {
  const [data, setData] = useState<InputData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInputData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosClient.get('/api/datagather/input-data');
      const result: InputDataResponse = response.data;

      if (result.success) {
        // 투입물명이 빈 값인 경우 더미 데이터로 대체
        const processedData = result.data.map(item => ({
          ...item,
          투입물명: item.투입물명 || getDummyInputMaterial(item.공정, item.생산품명)
        }));
        
        setData(processedData);
        setTotalCount(result.count || processedData.length);
        console.log(`총 ${processedData.length}개의 투입물 데이터를 가져왔습니다.`);
      } else {
        setError(result.message || '데이터 조회에 실패했습니다.');
      }
    } catch (err) {
      console.error('Input data 조회 실패:', err);
      setError('데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInputData();
  }, []);

  return {
    data,
    loading,
    error,
    totalCount,
    refetch: fetchInputData
  };
};
