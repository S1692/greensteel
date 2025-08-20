import type React from "react"

interface PageShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <main 
      role="main" 
      className="mx-auto max-w-6xl p-4 md:p-6"
      aria-labelledby="page-title"
      aria-describedby={subtitle ? "page-subtitle" : undefined}
    >
      <header className="mb-6">
        <h1 
          id="page-title" 
          className="text-xl md:text-2xl font-bold text-primary mb-2"
        >
          {title}
        </h1>
        {subtitle && (
          <p id="page-subtitle" className="text-secondary text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </header>
      <section className="space-y-6">
        {children}
      </section>
    </main>
  )
}
