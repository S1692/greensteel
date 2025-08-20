import type React from "react"

interface KeyValueRowProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function KeyValueRow({ label, value, className = "" }: KeyValueRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-2 border-b border-border/20 last:border-b-0 ${className}`}
    >
      <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground truncate">{value}</span>
    </div>
  )
}
