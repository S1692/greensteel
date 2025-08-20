"use client"

import clsx from "clsx"

export type LifecycleValue = "Gate-to-Gate" | "Cradle-to-Gate" | "Cradle-to-Grave"
export type LifecycleDTO = { lifecycle: LifecycleValue }

interface LifecycleSelectorProps {
  value: LifecycleValue
  onChange: (val: LifecycleDTO) => void
}

export function LifecycleSelector({ value, onChange }: LifecycleSelectorProps) {
  const options: { value: LifecycleValue; label: string; description: string }[] = [
    { value: "Gate-to-Gate", label: "Gate-to-Gate", description: "제조 공정만" },
    { value: "Cradle-to-Gate", label: "Cradle-to-Gate", description: "원료 조달 ~ 제조" },
    { value: "Cradle-to-Grave", label: "Cradle-to-Grave", description: "전 생애주기" },
  ]

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-foreground mb-2">라이프사이클 범위 선택</legend>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = value === option.value
          return (
            <label
              key={option.value}
              className={clsx(
                "flex flex-col items-start rounded-lg border p-4 cursor-pointer transition",
                isSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "border-border hover:bg-accent"
              )}
            >
              {/* 접근성: 폼 호환을 위해 라디오 입력 유지 */}
              <input
                type="radio"
                name="lifecycle"
                value={option.value}
                checked={isSelected}
                onChange={(e) => onChange({ lifecycle: e.target.value as LifecycleValue })}
                className="hidden"
              />
              <div className="font-medium text-sm text-foreground">{option.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
