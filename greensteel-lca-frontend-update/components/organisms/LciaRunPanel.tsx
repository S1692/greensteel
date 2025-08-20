"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { PlaceholderChart } from "../atoms/PlaceholderChart"
import { mockLciaCategories } from "@/lib/mocks"

interface LciaRunPanelProps {
  onRunStart: (config: { method: string; categories: string[] }) => void
  isRunning?: boolean
  results?: Array<{ category: string; value: number; unit: string }>
  availableCategories?: string[]
  defaultMethod?: string
}

export function LciaRunPanel({
  onRunStart,
  isRunning = false,
  results,
  availableCategories,
  defaultMethod = "EF 3.1",
}: LciaRunPanelProps) {
  const categories = useMemo(
    () => availableCategories ?? mockLciaCategories,
    [availableCategories],
  )

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "기후변화 (GWP100)",
    "수자원 이용",
    "화석연료 고갈",
  ])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleRunStart = () => {
    if (isRunning || selectedCategories.length === 0) return
    onRunStart({
      method: defaultMethod,
      categories: selectedCategories,
    })
  }

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">LCIA 계산 실행</h3>

      {/* 방법론 섹션 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">영향평가 방법론</label>
        <div className="rounded-lg bg-card border border-border p-3">
          <span className="text-sm text-muted-foreground">
            {defaultMethod} (Environmental Footprint)
          </span>
        </div>
      </div>

      {/* 영향범주 선택 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">영향범주 선택</label>
        <div className="flex gap-2 text-xs mb-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedCategories([])}>
            선택 초기화
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedCategories(categories)}>
            전체 선택
          </Button>
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded-lg border border-border p-3 bg-card"
          role="group"
          aria-label="영향범주 선택"
        >
          {categories.map((category) => {
            const checked = selectedCategories.includes(category)
            return (
              <label
                key={category}
                className="flex items-center gap-2 text-sm rounded-md px-2 py-1 cursor-pointer hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={checked}
                  onChange={() => toggleCategory(category)}
                />
                <span className="text-foreground">{category}</span>
              </label>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          선택된 범주: {selectedCategories.length}개
        </p>
      </div>

      {/* 실행 버튼 */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleRunStart}
          disabled={isRunning || selectedCategories.length === 0}
          variant="primary"
          size="default"
          aria-disabled={isRunning || selectedCategories.length === 0}
          aria-busy={isRunning}
        >
          {isRunning ? "계산 중..." : "계산 실행"}
        </Button>
        {selectedCategories.length === 0 && (
          <span className="text-sm text-destructive">최소 1개 이상의 범주를 선택하세요</span>
        )}
      </div>

      {/* 결과 영역 */}
      {(isRunning || results) && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">계산 결과</h4>
          {isRunning ? (
            <div
              className="rounded-lg bg-card border border-border p-4 text-center"
              role="status"
              aria-live="polite"
            >
              <div className="text-sm text-muted-foreground">계산 진행 중...</div>
            </div>
          ) : (
            <>
              <PlaceholderChart
                title="LCIA 결과"
                height={300}
                className="rounded-lg"
                // ✅ 추후 results 데이터 기반 시각화 연결 준비
              />
              {results && results.length > 0 && (
                <table
                  className="w-full text-sm border border-border rounded-lg"
                  aria-label="LCIA 결과 테이블"
                >
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-2 py-1 text-left">범주</th>
                      <th className="px-2 py-1 text-right">값</th>
                      <th className="px-2 py-1 text-left">단위</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.category}>
                        <td className="px-2 py-1">{r.category}</td>
                        <td className="px-2 py-1 text-right">
                          {r.value.toLocaleString()}
                        </td>
                        <td className="px-2 py-1">{r.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
