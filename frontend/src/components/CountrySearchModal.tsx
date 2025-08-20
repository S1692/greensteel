'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

export interface Country {
  id: number;
  code: string;
  country_name: string;
  korean_name: string;
  unlocode: string | null;
}

interface CountrySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
}

export default function CountrySearchModal({
  isOpen,
  onClose,
  onSelect,
}: CountrySearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색어가 변경될 때마다 API 호출
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchCountries(searchQuery);
    } else {
      setCountries([]);
    }
  }, [searchQuery]);

  const searchCountries = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/countries/search?query=${encodeURIComponent(query)}&limit=20`
      );

      if (!response.ok) {
        throw new Error('국가 검색에 실패했습니다.');
      }

      const data = await response.json();
      setCountries(data.countries || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    onSelect(country);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setCountries([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden'>
        {/* 헤더 */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>국가 검색</h2>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={20} />
          </Button>
        </div>

        {/* 검색 입력 */}
        <div className='p-6 border-b border-gray-200'>
          <Input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='국가명, 국가코드, UNLOCODE를 입력하세요...'
            leftIcon={<Search size={18} />}
          />
          <p className='text-sm text-gray-500 mt-2'>
            최소 2글자 이상 입력하면 검색이 시작됩니다.
          </p>
        </div>

        {/* 검색 결과 */}
        <div className='flex-1 overflow-y-auto max-h-96'>
          {loading && (
            <div className='p-6 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto'></div>
              <p className='text-gray-500 mt-2'>검색 중...</p>
            </div>
          )}

          {error && (
            <div className='p-6 text-center'>
              <p className='text-red-500'>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            countries.length === 0 &&
            searchQuery.trim().length >= 2 && (
              <div className='p-6 text-center'>
                <p className='text-gray-500'>검색 결과가 없습니다.</p>
              </div>
            )}

          {!loading && !error && countries.length > 0 && (
            <div className='divide-y divide-gray-200'>
              {countries.map(country => (
                <div
                  key={country.id}
                  onClick={() => handleCountrySelect(country)}
                  className='p-4 hover:bg-gray-50 cursor-pointer transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <MapPin size={16} className='text-gray-500' />
                        <span className='font-medium text-gray-900'>
                          {country.korean_name}
                        </span>
                        <span className='text-sm text-gray-500'>
                          ({country.country_name})
                        </span>
                      </div>
                      <div className='flex items-center gap-4 mt-1 text-sm text-gray-600'>
                        <span>코드: {country.code}</span>
                        {country.unlocode && (
                          <span>UNLOCODE: {country.unlocode}</span>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                        선택
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className='p-6 border-t border-gray-200 bg-gray-50'>
          <div className='flex justify-between items-center text-sm text-gray-500'>
            <span>총 {countries.length}개 결과</span>
            <span>Enter 키로 첫 번째 결과 선택</span>
          </div>
        </div>
      </div>
    </div>
  );
}
