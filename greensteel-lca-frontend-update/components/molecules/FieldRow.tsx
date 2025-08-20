import React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FieldRowProps {
  label: string
  required?: boolean
  children: React.ReactNode
  helper?: string
  error?: string
  className?: string
  id?: string
}

export function FieldRow({
  label,
  required = false,
  children,
  helper,
  error,
  className,
  id,
}: FieldRowProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              id: fieldId,
              "aria-describedby": helper ? `${fieldId}-helper` : undefined,
              "aria-invalid": error ? "true" : undefined,
            })
          : children}
      </div>
      
      {helper && (
        <p id={`${fieldId}-helper`} className="text-xs text-muted-foreground">
          {helper}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
