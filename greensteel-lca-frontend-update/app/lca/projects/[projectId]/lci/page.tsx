"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/layout/PageShell"
import { LciGrid } from "@/components/organisms/LciGrid"
import { Button } from "@/components/atoms/Button"
import type { LciItem } from "@/lib/types"
import { mockLciItems } from "@/lib/mocks"
import { saveLci } from "@/app/actions"

interface LciPageProps {
  params: { projectId: string }
}

export default function LciPage({ params }: LciPageProps) {
  const router = useRouter()
  const [lciItems, setLciItems] = useState<LciItem[]>(mockLciItems ?? [])
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveLci(params.projectId, lciItems)
      console.log("LCI data saved successfully")
      alert("LCI 데이터가 저장되었습니다. (Mock)")
    } catch (error) {
      console.error("Failed to save LCI data:", error)
      alert("저장 중 오류가 발생했습니다. (Mock 환경)")
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = () => {
    router.push(`/lca/projects/${params.projectId}/lcia`)
  }

  // 검증 버튼 → 아직 기능이 없으므로 알림만 표시
  const handleValidation = (type: string) => {
    alert(`${type} 검증 기능은 추후 제공 예정입니다.`)
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">LCI (Life Cycle Inventory)</h1>
          <p className="text-muted-foreground">철강 제품의 전 생애주기에 걸친 투입물과 산출물을 정량화합니다</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            <div className="bg-card border border-border/30 rounded-lg shadow-sm min-h-[calc(100vh-16rem)]">
              <LciGrid items={lciItems} onChange={setLciItems} />
            </div>

            {/* 검증 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="outline" onClick={() => handleValidation("데이터 충분성")}>
                데이터 충분성 검사
              </Button>
              <Button variant="outline" onClick={() => handleValidation("질량 균형")}>
                질량 균형 검증
              </Button>
            </div>

            {/* 저장 & 다음 이동 */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button onClick={handleSave} disabled={isSaving} variant="outline">
                {isSaving ? "저장 중..." : "저장"}
              </Button>
              <Button onClick={handleNext} variant="primary">
                LCIA로 이동
              </Button>
            </div>
          </div>

          {/* 사이드바 */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* 데이터 현황 */}
            <div className="sticky top-8 bg-card border border-border/30 rounded-lg p-6 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                데이터 현황
              </h3>
              {lciItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground font-medium">총 항목</span>
                    <span className="text-foreground font-bold text-xl">{lciItems.length}개</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground font-medium">Input 항목</span>
                    <span className="text-blue-500 font-bold text-xl">
                      {lciItems.filter((item) => item.direction === "in").length}개
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground font-medium">Output 항목</span>
                    <span className="text-green-500 font-bold text-xl">
                      {lciItems.filter((item) => item.direction === "out").length}개
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">아직 입력된 데이터가 없습니다.</p>
              )}
            </div>

            {/* 데이터 업로드 */}
            <div className="bg-card border border-border/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                데이터 업로드
              </h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full" onClick={() => alert("Excel 업로드 예정")}>
                  Excel 파일 업로드
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={() => alert("매핑 미리보기 예정")}>
                  매핑 결과 미리보기
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
