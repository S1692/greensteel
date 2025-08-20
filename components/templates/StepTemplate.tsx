import type React from "react"
// FormActions component replaced with inline buttons

interface StepTemplateProps {
  title: string
  description?: string
  children: React.ReactNode
  rightRail?: React.ReactNode
  onSave?: () => void
  onNext?: () => void
  onCancel?: () => void
  saveDisabled?: boolean
  nextDisabled?: boolean
  nextLabel?: string
  showActions?: boolean // ← 액션 버튼 영역 표시 여부
}

export function StepTemplate({
  title,
  description,
  children,
  rightRail,
  onSave,
  onNext,
  onCancel,
  saveDisabled,
  nextDisabled,
  nextLabel,
  showActions = true,
}: StepTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-foreground" aria-label={title}>
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <main className="lg:col-span-3 space-y-6">
          {children}

          {showActions && (
            <div
              className="border-t border-border pt-6"
              role="group"
              aria-label="form actions"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary px-4 py-2 rounded"
                  >
                    취소
                  </button>
                )}
                {onSave && (
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={saveDisabled}
                    className="btn-primary px-4 py-2 rounded disabled:opacity-50"
                  >
                    저장
                  </button>
                )}
                {onNext && (
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={nextDisabled}
                    className="btn-primary px-4 py-2 rounded disabled:opacity-50"
                  >
                    {nextLabel || "다음"}
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {rightRail && (
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6">{rightRail}</div>
          </aside>
        )}
      </div>
    </div>
  )
}
