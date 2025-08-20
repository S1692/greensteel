import type React from "react"
import { Button } from "../atoms/Button"

interface ReportTemplateProps {
  children: React.ReactNode
  title: string
  projectInfo?: {
    owner: string
    period: { start: string; end: string }
  }
  actions?: React.ReactNode // ← 추가: 다운로드 버튼 같은 액션들을 외부에서 주입 가능
}

export function ReportTemplate({
  children,
  title,
  projectInfo,
  actions,
}: ReportTemplateProps) {
  return (
    <div className="max-w-4xl mx-auto bg-background text-foreground shadow-sm rounded-lg overflow-hidden">
      {/* Report Header */}
      <header className="border-b border-border p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">LCA 결과 보고서</p>
        </div>

        {/* 액션 버튼 (PDF, Excel 등) */}
        <div className="flex gap-2">
          {actions ?? (
            <>
              <Button
                variant="outline"
                size="sm"
                aria-label="보고서를 PDF로 다운로드"
              >
                PDF 다운로드
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="보고서를 Excel로 다운로드"
              >
                Excel 다운로드
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Report Content */}
      <main className="p-6 space-y-8">{children}</main>

      {/* Report Footer */}
      {projectInfo && (
        <footer className="border-t border-border p-6 bg-muted/30">
          <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground gap-2">
            <div>담당자: {projectInfo.owner}</div>
            <div>
              연구기간: {projectInfo.period.start} ~ {projectInfo.period.end}
            </div>
            <div>버전: v1.0</div>
          </div>
        </footer>
      )}
    </div>
  )
}
