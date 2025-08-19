import { useState, useCallback } from 'react';

export interface Country {
  id: number;
  code: string;
  country_name: string;
  korean_name: string;
  unlocode: string | null;
}

export interface CountrySearchResponse {
  countries: Country[];
  total: number;
  query: string;
}

export const useCountrySearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCountries = useCallback(async (
    query: string, 
    limit: number = 20
  ): Promise<Country[]> => {
    if (!query.trim() || query.trim().length < 2) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/countries/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('국가 검색에 실패했습니다.');
      }

      const data: CountrySearchResponse = await response.json();
      return data.countries || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getCountryByCode = useCallback(async (code: string): Promise<Country | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/countries/code/${encodeURIComponent(code)}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('국가 조회에 실패했습니다.');
      }

      const country: Country = await response.json();
      return country;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCountryByUnlocode = useCallback(async (unlocode: string): Promise<Country | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/countries/unlocode/${encodeURIComponent(unlocode)}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('UNLOCODE로 국가 조회에 실패했습니다.');
      }

      const country: Country = await response.json();
      return country;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    searchCountries,
    getCountryByCode,
    getCountryByUnlocode,
    loading,
    error,
    clearError,
  };
};
