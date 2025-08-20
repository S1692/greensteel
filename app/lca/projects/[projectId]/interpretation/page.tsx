"use client"

import { useRouter } from "next/navigation"
import { StepTemplate } from "@/components/templates/StepTemplate"
import { PlaceholderChart } from "@/components/atoms/PlaceholderChart"
import { Table, TableRow, TableCell } from "@/components/atoms/Table"

interface InterpretationPageProps {
  params: { projectId: string }
}

export default function InterpretationPage({ params }: InterpretationPageProps) {
  const router = useRouter()

  const handleNext = () => {
    router.push(`/lca/projects/${params.projectId}/report`)
  }

  const contributionData = [
    { name: "고로 제철", share: 52.3 },
    { name: "전로 제강", share: 28.7 },
    { name: "압연 공정", share: 12.4 },
    { name: "원료 운송", share: 6.6 },
  ]

  const sensitivityData = [
    { parameter: "코크스 사용량", delta: 10, impactDelta: 15.2 },
    { parameter: "전력 사용량", delta: 15, impactDelta: 8.7 },
    { parameter: "철광석 품질", delta: 20, impactDelta: 12.1 },
  ]

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">해석 (Interpretation)</h1>
          <p className="text-muted-foreground">LCIA 결과를 분석하고 철강 제품의 환경영향을 해석합니다</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 메인 콘텐츠 */}
          <div className="flex-1 space-y-8 min-h-[calc(100vh-16rem)]">
            {/* 기여도 분석 */}
            <div className="bg-card border border-border/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                기여도 분석
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Table headers={["공정", "기여율 (%)"]}>
                    {contributionData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.share}%</TableCell>
                      </TableRow>
                    ))}
                  </Table>
                </div>
                <PlaceholderChart title="기여도 차트" height={200} />
              </div>
            </div>

            {/* 민감도 분석 */}
            <div className="bg-card border border-border/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                민감도 분석
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Table headers={["매개변수", "변화율 (%)", "영향 변화 (%)"]}>
                    {sensitivityData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.parameter}</TableCell>
                        <TableCell>±{item.delta}%</TableCell>
                        <TableCell>±{item.impactDelta}%</TableCell>
                      </TableRow>
                    ))}
                  </Table>
                </div>
                <PlaceholderChart title="민감도 차트" height={200} />
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNext}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                보고서로 이동
              </button>
            </div>
          </div>

          {/* 사이드바 */}
          <aside className="w-full lg:w-80">
            <div className="sticky top-8 bg-card border border-border/30 rounded-lg p-6 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                해석 요약
              </h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="font-medium text-foreground mb-1">주요 기여 공정</div>
                  <div className="text-muted-foreground text-sm">고로 제철 (52.3%)</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="font-medium text-foreground mb-1">민감도 분석</div>
                  <div className="text-muted-foreground text-sm">코크스 사용량이 가장 민감</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="font-medium text-foreground mb-1">개선 권고</div>
                  <div className="text-muted-foreground text-sm">수소 환원 기술 검토</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
