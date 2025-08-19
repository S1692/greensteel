"use client";

import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import AddressSearchModal from "@/components/AddressSearchModal";
import CountrySearchModal from "@/components/CountrySearchModal";
import { Country } from "@/components/CountrySearchModal";

interface CompanyData {
  company_id: string;
  password: string;
  confirm_password: string;
  Installation: string;
  Installation_en: string;
  economic_activity: string;
  economic_activity_en: string;
  representative: string;
  representative_en: string;
  email: string;
  telephone: string;
  street: string;
  street_en: string;
  number: string;
  number_en: string;
  postcode: string;
  city: string;
  city_en: string;
  country: string;
  country_en: string;
  country_code: string;
  unlocode: string;
  sourcelatitude: number | null;
  sourcelongitude: number | null;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<CompanyData>({
    company_id: "",
    password: "",
    confirm_password: "",
    Installation: "",
    Installation_en: "",
    economic_activity: "",
    economic_activity_en: "",
    representative: "",
    representative_en: "",
    email: "",
    telephone: "",
    street: "",
    street_en: "",
    number: "",
    number_en: "",
    postcode: "",
    city: "",
    city_en: "",
    country: "",
    country_en: "",
    country_code: "",
    unlocode: "",
    sourcelatitude: null,
    sourcelongitude: null,
  });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressSelect = (addressData: any) => {
    setFormData((prev) => ({
      ...prev,
      street: addressData.street || "",
      street_en: addressData.street_en || "",
      number: addressData.number || "",
      number_en: addressData.number_en || "",
      postcode: addressData.postcode || "",
      city: addressData.city || "",
      city_en: addressData.city_en || "",
      sourcelatitude: addressData.sourcelatitude || null,
      sourcelongitude: addressData.sourcelongitude || null,
    }));
  };

  const handleCountrySelect = (countryData: Country) => {
    setFormData((prev) => ({
      ...prev,
      country: countryData.korean_name,
      country_en: countryData.country_name,
      country_code: countryData.code,
      unlocode: countryData.unlocode || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 비밀번호 확인
    if (formData.password !== formData.confirm_password) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/register/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_id: formData.company_id,
          password: formData.password,
          Installation: formData.Installation,
          Installation_en: formData.Installation_en,
          economic_activity: formData.economic_activity,
          economic_activity_en: formData.economic_activity_en,
          representative: formData.representative,
          representative_en: formData.representative_en,
          email: formData.email,
          telephone: formData.telephone,
          street: formData.street,
          street_en: formData.street_en,
          number: formData.number,
          number_en: formData.number_en,
          postcode: formData.postcode,
          city: formData.city,
          city_en: formData.city_en,
          country: formData.country,
          country_en: formData.country_en,
          country_code: formData.country_code,
          unlocode: formData.unlocode,
          sourcelatitude: formData.sourcelatitude,
          sourcelongitude: formData.sourcelongitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "회원가입에 실패했습니다.");
      }

      setSuccess("회원가입이 완료되었습니다!");
      setFormData({
        company_id: "",
        password: "",
        confirm_password: "",
        Installation: "",
        Installation_en: "",
        economic_activity: "",
        economic_activity_en: "",
        representative: "",
        representative_en: "",
        email: "",
        telephone: "",
        street: "",
        street_en: "",
        number: "",
        number_en: "",
        postcode: "",
        city: "",
        city_en: "",
        country: "",
        country_en: "",
        country_code: "",
        unlocode: "",
        sourcelatitude: null,
        sourcelongitude: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">기업 회원가입</h1>
            <p className="mt-2 text-gray-600">
              기업 정보를 입력하여 회원가입을 완료하세요.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 계정 정보 */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">계정 정보</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기업 ID *
                  </label>
                  <Input
                    type="text"
                    value={formData.company_id}
                    onChange={(e) => handleInputChange("company_id", e.target.value)}
                    required
                    placeholder="기업 ID를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 *
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 확인 *
                  </label>
                  <Input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                    required
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* 기업 정보 */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">기업 정보</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업장명 *
                  </label>
                  <Input
                    type="text"
                    value={formData.Installation}
                    onChange={(e) => handleInputChange("Installation", e.target.value)}
                    required
                    placeholder="사업장명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업장 영문명
                  </label>
                  <Input
                    type="text"
                    value={formData.Installation_en}
                    onChange={(e) => handleInputChange("Installation_en", e.target.value)}
                    placeholder="사업장 영문명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    업종명
                  </label>
                  <Input
                    type="text"
                    value={formData.economic_activity}
                    onChange={(e) => handleInputChange("economic_activity", e.target.value)}
                    placeholder="업종명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    업종명 영문명
                  </label>
                  <Input
                    type="text"
                    value={formData.economic_activity_en}
                    onChange={(e) => handleInputChange("economic_activity_en", e.target.value)}
                    placeholder="업종명 영문명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대표자명
                  </label>
                  <Input
                    type="text"
                    value={formData.representative}
                    onChange={(e) => handleInputChange("representative", e.target.value)}
                    placeholder="대표자명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    영문대표자명
                  </label>
                  <Input
                    type="text"
                    value={formData.representative_en}
                    onChange={(e) => handleInputChange("representative_en", e.target.value)}
                    placeholder="영문대표자명을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <Input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange("telephone", e.target.value)}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* 주소 정보 */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주소 정보</h2>
              
              {/* 주소 검색 버튼 */}
              <div className="mb-4">
                <Button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  variant="secondary"
                  className="w-full"
                >
                  주소 검색
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    도로명
                  </label>
                  <Input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    placeholder="도로명"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    건물 번호
                  </label>
                  <Input
                    type="text"
                    value={formData.number}
                    onChange={(e) => handleInputChange("number", e.target.value)}
                    placeholder="건물 번호"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    우편번호
                  </label>
                  <Input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange("postcode", e.target.value)}
                    placeholder="우편번호"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    도시명
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="도시명"
                    readOnly
                  />
                </div>
              </div>

              {/* 국가 검색 */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  국가
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="국가를 선택하세요"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => setIsCountryModalOpen(true)}
                    variant="secondary"
                  >
                    검색
                  </Button>
                </div>
                {(formData.country_code || formData.unlocode) && (
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    {formData.country_code && (
                      <p>국가 코드: {formData.country_code}</p>
                    )}
                    {formData.unlocode && (
                      <p>UNLOCODE: {formData.unlocode}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "처리 중..." : "회원가입"}
              </Button>
            </div>
          </form>
        </div>
      </div>

             {/* 주소 검색 모달 */}
       <AddressSearchModal
         isOpen={isAddressModalOpen}
         onClose={() => setIsAddressModalOpen(false)}
         onAddressSelect={handleAddressSelect}
       />

      {/* 국가 검색 모달 */}
      <CountrySearchModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={handleCountrySelect}
      />
    </div>
  );
}
