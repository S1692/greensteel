"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  const getProjectId = () => {
    const match = pathname.match(/\/lca\/projects\/([^/]+)/)
    return match ? match[1] : "proj-001"
  }

  const projectId = getProjectId()

  const navigationItems = [
    { name: "대시보드", href: "/", section: "main" },
    { name: "목적 및 범위", href: `/lca/projects/${projectId}/scope`, section: "workflow" },
    { name: "LCI", href: `/lca/projects/${projectId}/lci`, section: "workflow" },
    { name: "LCIA", href: `/lca/projects/${projectId}/lcia`, section: "workflow" },
    { name: "해석", href: `/lca/projects/${projectId}/interpretation`, section: "workflow" },
    { name: "보고서", href: `/lca/projects/${projectId}/report`, section: "workflow" },
  ]

  const renderLinks = (section: string) =>
    navigationItems
      .filter((item) => item.section === section)
      .map((item) => {
        const isActive = pathname === item.href
        const linkClassName = isActive
          ? "block px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground transition-colors"
          : "block px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"

        return (
          <li key={item.name}>
            <Link href={item.href} className={linkClassName} onClick={onClose}>
              {item.name}
            </Link>
          </li>
        )
      })

  return (
    <aside className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">메인</h3>
            <ul className="space-y-1">{renderLinks("main")}</ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">LCA 워크플로우</h3>
            <ul className="space-y-1">{renderLinks("workflow")}</ul>
          </div>
        </nav>
      </div>
      {/* 모바일에서 닫기 버튼 */}
      {onClose && (
        <div className="p-4 border-t border-border md:hidden">
          <button
            className="w-full rounded-lg bg-primary text-primary-foreground py-2 font-medium hover:bg-primary/90 transition-colors"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      )}
    </aside>
  )
}
