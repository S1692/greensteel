// app/lca/projects/[projectId]/lcia/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { LciaRunPanel } from "@/components/organisms/LciaRunPanel"
import { Button } from "@/components/ui/button"
import { startLciaRun } from "@/app/actions"
import { STREAM_CHANNELS, subscribe } from "@/lib/streams"
import { mockLciaResults } from "@/lib/mocks"  // ✅ 추가

interface LciaPageProps {
  params: { projectId: string }
}

export default function LciaPage({ params }: LciaPageProps) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<typeof mockLciaResults>([])  // ✅ 결과 state
  const [runHistory, setRunHistory] = useState([
    { id: "run-001", method: "EF 3.1", status: "done", createdAt: "2024-01-20 14:30" },
  ]) // Will be used for displaying run history in future

  useEffect(() => {
    let unsubscribe: () => void
    try {
      unsubscribe = subscribe(STREAM_CHANNELS.LCIA_COMPLETED, (data) => {
        console.log("LCIA completed:", data)
        setIsRunning(false)
        // TODO: 백엔드 연결되면 runHistory 업데이트
      })
    } catch (err) {
      console.warn("Stream 구독 실패 (mock 모드):", err)
    }
    return () => unsubscribe && unsubscribe()
  }, [])

  const handleRunStart = async (config: { method: string; categories: string[] }) => {
    setIsRunning(true)
    try {
      const result = await startLciaRun(params.projectId, config)
      console.log("LCIA run started:", result)

      const runId = (result as any)?.runId || `mock-run-${Date.now()}`

      setTimeout(() => {
        setIsRunning(false)

        // ✅ 결과 업데이트 (mock)
        setResults(mockLciaResults.filter(r => config.categories.includes(r.category)))

        setRunHistory((prev) => [
          {
            id: runId,
            method: config.method,
            status: "done",
            createdAt: new Date().toLocaleString(),
          },
          ...prev,
        ])
      }, 2000)
    } catch (error) {
      console.error("Failed to start LCIA run (mock 처리):", error)
      setIsRunning(false)

      // fallback 결과
      setResults(mockLciaResults)
    }
  }

  const handleNext = () => {
    router.push(`/lca/projects/${params.projectId}/interpretation`)
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">LCIA (Life Cycle Impact Assessment)</h1>
          <p className="text-muted-foreground">LCI 결과를 바탕으로 철강 제품의 환경영향을 평가합니다</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            <div className="bg-card border border-border/30 rounded-lg shadow-sm min-h-[calc(100vh-16rem)]">
              <LciaRunPanel
                onRunStart={handleRunStart}
                isRunning={isRunning}
                results={results}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleNext} className="btn-primary" disabled={isRunning}>
                {isRunning ? "실행 중..." : "해석으로 이동"}
              </Button>
            </div>
          </div>

          {/* 사이드바 - 실행 상태 및 히스토리 */}
          <aside className="w-full lg:w-80">
            <div className="sticky top-8 bg-card border border-border/30 rounded-lg p-6 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                실행 상태
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground font-medium">현재 상태</span>
                  <span className={`font-bold text-sm px-2 py-1 rounded-full ${
                    isRunning 
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  }`}>
                    {isRunning ? "실행 중" : "대기 중"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground font-medium">결과 수</span>
                  <span className="text-foreground font-bold text-xl">{results.length}개</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
