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

export const useInputData = () => {
  const [data, setData] = useState<InputData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInputData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 데이터 게더 서비스의 input-data 엔드포인트 호출
      const response = await axiosClient.get('/api/datagather/input-data');
      const result: InputDataResponse = response.data;
      
      if (result.success) {
        setData(result.data);
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
    refetch: fetchInputData
  };
};
