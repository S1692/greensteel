import React, { useState, useEffect } from 'react';
import { Button } from './atoms/Button';
import { Input } from './atoms/Input';

export interface CountryData {
  id: number;
  uuid: string;
  code: string;
  country_name: string;
  korean_name: string;
  created_at: string;
  updated_at: string;
}

interface CountrySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (country: CountryData) => void;
}

export const CountrySearchModal: React.FC<CountrySearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행
  const searchCountries = async (term: string) => {
    if (!term.trim()) {
      setCountries([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/countries/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search_term: term }),
      });

      if (!response.ok) {
        throw new Error('국가 검색에 실패했습니다.');
      }

      const data = await response.json();
      setCountries(data.countries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCountries(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 국가 선택
  const handleCountrySelect = (country: CountryData) => {
    onSelect(country);
    onClose();
    setSearchTerm('');
    setCountries([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">국가 검색</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 검색 입력 */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="국가명을 입력하세요 (예: 한국, 미국, 일본)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 검색 결과 */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">검색 중...</p>
            </div>
          ) : countries.length > 0 ? (
            <div className="space-y-2">
              {countries.map((country) => (
                <div
                  key={country.id}
                  onClick={() => handleCountrySelect(country)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {country.korean_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {country.country_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-gray-500">
                        {country.code}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8 text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              국가명을 입력하여 검색하세요.
            </div>
          )}
        </div>

        {/* 닫기 버튼 */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
            className="mr-2"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};
