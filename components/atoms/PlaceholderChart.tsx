interface PlaceholderChartProps {
  title?: string
  height?: number
  className?: string
  bars?: number[] // 각 막대의 높이 비율 (0~100)
}

export function PlaceholderChart({
  title,
  height = 200,
  className = "",
  bars = [60, 80, 45, 70], // 기본 4개
}: PlaceholderChartProps) {
  return (
    <div
      className={`border border-border bg-background p-4 rounded-lg shadow-sm ${className}`}
      role="img"
      aria-label="차트 자리 표시자"
    >
      {title && (
        <h3 className="text-sm font-medium text-foreground mb-3">
          {title}
        </h3>
      )}
      <div
        className="relative bg-muted border border-border rounded-md"
        style={{ height: `${height}px` }}
      >
        {/* Mock chart axes */}
        <div className="absolute bottom-0 left-8 right-4 h-px bg-border"></div>
        <div className="absolute bottom-4 left-8 top-4 w-px bg-border"></div>

        {/* Mock data bars */}
        {bars.map((value, i) => (
          <div
            key={i}
            className={`absolute bottom-4 w-8 ${
              i % 2 === 0 ? "bg-accent" : "bg-muted-foreground"
            }`}
            style={{ left: `${12 + i * 12}px`, height: `${value}%` }}
          ></div>
        ))}

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          Chart Placeholder
        </div>
      </div>
    </div>
  )
}
