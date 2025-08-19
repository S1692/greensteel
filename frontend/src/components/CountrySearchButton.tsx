'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import CountrySearchModal from './CountrySearchModal';
import { Country } from '../lib/hooks/useCountrySearch';

interface CountrySearchButtonProps {
  onCountrySelect: (country: Country) => void;
  className?: string;
  buttonText?: string;
}

export default function CountrySearchButton({
  onCountrySelect,
  className = '',
  buttonText = '국가 검색',
}: CountrySearchButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${className}`}
      >
        <Search size={16} />
        {buttonText}
      </button>

      <CountrySearchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSelect={handleCountrySelect}
      />
    </>
  );
}

// 국가명 입력 필드와 검색 버튼을 함께 사용하는 컴포넌트
interface CountryInputWithSearchProps {
  value: string;
  onChange: (value: string) => void;
  onCountrySelect: (country: Country) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function CountryInputWithSearch({
  value,
  onChange,
  onCountrySelect,
  placeholder = '국가 검색으로 자동 입력',
  label = '국가명',
  required = false,
  className = '',
}: CountryInputWithSearchProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
    onChange(country.korean_name);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          readOnly
        />
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Search size={16} />
          검색
        </button>
      </div>

      <CountrySearchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSelect={handleCountrySelect}
      />
    </div>
  );
}
