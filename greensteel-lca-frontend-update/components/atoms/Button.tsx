import type React from "react"
import { forwardRef } from "react"
import { Loader2 } from "lucide-react"
import { Button as UIButton } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ComponentProps<typeof UIButton> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      children,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      fullWidth = false,
      variant = "default",
      size = "default",
      ...props
    },
    ref,
  ) => {
    return (
      <UIButton
        ref={ref}
        className={cn(
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        {...props}
      >
        {/* 왼쪽 아이콘 */}
        {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}

        {/* 로딩 상태 */}
        {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" aria-hidden="true" />}

        {/* 텍스트 */}
        <span>{children}</span>

        {/* 오른쪽 아이콘 */}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </UIButton>
    )
  },
)

Button.displayName = "Button"
