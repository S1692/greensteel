"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/layout/PageShell"
import { Tabs } from "@/components/atoms/Tabs"
import { ProjectMetaForm } from "@/components/organisms/ProjectMetaForm"
import { ProductInfoForm } from "@/components/organisms/ProductInfoForm"
import { LifecycleSelector } from "@/components/molecules/LifecycleSelector"
import { FieldRow } from "@/components/molecules/FieldRow"
import { Input } from "@/components/atoms/Input"
import { TextArea } from "@/components/atoms/TextArea"
import { Card } from "@/components/atoms/Card"
import { KeyValueRow } from "@/components/molecules/KeyValueRow"
import { Button } from "@/components/atoms/Button"
import { Select } from "@/components/atoms/Select"
import { mockProjectMeta, mockAnalysisScope } from "@/lib/mocks"
import { saveScope } from "@/app/actions"
import type { ProjectMeta, AnalysisScope } from "@/lib/types"

interface ScopePageProps {
  params: { projectId: string }
}

export default function ScopePage({ params }: ScopePageProps) {
  const router = useRouter()
  const [projectMeta, setProjectMeta] = useState<Partial<ProjectMeta>>(mockProjectMeta)

  const [analysisScope, setAnalysisScope] = useState<Partial<AnalysisScope>>({
    ...mockAnalysisScope,
    lifecycle: mockAnalysisScope.lifecycle || "Gate-to-Gate",
    methodSet: mockAnalysisScope.methodSet || "EF 3.1",
    summary: mockAnalysisScope.summary || "",
    processOverview: {
      name: mockAnalysisScope.processOverview?.name || "",
      subProcesses: mockAnalysisScope.processOverview?.subProcesses || [],
      description: mockAnalysisScope.processOverview?.description || "",
      fileUrl: "",
    },
    dataQuality: {
      temporal: mockAnalysisScope.dataQuality?.temporal || "",
      technical: mockAnalysisScope.dataQuality?.technical || "",
      geographic: mockAnalysisScope.dataQuality?.geographic || "",
      source: mockAnalysisScope.dataQuality?.source || "primary",
    },
  })

  const [functionalUnit, setFunctionalUnit] = useState({
    unit: "1 ton",
    description: "철강 제품 1톤 생산",
    referenceFlow: "1000 kg",
  })

  const [exclusionCriteria, setExclusionCriteria] = useState({
    massThreshold: "1%",
    energyThreshold: "1%",
    environmentalThreshold: "1%",
    description: "",
  })

  const [assumptions, setAssumptions] = useState({
    technicalAssumptions: "",
    temporalAssumptions: "",
    geographicalAssumptions: "",
    otherAssumptions: "",
  })

  const [impactMethod, setImpactMethod] = useState({
    method: "EF 3.1",
    categories: ["기후변화", "오존층파괴", "산성화", "부영양화"] as string[],
    characterizationFactors: "EF 3.1",
    description: "",
  })

  const [isSaving, setIsSaving] = useState(false)

  const updateProcessOverview = (field: "name" | "description" | "fileUrl", value: string) => {
    setAnalysisScope((prev) => ({
      ...prev,
      processOverview: {
        ...prev.processOverview!,
        [field]: value,
      },
    }))
  }

  const updateDataQuality = (field: "temporal" | "technical" | "geographic", value: string) => {
    setAnalysisScope((prev) => ({
      ...prev,
      dataQuality: {
        ...prev.dataQuality!,
        [field]: value,
      },
    }))
  }

  // Server Action을 통한 저장 (마이크로서비스 연동 준비)
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        ...projectMeta,
        ...analysisScope,
        functionalUnit,
        exclusionCriteria,
        assumptions,
        impactMethod,
      }
      
      // Server Action 호출 - 나중에 마이크로서비스 API로 연결됨
      const result = await saveScope(params.projectId, payload as any)
      console.log("📦 저장된 Scope 데이터:", result)
      alert(`${result.message} (콘솔 참조)`)
    } catch (error) {
      console.error("저장 오류:", error)
      alert("저장 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = () => {
    router.push(`/lca/projects/${params.projectId}/lci`)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      updateProcessOverview("fileUrl", url)
    }
  }

  const impactCategories = [
    "기후변화",
    "오존층파괴",
    "산성화",
    "부영양화",
    "광화학산화물생성",
    "자원고갈",
    "생태독성",
    "인체독성",
  ]

  // 단계별 그룹화된 탭 구조
  const [currentStep, setCurrentStep] = useState(1)
  const [currentSubTab, setCurrentSubTab] = useState("meta")
  const [isFormValid, setIsFormValid] = useState(false)

  const steps = [
    {
      id: 1,
      title: "기본 정보",
      description: "프로젝트 기본 정보 설정",
      subTabs: [
        {
          id: "meta",
          label: "프로젝트 메타정보",
          content: (
            <ProjectMetaForm 
              initialData={projectMeta} 
              onChange={setProjectMeta}
              onValidationChange={setIsFormValid}
            />
          ),
        },
        {
          id: "functional-unit",
          label: "기준단위",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">기준단위 정의</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldRow label="기준단위" required>
                  <Input
                    value={functionalUnit.unit}
                    onChange={(e) => setFunctionalUnit((prev) => ({ ...prev, unit: e.target.value }))}
                    placeholder="예: 1 ton, 1 kg"
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="참조흐름" required>
                  <Input
                    value={functionalUnit.referenceFlow}
                    onChange={(e) => setFunctionalUnit((prev) => ({ ...prev, referenceFlow: e.target.value }))}
                    placeholder="예: 1000 kg"
                    className="input ring-primary"
                  />
                </FieldRow>
              </div>
              <FieldRow label="기준단위 설명">
                <TextArea
                  value={functionalUnit.description}
                  onChange={(e) => setFunctionalUnit((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="기준단위에 대한 상세 설명"
                  rows={3}
                  className="input ring-primary"
                />
              </FieldRow>
            </div>
          ),
        },
        {
          id: "product",
          label: "제품정보",
          content: (
            <ProductInfoForm
              initialData={projectMeta}
              onChange={(data) => setProjectMeta((prev) => ({ ...prev, ...data }))}
            />
          ),
        },
      ],
    },
    {
      id: 2,
      title: "분석 범위",
      description: "LCA 분석 범위 정의",
      subTabs: [
        {
          id: "lifecycle",
          label: "분석생애주기",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">분석 생애주기</h3>
              <LifecycleSelector
                value={analysisScope.lifecycle || "Gate-to-Gate"}
                onChange={(value) => setAnalysisScope((prev) => ({ ...prev, lifecycle: value as any }))}
              />
            </div>
          ),
        },
        {
          id: "process",
          label: "공정개요",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">철강 제조 공정 개요</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldRow label="공정명" required>
                  <Input
                    value={analysisScope.processOverview?.name ?? ""}
                    onChange={(e) => updateProcessOverview("name", e.target.value)}
                    placeholder="주요 제강 공정명"
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="공정도 파일">
                  <Input type="file" accept=".pdf,.png,.jpg" onChange={handleFileUpload} className="input ring-primary" />
                </FieldRow>
              </div>
              {analysisScope.processOverview?.fileUrl && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">업로드된 공정도 미리보기:</p>
                  <img
                    src={analysisScope.processOverview.fileUrl}
                    alt="공정도 미리보기"
                    className="mt-2 w-full max-h-64 object-contain border rounded"
                  />
                </div>
              )}
              <FieldRow label="공정 설명">
                <TextArea
                  value={analysisScope.processOverview?.description ?? ""}
                  onChange={(e) => updateProcessOverview("description", e.target.value)}
                  placeholder="철강 제조 공정에 대한 상세 설명"
                  rows={3}
                  className="input ring-primary"
                />
              </FieldRow>
            </div>
          ),
        },
        {
          id: "quality",
          label: "데이터품질요건",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">데이터 품질 요건</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldRow label="시간적 범위" required>
                  <Input
                    value={analysisScope.dataQuality?.temporal ?? ""}
                    onChange={(e) => updateDataQuality("temporal", e.target.value)}
                    placeholder="데이터 수집 기간"
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="기술적 범위" required>
                  <Input
                    value={analysisScope.dataQuality?.technical ?? ""}
                    onChange={(e) => updateDataQuality("technical", e.target.value)}
                    placeholder="제강 기술/공정 상태"
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="지리적 범위" required>
                  <Input
                    value={analysisScope.dataQuality?.geographic ?? ""}
                    onChange={(e) => updateDataQuality("geographic", e.target.value)}
                    placeholder="제철소/사업장"
                    className="input ring-primary"
                  />
                </FieldRow>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 3,
      title: "평가 설정",
      description: "영향평가 방법론 및 기준 설정",
      subTabs: [
        {
          id: "exclusion",
          label: "제외기준",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">제외 기준</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FieldRow label="질량 기준" required>
                  <Input
                    value={exclusionCriteria.massThreshold}
                    onChange={(e) => setExclusionCriteria((prev) => ({ ...prev, massThreshold: e.target.value }))}
                    placeholder="예: 1%"
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="에너지 기준" required>
                  <Input
                    value={exclusionCriteria.energyThreshold}
                    onChange={(e) => setExclusionCriteria((prev) => ({ ...prev, energyThreshold: e.target.value }))}
                    placeholder="예: 1%"
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="환경영향 기준" required>
                  <Input
                    value={exclusionCriteria.environmentalThreshold}
                    onChange={(e) =>
                      setExclusionCriteria((prev) => ({ ...prev, environmentalThreshold: e.target.value }))
                    }
                    placeholder="예: 1%"
                    className="input ring-primary"
                  />
                </FieldRow>
              </div>
              <FieldRow label="제외 기준 설명">
                <TextArea
                  value={exclusionCriteria.description}
                  onChange={(e) => setExclusionCriteria((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="제외 기준에 대한 상세 설명"
                  rows={3}
                  className="input ring-primary"
                />
              </FieldRow>
            </div>
          ),
        },
        {
          id: "assumptions",
          label: "가정및제한사항",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">가정 및 제한사항</h3>
              <div className="space-y-4">
                <FieldRow label="기술적 가정">
                  <TextArea
                    value={assumptions.technicalAssumptions}
                    onChange={(e) => setAssumptions((prev) => ({ ...prev, technicalAssumptions: e.target.value }))}
                    placeholder="기술적 가정사항"
                    rows={2}
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="시간적 가정">
                  <TextArea
                    value={assumptions.temporalAssumptions}
                    onChange={(e) => setAssumptions((prev) => ({ ...prev, temporalAssumptions: e.target.value }))}
                    placeholder="시간적 가정사항"
                    rows={2}
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="지리적 가정">
                  <TextArea
                    value={assumptions.geographicalAssumptions}
                    onChange={(e) => setAssumptions((prev) => ({ ...prev, geographicalAssumptions: e.target.value }))}
                    placeholder="지리적 가정사항"
                    rows={2}
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="기타 가정">
                  <TextArea
                    value={assumptions.otherAssumptions}
                    onChange={(e) => setAssumptions((prev) => ({ ...prev, otherAssumptions: e.target.value }))}
                    placeholder="기타 가정사항"
                    rows={2}
                    className="input ring-primary"
                  />
                </FieldRow>
              </div>
            </div>
          ),
        },
        {
          id: "impact",
          label: "영향평가방법론",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">영향평가 방법론</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldRow label="평가 방법" required>
                  <Input
                    value={impactMethod.method}
                    onChange={(e) => setImpactMethod((prev) => ({ ...prev, method: e.target.value }))}
                    placeholder="예: EF 3.1"
                    className="input ring-primary"
                  />
                </FieldRow>
                <FieldRow label="특성화 인자" required>
                  <Input
                    value={impactMethod.characterizationFactors}
                    onChange={(e) => setImpactMethod((prev) => ({ ...prev, characterizationFactors: e.target.value }))}
                    placeholder="예: EF 3.1"
                    className="input ring-primary"
                  />
                </FieldRow>
              </div>
              <FieldRow label="영향 범주">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {impactCategories.map((category) => {
                    const isSelected = (impactMethod.categories || []).includes(category)
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setImpactMethod((prev) => {
                            const current = prev.categories || []
                            return isSelected
                              ? { ...prev, categories: current.filter((c) => c !== category) }
                              : { ...prev, categories: [...current, category] }
                          })
                        }}
                        className={`px-3 py-2 rounded text-sm border ${
                          isSelected ? "bg-primary text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        {category}
                      </button>
                    )
                  })}
                </div>
              </FieldRow>
              <FieldRow label="방법론 설명">
                <TextArea
                  value={impactMethod.description}
                  onChange={(e) => setImpactMethod((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="선택한 영향평가 방법론에 대한 설명"
                  rows={3}
                  className="input ring-primary"
                />
              </FieldRow>
            </div>
          ),
        },
      ],
    },
    {
      id: 4,
      title: "요약",
      description: "최종 요약 및 검토",
      subTabs: [
        {
          id: "summary",
          label: "목적 및 범위 요약",
          content: (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">목적 및 범위 요약</h3>
              <TextArea
                value={analysisScope.summary || ""}
                onChange={(e) => setAnalysisScope((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="철강 제품 LCA 목적 및 범위에 대한 종합적인 요약"
                rows={5}
                className="input ring-primary"
              />
            </div>
          ),
        },
      ],
    },
  ]

  const currentStepData = steps.find(step => step.id === currentStep)
  const currentSubTabData = currentStepData?.subTabs.find(tab => tab.id === currentSubTab)

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">목적 및 범위 설정</h1>
          <p className="text-muted-foreground">철강 제품 LCA 연구의 목적과 범위를 정의합니다</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 메인 콘텐츠 */}
          <div className="flex-1">
                                                        {/* 단계별 네비게이션 */}
                      <div className="bg-card border border-border/30 rounded-lg p-6 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold text-foreground">단계별로 진행하기</h2>
                          <div className="text-sm text-muted-foreground">
                            {currentStep} / {steps.length} 단계
                          </div>
                        </div>

                        {/* 단계 표시 */}
                        <div className="flex space-x-2 mb-6">
                          {steps.map((step, index) => (
                            <button
                              key={step.id}
                              onClick={() => {
                                setCurrentStep(step.id)
                                setCurrentSubTab(step.subTabs[0].id)
                              }}
                              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                                currentStep === step.id
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                              }`}
                            >
                              <div className="text-sm font-medium">{step.title}</div>
                              <div className="text-xs opacity-80">{step.description}</div>
                            </button>
                          ))}
                        </div>

                        {/* 하위 탭 네비게이션 */}
                        {currentStepData && (
                          <div className="flex space-x-1 mb-6">
                            {currentStepData.subTabs.map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setCurrentSubTab(tab.id)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                  currentSubTab === tab.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 현재 탭 콘텐츠 */}
                        {currentSubTabData && (
                          <div className="border-t border-border/30 pt-6">
                            {currentSubTabData.content}
                          </div>
                        )}
                      </div>

                                  

                                  {/* 네비게이션 버튼 */}
                      <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep > 1) {
                    const prevStep = steps.find(s => s.id === currentStep - 1)
                    if (prevStep) {
                      setCurrentStep(prevStep.id)
                      setCurrentSubTab(prevStep.subTabs[0].id)
                    }
                  }
                }}
                disabled={currentStep === 1}
              >
                이전 단계
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "저장 중..." : "저장"}
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!isFormValid || isSaving}
                  className={!isFormValid ? "opacity-50 cursor-not-allowed" : ""}
                >
                  다음 단계 (LCI 입력)
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep < steps.length) {
                    const nextStep = steps.find(s => s.id === currentStep + 1)
                    if (nextStep) {
                      setCurrentStep(nextStep.id)
                      setCurrentSubTab(nextStep.subTabs[0].id)
                    }
                  }
                }}
                disabled={currentStep === steps.length}
              >
                다음 단계
              </Button>
            </div>
          </div>

          {/* 사이드바 미리보기 */}
          <aside className="w-full lg:w-80">
            <div className="sticky top-8 bg-card border border-border/30 rounded-lg p-6 shadow-sm max-h-[calc(100vh-12rem)] overflow-y-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                현재 입력값 미리보기
              </h3>
              <div className="space-y-3">
                <KeyValueRow label="프로젝트명" value={projectMeta.projectName} />
                <KeyValueRow label="담당자" value={`${projectMeta.owner?.name || ""} (${projectMeta.owner?.department || ""} ${projectMeta.owner?.position || ""})`} />
                <KeyValueRow label="연구기간" value={`${projectMeta.period?.start || ""} ~ ${projectMeta.period?.end || ""}`} />
                <KeyValueRow label="기준단위" value={functionalUnit.unit} />
                <KeyValueRow label="제품명" value={projectMeta.productName} />
                <KeyValueRow label="생애주기" value={analysisScope.lifecycle} />
                <KeyValueRow label="공정명" value={analysisScope.processOverview?.name} />
                <KeyValueRow label="평가 방법론" value={impactMethod.method} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
