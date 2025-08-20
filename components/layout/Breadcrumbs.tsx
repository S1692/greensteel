"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

export function Breadcrumbs() {
  const pathname = usePathname()

  const getBreadcrumbs = (path: string) => {
    if (path === "/") {
      return [{ name: "대시보드", href: "/" }]
    }

    const match = path.match(/\/lca\/projects\/([^/]+)/)
    const projectId = match ? match[1] : null

    if (projectId) {
      if (path.includes("/scope")) {
        return [
          { name: "대시보드", href: "/" },
          { name: `프로젝트 ${projectId}`, href: `/lca/projects/${projectId}` },
          { name: "목적 및 범위", href: path },
        ]
      }
      if (path.includes("/lci")) {
        return [
          { name: "대시보드", href: "/" },
          { name: `프로젝트 ${projectId}`, href: `/lca/projects/${projectId}` },
          { name: "LCI (인벤토리)", href: path },
        ]
      }
      if (path.includes("/lcia")) {
        return [
          { name: "대시보드", href: "/" },
          { name: `프로젝트 ${projectId}`, href: `/lca/projects/${projectId}` },
          { name: "LCIA (영향평가)", href: path },
        ]
      }
      if (path.includes("/interpretation")) {
        return [
          { name: "대시보드", href: "/" },
          { name: `프로젝트 ${projectId}`, href: `/lca/projects/${projectId}` },
          { name: "해석 및 분석", href: path },
        ]
      }
      if (path.includes("/report")) {
        return [
          { name: "대시보드", href: "/" },
          { name: `프로젝트 ${projectId}`, href: `/lca/projects/${projectId}` },
          { name: "LCA 보고서", href: path },
        ]
      }
    }

    return [{ name: "대시보드", href: "/" }]
  }

  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && <span className="mx-2 text-muted-foreground">{"/"}</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{breadcrumb.name}</span>
            ) : (
              <Link href={breadcrumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
