import type React from "react"
import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  helper?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = "", error, label, helper, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const helperId = helper && !error ? `${textareaId}-helper` : undefined
    const errorId = error ? `${textareaId}-error` : undefined

    return (
      <div className="w-full space-y-1">
        {label && (
          <Label htmlFor={textareaId} className="text-sm font-medium">
            {label}
          </Label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          value={props.value ?? ""}
          className={cn(
            "flex min-h-[60px] w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
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

TextArea.displayName = "TextArea"
