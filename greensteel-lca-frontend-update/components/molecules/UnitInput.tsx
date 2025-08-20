"use client"

import { Input } from "../atoms/Input"
import { Select } from "../atoms/Select"

export type UnitValue = {
  amount: number | null
  unit: string
}

interface UnitInputProps {
  value: UnitValue
  onChange: (val: UnitValue) => void
  unitOptions: { value: string; label: string }[]
  placeholder?: string
  error?: string
  id?: string
  className?: string
}

export function UnitInput({
  value,
  onChange,
  unitOptions,
  placeholder,
  error,
  id,
  className = "",
}: UnitInputProps) {
  const handleAmountChange = (raw: string) => {
    if (raw === "") return onChange({ ...value, amount: null })
    const num = Number(raw)
    onChange({ ...value, amount: isNaN(num) ? null : num })
  }

  const handleUnitChange = (unit: string) => {
    onChange({ ...value, unit })
  }

  return (
    <div className={`flex gap-2 items-start ${className}`}>
      <div className="flex-1">
        <Input
          id={id}
          type="number"
          value={value.amount ?? ""}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder={placeholder}
          error={error}
        />
      </div>
      <div className="min-w-[96px]">
        <Select
          value={value.unit}
          onChange={(e) => handleUnitChange(e.target.value)}
          options={unitOptions}
        />
      </div>
    </div>
  )
}
