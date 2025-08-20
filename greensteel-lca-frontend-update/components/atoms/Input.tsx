import type React from "react"
import { forwardRef } from "react"
import { Input as UIInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<typeof UIInput> {
  error?: string
  label?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, label, helper, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const helperId = helper && !error ? `${inputId}-helper` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="w-full space-y-1">
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium">
            {label}
          </Label>
        )}
        
        <UIInput
          ref={ref}
          id={inputId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-describedby={error ? errorId : helperId}
          aria-invalid={!!error}
          {...props}
        />

        {helper && !error && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helper}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-xs text-destructive font-medium">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
