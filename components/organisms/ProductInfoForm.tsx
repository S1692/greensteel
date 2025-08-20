"use client"

import { useState } from "react"
import { FieldRow } from "../molecules/FieldRow"
import { Input } from "../atoms/Input"
import { Select } from "../atoms/Select"
import { TextArea } from "../atoms/TextArea"
import type { ProjectMeta } from "@/lib/types"

interface ProductInfoFormProps {
  initialData?: Partial<ProjectMeta>
  onChange: (data: Partial<ProjectMeta>) => void
}

export function ProductInfoForm({ initialData = {}, onChange }: ProductInfoFormProps) {
  const [formData, setFormData] = useState<Partial<ProjectMeta>>(initialData)

  const updateField = (field: keyof ProjectMeta, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onChange(updated)
  }

  // 철강 산업군 맞춤 분류
  const productClassOptions = [
    { value: "", label: "선택하세요" },
    { value: "열연강판", label: "열연강판 (Hot Rolled Steel)" },
    { value: "냉연강판", label: "냉연강판 (Cold Rolled Steel)" },
    { value: "철근", label: "철근 (Rebar)" },
    { value: "후판", label: "후판 (Steel Plate)" },
    { value: "코일", label: "강판 코일 (Steel Coil)" },
    { value: "파이프", label: "강관 / 파이프 (Steel Pipe)" },
    { value: "스테인리스", label: "스테인리스강 (Stainless Steel)" },
    { value: "기타", label: "기타" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">제품 정보</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldRow label="제품명" required>
          <Input
            value={formData.productName || ""}
            onChange={(e) => updateField("productName", e.target.value)}
            placeholder="예: 열연강판 SS400, 냉연강판 SPCC"
          />
        </FieldRow>

        <FieldRow label="제품 분류">
          <Select
            value={formData.productClass || ""}
            onChange={(e) => updateField("productClass", e.target.value)}
            options={productClassOptions}
          />
        </FieldRow>

        <FieldRow label="주요 기능" required>
          <Input
            value={formData.majorFunction || ""}
            onChange={(e) => updateField("majorFunction", e.target.value)}
            placeholder="예: 건축 구조재, 자동차 차체용, 조선용 후판"
          />
        </FieldRow>

        <FieldRow label="보조 기능">
          <Input
            value={formData.secondaryFunction || ""}
            onChange={(e) => updateField("secondaryFunction", e.target.value)}
            placeholder="예: 방청 성능, 내식성 향상"
          />
        </FieldRow>

        <FieldRow label="최소 포장재">
          <Input
            value={formData.packaging?.min || ""}
            onChange={(e) =>
              updateField("packaging", { ...formData.packaging, min: e.target.value })
            }
            placeholder="예: 코일 밴딩, 방청유 처리"
          />
        </FieldRow>

        <FieldRow label="출하 포장재">
          <Input
            value={formData.packaging?.out || ""}
            onChange={(e) =>
              updateField("packaging", { ...formData.packaging, out: e.target.value })
            }
            placeholder="예: 목재 팔레트, 철밴드 고정"
          />
        </FieldRow>
      </div>

      <FieldRow label="제품 특성">
        <TextArea
          value={formData.productFeatures || ""}
          onChange={(e) => updateField("productFeatures", e.target.value)}
          placeholder="예: 강종(SS400, SUS304), 두께(3.0mm), 폭(1200mm), 표면처리(아연도금)"
          rows={3}
        />
      </FieldRow>

      <FieldRow label="제품 사진">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            // TODO: Handle file upload
            console.log("File selected:", e.target.files?.[0])
          }}
        />
      </FieldRow>
    </div>
  )
}
