import type React from "react"
import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[]
  error?: string
  label?: string
  helper?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", options = [], error, label, helper, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const helperId = helper && !error ? `${selectId}-helper` : undefined
    const errorId = error ? `${selectId}-error` : undefined

    return (
      <div className="w-full space-y-1">
        {label && (
          <Label htmlFor={selectId} className="text-sm font-medium">
            {label}
          </Label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-describedby={error ? errorId : helperId}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {helper && !error && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helper}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"
