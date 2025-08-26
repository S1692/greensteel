import { useState, useEffect } from 'react';
import { getJSON } from '@/lib/http';

type FetchStatus = 'idle' | 'loading' | 'error' | 'success';

interface UseFetchTableReturn {
  data: any[];
  status: FetchStatus;
  error: string | null;
  refetch: () => void;
}

export function useFetchTable(url: string): UseFetchTableReturn {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!url) return;
    
    setStatus('loading');
    setError(null);
    
    try {
      const response = await getJSON(url);
      setData(Array.isArray(response) ? response : []);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
      setStatus('error');
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  const refetch = () => {
    fetchData();
  };

  return { data, status, error, refetch };
}
