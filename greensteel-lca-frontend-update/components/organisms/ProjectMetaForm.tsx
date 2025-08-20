"use client"

import { useState, useEffect } from "react"
import { FieldRow } from "../molecules/FieldRow"
import { Input } from "../atoms/Input"
import { TextArea } from "../atoms/TextArea"
import { Select } from "../atoms/Select"
import type { ProjectMeta } from "@/lib/types"

interface ProjectMetaFormProps {
  initialData?: Partial<ProjectMeta>
  onChange: (data: Partial<ProjectMeta>) => void
  onValidationChange?: (isValid: boolean) => void
}

export function ProjectMetaForm({ initialData = {}, onChange, onValidationChange }: ProjectMetaFormProps) {
  const [formData, setFormData] = useState<Partial<ProjectMeta>>({
    ...initialData,
    period: initialData.period || { start: "", end: "" },
    approvalStatus: initialData.approvalStatus || { status: "pending" },
    createdAt: initialData.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: initialData.updatedAt || new Date().toISOString().split('T')[0],
    // 로그인한 사용자 정보로 자동 설정 (DB에서 가져올 예정)
    owner: initialData.owner || { 
      name: "김철강", // TODO: 로그인 사용자 정보로 교체
      department: "철강 LCA 연구팀", // TODO: 로그인 사용자 정보로 교체
      position: "수석연구원" // TODO: 로그인 사용자 정보로 교체
    },
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const updateField = (field: keyof ProjectMeta, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onChange(updated)
  }

  const updatePeriodField = (field: "start" | "end", value: string) => {
    const currentPeriod = formData.period || { start: "", end: "" }
    const updatedPeriod = { ...currentPeriod, [field]: value }
    updateField("period", updatedPeriod)
  }

  const updateApprovalStatus = (field: keyof ProjectMeta['approvalStatus'], value: any) => {
    const currentStatus = formData.approvalStatus || { status: "pending" }
    const updatedStatus = { ...currentStatus, [field]: value }
    updateField("approvalStatus", updatedStatus)
  }

  const updateOwnerField = (field: keyof ProjectMeta['owner'], value: string) => {
    const currentOwner = formData.owner || { name: "", department: "", position: "" }
    const updatedOwner = { ...currentOwner, [field]: value }
    updateField("owner", updatedOwner)
  }

  // 필수 필드 검증 (사용자가 직접 입력하는 필드만 검증)
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.projectName?.trim()) {
      newErrors.projectName = "프로젝트명을 입력해주세요"
    }

    if (!formData.reason?.trim()) {
      newErrors.reason = "연구 수행 이유를 입력해주세요"
    }

    if (!formData.period?.start) {
      newErrors.startDate = "연구 시작일을 입력해주세요"
    }

    if (!formData.period?.end) {
      newErrors.endDate = "연구 종료일을 입력해주세요"
    }

    // 날짜 유효성 검증
    if (formData.period?.start && formData.period?.end) {
      if (new Date(formData.period.start) > new Date(formData.period.end)) {
        newErrors.period = "종료일은 시작일 이후여야 합니다"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 데이터 변경 시 검증 실행
  useEffect(() => {
    const isValid = validateForm()
    onValidationChange?.(isValid)
  }, [formData])

  const approvalStatusOptions = [
    { value: "pending", label: "대기 중" },
    { value: "approved", label: "승인됨" },
    { value: "rejected", label: "반려됨" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">프로젝트 메타정보</h3>
        <p className="text-sm text-muted-foreground mt-1">
          담당자 정보는 로그인 정보에서 자동으로 설정되며, 승인 상태는 관리자 권한으로 관리됩니다.
        </p>
      </div>

      {/* 사용자 입력 필드 */}
      <div className="border-t border-border/30 pt-6">
        <h4 className="text-md font-medium text-foreground mb-4">사용자 입력 정보</h4>
        
        <div className="space-y-6">
          <FieldRow label="프로젝트명" required error={errors.projectName}>
            <Input
              value={formData.projectName || ""}
              onChange={(e) => updateField("projectName", e.target.value)}
              placeholder="프로젝트명을 입력하세요"
              className="bg-input border-border text-foreground"
            />
          </FieldRow>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldRow label="연구 시작일" required error={errors.startDate}>
              <Input
                type="date"
                value={formData.period?.start || ""}
                onChange={(e) => updatePeriodField("start", e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </FieldRow>

            <FieldRow label="연구 종료일" required error={errors.endDate || errors.period}>
              <Input
                type="date"
                value={formData.period?.end || ""}
                onChange={(e) => updatePeriodField("end", e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </FieldRow>
          </div>

          <FieldRow label="연구 수행 이유" required error={errors.reason}>
            <TextArea
              value={formData.reason || ""}
              onChange={(e) => updateField("reason", e.target.value)}
              placeholder="LCA 연구를 수행하는 목적과 이유를 설명하세요"
              rows={3}
              className="bg-input border-border text-foreground"
            />
          </FieldRow>
        </div>
      </div>

      {/* 자동 설정 필드 */}
      <div className="border-t border-border/30 pt-6">
        <h4 className="text-md font-medium text-foreground mb-4">자동 설정 정보</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldRow label="담당자명" required>
            <Input
              value={formData.owner?.name || ""}
              placeholder="로그인 사용자 정보"
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>

          <FieldRow label="부서" required>
            <Input
              value={formData.owner?.department || ""}
              placeholder="로그인 사용자 정보"
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>

          <FieldRow label="직위" required>
            <Input
              value={formData.owner?.position || ""}
              placeholder="로그인 사용자 정보"
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>

          <FieldRow label="프로젝트 생성일" required>
            <Input
              type="date"
              value={formData.createdAt || ""}
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>

          <FieldRow label="프로젝트 수정일" required>
            <Input
              type="date"
              value={formData.updatedAt || ""}
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>

          <FieldRow label="승인 상태" required>
            <Select
              value={formData.approvalStatus?.status || "pending"}
              options={approvalStatusOptions}
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>
        </div>
      </div>

      {/* 승인 상태에 따른 추가 필드 (관리자 권한으로 자동 설정) */}
      {formData.approvalStatus?.status === "approved" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldRow label="승인 일자">
            <Input
              type="date"
              value={formData.approvalStatus?.approvedAt || ""}
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>
          <FieldRow label="승인자">
            <Input
              value={formData.approvalStatus?.approvedBy || ""}
              placeholder="관리자 정보"
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>
        </div>
      )}

      {formData.approvalStatus?.status === "rejected" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldRow label="반려 일자">
              <Input
                type="date"
                value={formData.approvalStatus?.rejectedAt || ""}
                className="bg-muted/50 border-border text-muted-foreground"
                disabled
              />
            </FieldRow>
            <FieldRow label="반려자">
              <Input
                value={formData.approvalStatus?.rejectedBy || ""}
                placeholder="관리자 정보"
                className="bg-muted/50 border-border text-muted-foreground"
                disabled
              />
            </FieldRow>
          </div>
          <FieldRow label="반려 의견">
            <TextArea
              value={formData.approvalStatus?.rejectionReason || ""}
              placeholder="관리자 반려 사유"
              rows={3}
              className="bg-muted/50 border-border text-muted-foreground"
              disabled
            />
          </FieldRow>
        </div>
      )}
    </div>
  )
}

