"use client"

import type { Project } from "@/lib/types"
import { Card } from "@/components/atoms/Card"
import { useCallback } from "react"

interface ProjectListProps {
  projects: Project[]
  onProjectClick: (projectId: string) => void
  onNewProject?: () => void
}

const statusToBadgeClass: Record<Project["status"], string> = {
  "진행 중": "gs-badge gs-badge-approved",
  "완료": "gs-badge gs-badge-approved",
  draft: "gs-badge gs-badge-draft",
  frozen: "gs-badge gs-badge-frozen",
  approved: "gs-badge gs-badge-approved",
}

const statusToLabel: Record<Project["status"], string> = {
  "진행 중": "진행 중",
  "완료": "완료",
  draft: "초안",
  frozen: "반려",
  approved: "승인",
}

export function ProjectList({ projects, onProjectClick, onNewProject }: ProjectListProps) {
  // 키보드 접근(Enter/Space)으로 카드 오픈
  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onProjectClick(id)
      }
    },
    [onProjectClick],
  )

  if (!projects || projects.length === 0) {
    return (
      <section
        aria-labelledby="project-empty-title"
        className="space-y-6 text-center py-12 border border-dashed border-border/60 rounded-xl"
      >
        <h2 id="project-empty-title" className="font-semibold text-xl text-foreground mb-2">
          아직 생성된 프로젝트가 없습니다
        </h2>
        <p className="text-muted-foreground mb-6">새로운 LCA 프로젝트를 시작해 보세요.</p>
        {onNewProject && (
          <button
            type="button"
            onClick={onNewProject}
            className="btn-primary px-6 py-3 rounded-lg font-semibold hover:scale-[1.02] transition-transform"
            aria-label="새 프로젝트 만들기"
          >
            새 프로젝트 만들기
          </button>
        )}
      </section>
    )
  }

  return (
    <section aria-labelledby="project-list-title" className="space-y-6">
      <h2 id="project-list-title" className="font-semibold text-xl text-foreground">
        최근 프로젝트
      </h2>

      {/* list semantics for a11y */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <li key={project.id}>
            <Card
              padding="none"
              clickable
              onClick={() => onProjectClick(project.id)}
              className="p-5 hover:shadow-lg transition-shadow focus-within:ring-1 focus-within:ring-primary"
              role="button"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => handleCardKeyDown(e, project.id)}
              aria-label={`${project.name} 프로젝트 열기`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="gs-title">{project.name}</h3>
                <span className={statusToBadgeClass[project.status]} aria-label={`상태: ${statusToLabel[project.status]}`}>
                  {statusToLabel[project.status]}
                </span>
              </div>

              <div className="gs-meta mb-4 text-sm">
                생성일: {project.createdAt} / 수정일: {project.updatedAt}
              </div>

              <div className="flex justify-end">
                {/* 카드 자체도 클릭되므로 버튼 클릭 시 전파 방지 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onProjectClick(project.id)
                  }}
                  className="btn-primary text-sm px-3 py-1 rounded"
                  aria-label={`${project.name} 열기`}
                >
                  열기
                </button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
